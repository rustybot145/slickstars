/* Open appointment slots, straight off the GoHighLevel calendar.

   The site asks this instead of showing a free-text date box, so a customer
   can only ever pick a time the calendar actually has open. Nothing here is
   cached — a slot taken thirty seconds ago is gone from the next response. */

const { CALENDAR_ID, TZ, apiKey, call } = require("./_ghl.js");

const DAYS_AHEAD = 21;

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  const key = apiKey();
  if (!key) return res.status(500).json({ error: "No GoHighLevel token in the environment." });

  // start tomorrow: nobody is booking a headliner install for this afternoon
  const from = new Date(); from.setDate(from.getDate() + 1); from.setHours(0, 0, 0, 0);
  const to = new Date(from); to.setDate(to.getDate() + DAYS_AHEAD);

  try {
    const raw = await call(
      `/calendars/${CALENDAR_ID}/free-slots?startDate=${from.getTime()}&endDate=${to.getTime()}&timezone=${encodeURIComponent(TZ)}`,
      key,
      { version: "2021-04-15" }
    );

    /* GHL returns an object keyed by date, each holding { slots: [ISO strings] },
       plus some non-date bookkeeping keys. Keep the dates, drop the rest. */
    const days = Object.entries(raw)
      .filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && (v?.slots?.length || Array.isArray(v)))
      .map(([date, v]) => ({ date, slots: (v.slots || v).slice(0, 40) }))
      .filter((d) => d.slots.length)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 14);

    // don't let a browser or a CDN serve a stale picture of the calendar
    res.setHeader("cache-control", "no-store, max-age=0");
    return res.status(200).json({ ok: true, timezone: TZ, days });
  } catch (e) {
    console.error("slots", e.message, e.detail || "");
    return res.status(502).json({ error: "Couldn't read the calendar." });
  }
};
