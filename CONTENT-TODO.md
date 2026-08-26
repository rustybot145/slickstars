# Slick Stars — what's still a guess

Everything on this page came from one place: the `@slickstars_` Instagram profile — a bio, a
city, and twelve reels. Nobody at the shop has told me anything. Go through this before it goes
public.

## Confirmed
- Business name, Tampa FL, handle `@slickstars_`, 722 followers, 89 posts.
- Bio reads: "STARLIGHTS | HEADLINER · Tampa, Fl · local custom lighting specialist · dm for
  more information".
- All twelve clips on the page are Slick Stars' own footage.
- The three services on the page are all visible in the reels: **starlight headliners**,
  **ambient interior lighting**, **suede headliner/pillar retrims**. Cars shown are Tesla
  (repeatedly), Cadillac, Kia and Honda.
- Shooting stars and twinkle are both visible in the bench-test clip, so those claims are safe.

## The logo is a placeholder
The mark on the page is type, not the shop's artwork &mdash; see the Assets section of the README
for the two-line swap. Until that file lands, the site is showing a font, not a brand.

## Three photos are outstanding
The install cards show an empty `Photo` frame, not an image — waiting on the shop. One portrait
photo each for starlight headliner, ambient lighting and suede retrim. The README has the
two-line swap. Reel stills are sitting in `images/services/` as a fallback.

## Suede retrim has been dropped
It was on the site as a fourth service; Ben removed it. The only suede footage was one clip of
trim pieces on a driveway, so nothing is lost visually. If he starts offering it again the copy
is in git history.

## Underglow is now on the site
Added as the third install card, an FAQ answer about Florida law, and an option on the booking
form. Backed by his own footage (two underglow clips in the work grid). **The Florida legal answer
is written from the general shape of the law, not the statute** — same caveat the Vivid build had
about Arizona. Read the current language and reword it, or cut it back to "we set it up
street-legal, ask us about your build."

## The form now posts into GoHighLevel
`api/book.js` creates the contact and drops an opportunity into *New Lead 💫*. It needs `GHL_api`
set in Vercel or it falls back to the Instagram DM. Tested end to end against the live account on
2026-08-24 — contact, opportunity and note all landed, test record deleted afterwards.

## No contact details anywhere
This is the biggest hole. There's no phone number, no email, no address and no link in the bio.
- `app.js` → `SHOP_PHONE` is **empty**, so every booking goes out through the Instagram DM.
- There's no address on the page, only "Tampa, FL". Every clip is shot in a residential garage
  and driveway — I did **not** claim a shop, a mobile service, or a service radius, because I
  don't know which it is. Whichever it is needs to go in the footer and in the FAQ.
- No hours anywhere.

## Claims I made up and you need to confirm
- **"Runs off your phone"** (hero) and **phone control** (services). Standard for these kits,
  but only true if that's the hardware he actually installs.
- **"Most headliners are a day, add ambient or a retrim and it's usually two"** — booking step 4.
  Invented. Get the real turnaround.
- **"Pick a day and we hold it"** (process step 02). I deliberately did **not** invent a deposit
  policy, unlike the Vivid page. If there is one, it belongs here.
- **"A real number back, usually the same day"** — hero closer and `book.html`. Invented SLA.
- **Power tapped to a switched source** (FAQ) and **everything goes back on factory clips**
  (process step 03). This is how it *should* be done and matches what the back-of-headliner clip
  shows, but confirm it's how he does it.
- **"Bring it back" warranty** on the last FAQ. There is no stated warranty anywhere.
- **"Every roof gets lit up on the stand and checked before it goes back in"** — inferred from
  two bench-test clips showing exactly that. Very likely true, still an inference.

## Things I deliberately left vague, and why
- **Star counts.** The FAQ says the count is set by the roof and to send a photo. Vivid's page
  quotes "five to nine hundred"; Slick Stars has never posted a number, so I didn't invent one.
  If he has standard packages, that FAQ answer should become the price list instead.
- **Roof types.** The FAQ now answers "will it work on my car?" with "the roof decides it, send a
  photo" and names no brand. That's deliberate — the footage is Tesla-heavy but Ben asked not to
  present them as the speciality, and I couldn't tell from the clips how the glass roof on a
  Model 3/Y is actually handled. If there's a real answer for glass roofs it belongs in that FAQ;
  it's the highest-value question on the page.
- **Florida heat and humidity.** An obvious local objection for a glued-fiber install in Tampa,
  and a good FAQ answer — but I have no basis for one, so there isn't one on the page.

## One thing worth telling him
His best-performing reel by a distance is the Cadillac ambient one (7.3K plays against a
~1K median). It's an interior *ambient* clip, not a starlight clip. The site currently leads
with starlight because the bio does. Worth asking which one actually sells.
