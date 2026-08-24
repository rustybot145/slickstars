# Slick Stars

Marketing site for [Slick Stars](https://www.instagram.com/slickstars_/) — fiber-optic starlight
headliners, ambient interior lighting and suede retrims, out of Tampa, Florida.

Static site. No build step, no dependencies:

```
cd "~/Desktop/Slick Stars website" && python3 -m http.server 4188
```

| File | What it is |
|---|---|
| `index.html` | Landing page |
| `book.html` | Booking page — six-step quiz with a review screen before anything sends |
| `styles.css` | All styles for both pages |
| `app.js` | Nav, scroll reveals, star fields, the work rail + lightbox, the booking quiz |
| `video/hero.mp4` | Landing-page background &mdash; 6.5s of a headliner packed with stars, cropped to the star field itself (1080×1020) |
| `video/work/` | The twelve build clips (720×1280) and their poster frames |
| `images/work/` | Full-size stills pulled from the same clips |
| `images/services/` | The three hand-cropped stills for the install cards — **not currently on the page**, see below |
| `media/` | **Not shipped.** Originals, build script, and every screenshot taken while building |
| `CONTENT-TODO.md` | **Read this first** — every claim on the page that is still an assumption |

## Where the media came from

Everything on the page is Slick Stars' own footage. The twelve reels on `@slickstars_` were
pulled with `yt-dlp`, then re-encoded down from 1080×1920 to 720×1280 for the grid. The whole
`video/` folder is 23MB.

`media/build.sh` rebuilds every clip and poster from `media/raw/` using `media/manifest.txt`
(`shortcode|slug|poster timestamp`). Change a timestamp there and re-run it to move a poster
frame. `media/raw/` holds the untouched originals.

Poster frames were picked by hand, one clip at a time — a starlight reel spends half its
runtime on someone's face or a garage shelf, and the auto-picked frame was wrong more often
than it was right.

## Where booking requests go

Slick Stars has no published phone number or email — the Instagram bio says "dm for more
information" and that's the only channel. So the form copies the finished request to the
clipboard and opens the DM at `ig.me/m/slickstars_`.

`app.js` starts with:

```js
const SHOP_PHONE = "";
```

Put the shop's number in there (`+1XXXXXXXXXX`) and the form hands the request to the customer's
own text app instead, addressed to the shop — they hit send, so it arrives from their real
number. That's the better route by a distance; the DM is the fallback until there's a number.

There is no server-side piece and no API key to set. If you later want the request emailed
rather than DM'd, that's a `/api/book` function plus a mail provider — the Vivid Customs build
has one that ports over directly.

## Design

Black, chrome and white. No accent color anywhere in the interface — every color on the page
comes out of the shop's own footage, which is the point: a violet cabin and a cyan star ceiling
read far louder against a page that isn't competing with them.

Display face is **Host Grotesk**, at 600–700. The weight is the point: five faces got tried and
dropped before this and every one of them was set light (200–400), so the thing that had never
been tested wasn't another family, it was attitude. A heavy grotesk sits with a bold chrome badge
in a way a hairline never did. It carries a true italic, which the second line of the hero needs.

**Instrument Sans** carries body copy, labels and every control.

The hero borrows its text layout from the Vivid Customs build: one left-aligned column, centered
in the viewport, with even 1.5rem gaps — locator, two-line headline with the second line italic,
one paragraph, two buttons (solid and ghost). Nothing is pinned to a corner and nothing runs in a
second column.

The rest of the format runs: hero over a star ceiling → three portrait install cards → the process as a hairline-ruled editorial list, not boxes → twelve builds in a
four-column grid over a star field → questions beside their heading → closer.

Three of the four section headings are centered with a small numbered label above them.
Questions is the exception: its heading sits left and sticks while the accordion scrolls past.
Four identical centered sections in a row read as a template; one that breaks the pattern reads
as a decision.

The hero is a framed composition rather than a bottom-weighted block &mdash; a locator and a short
rule anchor the top-left corner, the headline and CTA sit on the floor, and the video fills the
space between. The hero clip is cropped down to the star field itself: the wider frame had a pale
garage fixture in the top right that was the brightest thing on the page and meant nothing.

One star field sits behind the whole site — a single `position:fixed` layer, so it reads as a sky
you're driving under rather than a texture that scrolls past. The count follows the viewport
(≈170 on a desktop, ≈45 on a phone) so a phone doesn't get a desktop's worth of animated nodes.
Stars are mostly ice-white with a few cool and warm ones mixed in; nothing is saturated enough to
read as colour, it just stops the field looking printed. Each one gets its own size, brightness,
blink duration and delay so they never pulse in unison. `prefers-reduced-motion` keeps the stars
and drops the animation.

The hero sits above that layer and covers it — the points you see up there are the real fibre
optic in the video, not the CSS field.

The work grid shows twelve curated poster frames and plays a clip only when you hover one
(pointer devices), or opens it full size in a `<dialog>` lightbox when you tap or click. Twelve
autoplaying clips at once meant twelve random mid-pan frames and twelve simultaneous decodes.

Poster frames in the work grid were picked by hand, one clip at a time — a starlight reel spends
half its runtime on someone's face or a garage shelf.

## The install cards are waiting on photos

The three cards under **Three things, done properly** currently show an empty frame reading
`Photo` instead of an image. That's deliberate — the shop is supplying proper photos.

Each placeholder carries the real `<img>` tag commented out directly above it:

```html
<div class="card__media card__media--ph">
  <!-- drop the shop's photo in and delete the <span class="ph">:
       <img src="images/services/starlight.jpg" width="900" height="1200" ...> -->
  <span class="ph">Photo</span>
```

So swapping a photo in is: uncomment the `<img>`, delete the `<span class="ph">`, drop
`--ph` from the class, and save the new file over the one in `images/services/`. The frame is
3:4 and `object-fit: cover`, so any portrait photo drops in without moving the layout.

The stills that were there before are still in `images/services/` — pulled from the reels, and
fine as a fallback if a photo doesn't arrive for one of the three.

## Assets

`images/logo.png` is the shop's real mark, keyed off the black badge it came on. The source was a
194×118 screenshot; the badge circle and its ground are gone, and alpha is built from luminance
so the chrome bevel composites correctly on any dark surface. It renders at 54px in the nav
(100×54 from a 144×78 file, so it downsamples) and 60px in the footer.

That file is the ceiling on quality: it came from a screenshot, so on a 2× display at large sizes
it will start to soften. A vector or a full-resolution PNG from whoever drew it would be better,
and it drops straight in at the same path.

`images/favicon.svg` is a four-point star — still a placeholder, not from the real mark.
