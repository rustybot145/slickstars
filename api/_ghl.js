/* Shared GoHighLevel wiring. Files starting with _ aren't routes on Vercel.

   These IDs aren't secrets — without the token they do nothing — but each can
   be overridden from the environment if the account is ever rebuilt. */

const LOCATION_ID = process.env.GHL_LOCATION_ID || "3EJu8Av87OgDsOXd6Ufv";
const PIPELINE_ID = process.env.GHL_PIPELINE_ID || "lh287U4Pkzg7HeZYiQHr";
const STAGE_NEW_LEAD = process.env.GHL_STAGE_ID || "e8aa91b9-a89c-42b7-8e93-41f5562d56fa";
const CALENDAR_ID = process.env.GHL_CALENDAR_ID || "YjXz7ljA2GHW9cPEQygn";
const TZ = process.env.GHL_TIMEZONE || "America/New_York";

const FIELD = { year: "GZWzgVoxPmrNmAOnrn1L", make: "rUQ2Dk81tXQ1QoRmEvmY", model: "aRbtMCJGB0Xi3KtyEQw6" };
const API = "https://services.leadconnectorhq.com";

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

const headers = (key, version = "2021-07-28") => ({
  authorization: `Bearer ${key}`,
  "content-type": "application/json",
  accept: "application/json",
  version,
});

async function call(path, key, { method = "GET", body, version } = {}) {
  const r = await fetch(API + path, {
    method,
    headers: headers(key, version),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  if (!r.ok) throw Object.assign(new Error(`${path} ${r.status}`), { status: r.status, detail: text.slice(0, 300) });
  return json || {};
}

module.exports = { LOCATION_ID, PIPELINE_ID, STAGE_NEW_LEAD, CALENDAR_ID, TZ, FIELD, apiKey, call };
