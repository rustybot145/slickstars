/* Slick Stars — one file for both pages. No build step, no dependencies. */

// ── SET THIS ────────────────────────────────────────────────
// The shop's number, in +1XXXXXXXXXX form. Left empty, the booking form
// copies the request to the clipboard and opens the Instagram DM instead.
const SHOP_PHONE = "";
const SHOP_IG = "https://ig.me/m/slickstars_";   // fallback only — the form posts to /api/book first
// ────────────────────────────────────────────────────────────

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, props) => Object.assign(document.createElement(tag), props);

$("#yr").textContent = new Date().getFullYear();

/* ── nav goes solid once you leave the hero ─────────────── */
const nav = $("#nav");
if (nav) {
  const onScroll = () => (nav.dataset.stuck = String(scrollY > 40));
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── scroll reveal ──────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries, obs) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      obs.unobserve(e.target);
    }),
  { rootMargin: "0px 0px -10% 0px" }
);
$$("[data-reveal]").forEach((n) => revealObserver.observe(n));

/* ── star field ─────────────────────────────────────────── */
/* Mostly ice-white with a few cool and warm ones. A real sky isn't one colour,
   but nothing here is saturated enough to read as colour — it just stops the
   field looking printed. */
const STAR_COLOURS = [["#EDF3FF", 60], ["#FFFFFF", 18], ["#C3D9FF", 13], ["#FFE7C2", 9]];
const starColour = () => {
  let r = Math.random() * 100;
  for (const [hex, weight] of STAR_COLOURS) if ((r -= weight) <= 0) return hex;
  return STAR_COLOURS[0][0];
};

const seedSky = (host, n) => {
  if (!host) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const star = el("i");
    const size = Math.random();
    star.style.left = `${(Math.random() * 100).toFixed(2)}%`;
    star.style.top = `${(Math.random() * 100).toFixed(2)}%`;
    star.style.setProperty("--c", starColour());
    star.style.setProperty("--s", `${(size * 1.6 + 0.8).toFixed(1)}px`);
    star.style.setProperty("--o", (0.26 + size * 0.42).toFixed(2)); // bigger ones burn brighter
    star.style.setProperty("--d", `${(Math.random() * 6).toFixed(2)}s`);
    star.style.setProperty("--t", `${(3.2 + Math.random() * 4).toFixed(1)}s`);
    frag.append(star);
  }
  host.append(frag);
};

// one fixed field behind the whole page; the count follows the viewport so a
// phone doesn't get a desktop's worth of animated nodes
seedSky($("#pageSky"), Math.round(Math.min(200, Math.max(45, (innerWidth * innerHeight) / 7600))));

/* ── hero video ─────────────────────────────────────────── */
const heroVideos = $$(".hero__video");
if (heroVideos.length && !reduced) {
  // Safari checks these as properties, not only attributes, before it will autoplay
  heroVideos.forEach((v) => { v.muted = true; v.playsInline = true; });

  const roll = () => heroVideos.forEach((v) => v.play().catch(() => {}));
  new IntersectionObserver(
    ([e]) => (e.isIntersecting ? roll() : heroVideos.forEach((v) => v.pause())),
    { threshold: 0 }
  ).observe(heroVideos[0]);
  heroVideos.forEach((v) => ["loadedmetadata", "canplay"].forEach((e) => v.addEventListener(e, roll, { once: true })));
  addEventListener("pageshow", roll);
  document.addEventListener("visibilitychange", () => document.hidden || roll());
  // Low Power Mode refuses autoplay whatever the page does — first touch counts as consent
  ["pointerdown", "touchstart"].forEach((e) => addEventListener(e, roll, { once: true, passive: true }));
  roll();
} else {
  $$(".hero__video").forEach((v) => { v.removeAttribute("autoplay"); v.load(); }); // leaves the poster up
}

