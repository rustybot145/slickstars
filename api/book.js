/* Booking request -> GoHighLevel. Vercel serverless, no dependencies.

   Creates (or updates) the contact, drops an opportunity into "New Lead 💫"
   on the Main Pipeline, and attaches a formatted note with everything they
   filled in. Needs the GHL private integration token in the environment.

   These IDs aren't secrets — without the token they do nothing — but every
   one can be overridden from the environment if the account is ever rebuilt. */

const LOCATION_ID = process.env.GHL_LOCATION_ID || "3EJu8Av87OgDsOXd6Ufv";
const PIPELINE_ID = process.env.GHL_PIPELINE_ID || "lh287U4Pkzg7HeZYiQHr";
const STAGE_NEW_LEAD = process.env.GHL_STAGE_ID || "e8aa91b9-a89c-42b7-8e93-41f5562d56fa";

// custom fields that already exist in the account
const FIELD = { year: "GZWzgVoxPmrNmAOnrn1L", make: "rUQ2Dk81tXQ1QoRmEvmY", model: "aRbtMCJGB0Xi3KtyEQw6" };

const API = "https://services.leadconnectorhq.com";
const HEADERS = (key) => ({
  authorization: `Bearer ${key}`,
  "content-type": "application/json",
  accept: "application/json",
  version: "2021-07-28",
});

/* Vercel env names are case-sensitive and this one got named GHL_api, so take
   that first and then fall back to any ghl-ish name holding a real token
   rather than fail silently on a rename. */
const apiKey = () =>
  process.env.GHL_api ||
  process.env.GHL_API ||
  process.env.GHL_API_KEY ||
  Object.entries(process.env).find(
    ([k, v]) => /ghl|highlevel|leadconnector/i.test(k) && /^(pit-|ey)[\w.\-]{20,}$/.test(v || "")
  )?.[1];

// US numbers to E.164 — GHL silently drops anything else
const toE164 = (raw) => {
  const d = String(raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d[0] === "1") return `+${d}`;
  return String(raw).trim().startsWith("+") ? `+${d}` : "";
};

/* The note is grouped rather than dumped as one flat list: the car first,
   then what they asked for, then how to reach them, then their own words.
   Anything the form adds later that isn't mapped still lands under DETAILS,
   so a new question can never go missing. */
const SECTIONS = [
  ["THE CAR", ["Vehicle", "Roof"]],
  ["WHAT THEY WANT", ["Install", "Ceiling", "Extras"]],
  ["TIMING", ["Timing"]],
  ["HOW TO REACH THEM", ["Contact", "Found us via"]],
];
const OWN_WORDS = "Notes";

function buildNote(rows, when) {
  const map = new Map(rows.map(([k, v]) => [String(k), String(v)]));
  const used = new Set(["Name"]);
  const out = [`BOOKING REQUEST — ${when}`, ""];

  const PAD = 14;
  for (const [title, labels] of SECTIONS) {
    const present = labels.filter((l) => map.get(l) && map.get(l) !== "—");
    present.forEach((l) => used.add(l));
    if (!present.length) continue;
    // a lone label that just restates its own heading is noise
    const lines =
      present.length === 1 && title.includes(present[0].toUpperCase())
        ? [`  ${map.get(present[0])}`]
        : present.map((l) => `  ${(l + ":").padEnd(PAD)}${map.get(l)}`);
    out.push(title, ...lines, "");
  }

  const leftover = [...map].filter(([k, v]) => !used.has(k) && k !== OWN_WORDS && v && v !== "—" && v !== "None");
  if (leftover.length) {
    out.push("DETAILS", ...leftover.map(([k, v]) => `  ${(k + ":").padEnd(PAD)}${v}`), "");
  }

  const words = map.get(OWN_WORDS);
  if (words && words !== "None") out.push("IN THEIR WORDS", `  ${words}`, "");

  out.push("— submitted from the booking form on the website");
  return out.join("\n");
}

async function ghl(path, key, body) {
  const r = await fetch(API + path, { method: "POST", headers: HEADERS(key), body: JSON.stringify(body) });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  if (!r.ok) throw Object.assign(new Error(`${path} ${r.status}`), { status: r.status, detail: text.slice(0, 300) });
  return json || {};
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = apiKey();
  if (!key) return res.status(500).json({ error: "No GoHighLevel token in the environment (set GHL_api)." });

  const { name = "", phone = "", email = "", ig = "", website = "", vehicle = {}, rows = [] } = req.body || {};
  if (website) return res.status(200).json({ ok: true }); // honeypot: bots fill it, people can't see it
  if (!String(name).trim()) return res.status(400).json({ error: "Name is required." });
  if (!Array.isArray(rows) || !rows.length) return res.status(400).json({ error: "Nothing to send." });

  const full = String(name).trim().slice(0, 80);
  const [first, ...rest] = full.split(/\s+/);
  const e164 = toE164(phone);

  const customFields = [
    vehicle.year && { id: FIELD.year, field_value: String(vehicle.year).replace(/\D/g, "").slice(0, 4) },
    vehicle.make && { id: FIELD.make, field_value: String(vehicle.make).slice(0, 40) },
    vehicle.model && { id: FIELD.model, field_value: String(vehicle.model).slice(0, 40) },
  ].filter(Boolean);

  try {
    const up = await ghl("/contacts/upsert", key, {
      locationId: LOCATION_ID,
      firstName: first,
      lastName: rest.join(" "),
      name: full,
      ...(e164 ? { phone: e164 } : {}),
      ...(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? { email: email.trim() } : {}),
      source: "Website booking form",
      tags: ["website-booking", "new lead"],
      ...(customFields.length ? { customFields } : {}),
    });

    const contactId = up?.contact?.id || up?.id;
    if (!contactId) throw new Error("No contact id came back from GHL");

    // the card has to be readable at a glance in the pipeline
    const car = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ").trim();
    await ghl("/opportunities/", key, {
      locationId: LOCATION_ID,
      pipelineId: PIPELINE_ID,
      pipelineStageId: STAGE_NEW_LEAD,
      name: car ? `${full} — ${car}`.slice(0, 100) : full,
      status: "open",
      contactId,
    });

    // best effort: a missing note is worth far less than a lost lead
    const when = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York", weekday: "short", day: "numeric", month: "short",
      hour: "numeric", minute: "2-digit",
    });
    try {
      await ghl(`/contacts/${contactId}/notes`, key, { body: buildNote(rows, when).slice(0, 5000) });
    } catch (e) {
      console.error("note failed", e.message, e.detail || "");
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("ghl", e.message, e.detail || "");
    return res.status(502).json({ error: "GoHighLevel rejected it." });
  }
};