/* ── the work grid ──────────────────────────────────────── */
/* [file, title, spec, alt] — every clip is the shop's own, straight off @slickstars_ */
const WORK = [
  ["tesla-night", "Tesla", "Starlight roof · ambient lines",
   "Tesla cabin at night, the ceiling filled with cyan and white points and a lit line behind the seats"],
  ["custom-logo", "A logo in the roof", "Spelled out in fiber",
   "A star ceiling in violet with a custom logo picked out in brighter points among the stars"],
  ["cadillac-spectrum", "Cadillac", "Full-spectrum dash and doors",
   "Cadillac cabin at night with a full-spectrum ambient line across the dash and down the door card"],
  ["underglow", "Underglow", "Full spectrum, wheel to wheel",
   "A car at night with full-spectrum underglow washing color across the road beneath it"],
  ["bench-test", "Bench test", "Lit before it goes back in",
   "A headliner off the car on stands, packed edge to edge with white points and a shooting star"],
  ["red-cabin", "Red leather build", "Ambient lines, dash to doors",
   "A cabin with red leather seats at night, ambient lines running the dash and both door cards"],
  ["tesla-fiber", "Tesla headliner", "Every strand pulled by hand",
   "A Tesla headliner face down on a bench with hundreds of loose fiber-optic strands pulled through"],
  ["night-spectrum", "Night scene", "Stars over a spectrum line",
   "Car interior at night, star ceiling above and a spectrum ambient line along the windscreen header"],
  ["honda-stars", "Honda", "Multicolor roof, sunroof cutout",
   "Honda cabin with a multicolor star ceiling arcing around the sunroof, dashboard lit red below"],
  ["panel-lit", "Sunroof headliner", "Points laid around the cutout",
   "A headliner with a sunroof cutout, off the car and lit, points spread evenly around the opening"],
  ["cadillac-ambient", "Cadillac", "One color across every zone",
   "Cadillac cabin washed green by the ambient lighting, the line running the length of the dash"],
  ["daylight-stars", "Star roof", "Still lit at noon",
   "A star ceiling seen in daylight through an open garage door, points still clearly lit"],
];

/* ── clips that start themselves once they're on screen ─── */
/* preload:"none" means nothing downloads until you scroll to it, and pausing on
   the way out stops a phone decoding every clip on the page at once. Observe
   either a video, or a wrapper carrying the video on _vid. */
const inViewPlayer = reduced
  ? null
  : new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const vid = e.target._vid || e.target;
          if (e.isIntersecting) {
            e.target.dataset.playing = "true";
            vid.play().catch(() => {});         // the poster still shows if autoplay is refused
          } else {
            vid.pause();                         // keep what's buffered, stop the decode
          }
        }),
      { rootMargin: "150px 0px", threshold: 0.01 }
    );
const playInView = (node) => inViewPlayer && inViewPlayer.observe(node);

// the two install rows he wanted moving rather than still
$$(".rowitem__shot video, video.rowitem__shot").forEach((v) => {
  v.muted = true;                                // Safari checks the property, not the attribute
  v.playsInline = true;
  playInView(v);
});

const grid = $("#work-grid");
if (grid) {

  const lb = $("#lb"), lbVideo = $("#lbVideo"), lbCap = $("#lbCap");

  WORK.forEach(([file, title, spec, alt]) => {
    const fig = el("figure", { className: "tile" });

    // the still covers the gap until the clip has frames to show
    fig.append(
      el("img", {
        src: `video/work/${file}.jpg`,
        width: 720, height: 1280,
        loading: "lazy", decoding: "async",
        alt,
      })
    );

    const vid = el("video", {
      src: `video/work/${file}.mp4`,
      poster: `video/work/${file}.jpg`,
      width: 720, height: 1280,
      muted: true, loop: true, playsInline: true, preload: "none",
      ariaHidden: "true", tabIndex: -1,
    });
    // Safari checks these as properties, not attributes, before it will autoplay
    vid.muted = true;
    vid.playsInline = true;
    fig.append(vid);

    // The grid plays itself, the way his feed does. preload:"none" means the
    // download only starts when a tile comes into view, and pausing on the way
    // out keeps a phone from decoding twelve clips at once.
    fig._vid = vid;
    playInView(fig);

    fig.insertAdjacentHTML(
      "beforeend",
      `<span class="tile__chip" aria-hidden="true">Watch</span>
       <figcaption class="tile__cap"><b></b><span></span></figcaption>`
    );
    $("b", fig).textContent = title;
    $(".tile__cap span", fig).textContent = spec;

    const btn = el("button", {
      type: "button",
      className: "tile__btn",
      textContent: `Watch ${title} — ${spec}`,
    });
    btn.addEventListener("click", () => {
      lbVideo.src = `video/work/${file}.mp4`;
      lbVideo.poster = `video/work/${file}.jpg`;
      lbVideo.setAttribute("aria-label", alt);
      lbCap.textContent = `${title} — ${spec}`;
      lb.showModal();
      lbVideo.play().catch(() => {});
    });
    fig.append(btn);

    grid.append(fig);
  });

  // closing has to stop the download too, or the clip keeps buffering behind the page
  const shut = () => {
    lbVideo.pause();
    lbVideo.removeAttribute("src");
    lbVideo.load();
    if (lb.open) lb.close();
  };
  $("#lbClose").addEventListener("click", shut);
  lb.addEventListener("close", shut);
  // click outside the video, on the dialog's own backdrop area
  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target.classList.contains("lb__in")) shut();
  });
}

/* ── booking quiz: one step at a time, then the whole thing ── */
const form = $("#bookForm");
if (form) {
  const val = (id) => $("#" + id).value.trim();
  const checked = (name) => $$(`input[name=${name}]:checked`).map((c) => c.value);
  const one = (name, fallback = "—") => checked(name)[0] || fallback;

  const vehicle = () => [val("year"), val("make"), val("model")].filter(Boolean).join(" ");
  const when = () => {
    const d = dateFallback && !dateFallback.hidden ? val("date") : "";
    const day = d ? new Date(d + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
    return [day ? `From ${day}` : "No date picked", one("flex", "")].filter(Boolean).join(" · ");
  };

  // one row per answer: [step it lives on, label, value]. Drives the review
  // screen and the message that gets sent, so the two can't drift apart.
  const details = () => [
    [0, "Install", checked("service").join(", ") || "Not decided yet"],
    [1, "Vehicle", vehicle() || "—"],
    [1, "Roof", `${one("roof")}, headliner ${one("liner").toLowerCase()}`],
    [2, "Ceiling", `${one("density")} · ${one("color")}`],
    [2, "Extras", checked("extra").join(", ") || "None"],
    [3, "Timing", chosenSlot ? slotLabel() : when()],
    [4, "Name", val("name") || "—"],
    [4, "Contact", [val("phone"), val("email"), val("ig")].filter(Boolean).join(" / ") || "—"],
    [4, "Found us via", one("found", "—")],
    [4, "Notes", val("notes") || "None"],
  ];

  const steps = $$(".step", form);
  const last = steps.length - 1;
  const fill = $("#wizFill"), count = $("#wizCount"), out = $("#reviewOut");
  const back = $("#wizBack"), next = $("#wizNext"), send = $("#wizSend"), status = $("#status");
  let cur = 0;
  let toReview = false; // set when someone jumps back from the review to fix one answer

  const fail = (msg, id) => {
    status.dataset.err = "true";
    status.textContent = msg;
    if (id) $("#" + id).focus();
  };

  // what's still missing on a given step, if anything
  const problem = (i) => {
    if (i === 1 && !vehicle()) return ["Add the year, make and model of the car.", "year"];
    if (i === 4 && !val("name")) return ["Add your name so we know who's booking.", "name"];
    if (i === 4 && !val("phone") && !val("ig")) return ["Leave a number or an Instagram handle — that's how the quote comes back.", "phone"];
    return null;
  };

  const review = () => {
    out.textContent = "";
    for (const [i, label, value] of details()) {
      const row = el("div", { className: "review__row" });
      const edit = el("button", { type: "button", className: "review__edit", textContent: "Edit" });
      edit.addEventListener("click", () => {
        toReview = true;
        show(i);
      });
      row.append(el("dt", { textContent: label }), el("dd", { textContent: value }), edit);
      out.append(row);
    }
  };

  function show(i, quiet) {
    cur = Math.min(Math.max(i, 0), last);
    steps.forEach((s, k) => s.classList.toggle("is-on", k === cur));
    if (cur === last) review();
    fill.style.width = `${((cur + 1) / steps.length) * 100}%`;
    count.textContent = `Step ${cur + 1} of ${steps.length}`;
    back.hidden = cur === 0;
    next.hidden = cur === last;
    next.textContent = toReview ? "Back to review" : "Next";
    send.hidden = cur !== last;
    status.textContent = "";
    if (quiet) return;
    steps[cur].querySelector("h2").focus({ preventScroll: true });
    $("#wiz").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  const advance = () => {
    const p = problem(cur);
    if (p) return fail(...p);
    const jump = toReview;
    toReview = false;
    show(jump ? last : cur + 1);
  };

  steps.forEach((s) => (s.querySelector("h2").tabIndex = -1));
  form.classList.add("is-quiz");
  next.addEventListener("click", advance);
  back.addEventListener("click", () => {
    toReview = false;
    show(cur - 1);
  });
  show(0, true);


  /* ── slot picker ───────────────────────────────────────────
     Days and times come straight off the GHL calendar, so a customer can only
     pick something that's genuinely open. Times are read out of the ISO string
     rather than through Date(), because a visitor in another timezone should
     still see the shop's clock — the appointment is a physical one. */
  let chosenSlot = "";
  const slotDays = $("#slotDays"), slotTimes = $("#slotTimes"),
        slotTimesWrap = $("#slotTimesWrap"), slotHint = $("#slotHint"),
        slotField = $("#slotField"), dateFallback = $("#dateFallback");

  const clock = (iso) => {
    const [h, m] = iso.slice(11, 16).split(":").map(Number);
    const ampm = h < 12 ? "AM" : "PM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  const dayParts = (ymd) => {
    const [y, m, d] = ymd.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return {
      wd: dt.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      d: String(d),
      mo: dt.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      long: dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }),
    };
  };

  const slotLabel = () => {
    if (!chosenSlot) return "";
    const p = dayParts(chosenSlot.slice(0, 10));
    return `${p.long} at ${clock(chosenSlot)}`;
  };

  const useFallback = (why) => {
    slotField.hidden = true;
    dateFallback.hidden = false;
    $("#date").min = new Date().toISOString().slice(0, 10);
    console.warn("slot picker unavailable:", why);
  };

  const paintTimes = (day) => {
    slotTimes.textContent = "";
    day.slots.forEach((iso) => {
      const b = el("button", { type: "button", className: "slot slot--time", textContent: clock(iso) });
      b.setAttribute("aria-pressed", String(iso === chosenSlot));
      b.addEventListener("click", () => {
        chosenSlot = iso;
        $$(".slot--time", slotTimes).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        slotHint.textContent = `Holding ${slotLabel()}`;
      });
      slotTimes.append(b);
    });
    slotTimesWrap.hidden = false;
  };

  const loadSlots = async () => {
    let data;
    try {
      const r = await fetch("/api/slots");
      if (!r.ok) throw new Error(r.status);
      data = await r.json();
    } catch (e) {
      return useFallback(e.message);
    }
    if (!data.days?.length) return useFallback("no open days");

    slotDays.textContent = "";
    data.days.forEach((day) => {
      const p = dayParts(day.date);
      const b = el("button", { type: "button", className: "slot slot--day" });
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", `${p.long}, ${day.slots.length} times open`);
      b.insertAdjacentHTML("beforeend", "<b></b><span></span><i></i>");
      $("b", b).textContent = p.wd;
      $("span", b).textContent = p.d;
      $("i", b).textContent = p.mo;
      b.addEventListener("click", () => {
        chosenSlot = "";
        slotHint.textContent = "";
        $$(".slot--day", slotDays).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        paintTimes(day);
      });
      slotDays.append(b);
    });
  };
  loadSlots();


  // sent — swap the form for the ceiling coming on
  const lightsOn = () => {
    const done = $("#done");
    form.hidden = true;
    $(".bookhead").hidden = true;
    done.hidden = false;
    seedSky($("#doneSky"), 120);
    const h = done.querySelector("h2");
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
    scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (cur !== last) return advance(); // enter on an earlier step just moves on
    if (val("website")) return; // honeypot

    for (let i = 0; i <= last; i++) {
      const p = problem(i);
      if (p) {
        show(i);
        return fail(...p);
      }
    }
    status.dataset.err = "false";

    const msg = [
      `Booking request — ${val("name")}`,
      ...details().map(([, k, v]) => `${k}: ${v}`),
    ].join("\n");

    send.classList.add("is-sending");
    status.textContent = "Sending\u2026";

    /* The real send is into GoHighLevel: it creates the contact, drops an
       opportunity into New Lead, and attaches the whole answer sheet as a note.
       Everything below it is a safety net — if the endpoint is down or the site
       is being served without it, the request still reaches the shop rather
       than dying on the floor. */
    try {
      const r = await fetch("/api/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: val("name"),
          phone: val("phone"),
          email: val("email"),
          ig: val("ig"),
          website: val("website"),
          vehicle: { year: val("year"), make: val("make"), model: val("model") },
          slot: chosenSlot,
          rows: details().map(([, k, v]) => [k, v]),
        }),
      });
      if (r.ok) {
        send.classList.remove("is-sending");
        status.textContent = "";
        return lightsOn();
      }
    } catch {
      /* offline, or no endpoint — fall through to the handoff below */
    }

    if (SHOP_PHONE) {
      const sep = /iPhone|iPad|Mac/.test(navigator.userAgent) ? "&" : "?";
      location.href = `sms:${SHOP_PHONE}${sep}body=${encodeURIComponent(msg)}`;
      send.classList.remove("is-sending");
      status.textContent = "Opening your messages — hit send to finish.";
      return lightsOn();
    }

    try {
      await navigator.clipboard.writeText(msg);
      status.textContent = "Copied — paste it into the DM that just opened.";
    } catch {
      status.textContent = "Opening Instagram — send us your details in the DM.";
    }
    open(SHOP_IG, "_blank", "noopener");
    send.classList.remove("is-sending");
    lightsOn();
  });
}
