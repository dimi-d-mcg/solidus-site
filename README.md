# Solidus Commodities DMCC — one-page site

Public one-page site for Solidus Commodities DMCC (in formation), Dubai. Audience: compliance —
correspondent-bank analysts, refinery due-diligence desks, regulators. The page opens as cinema
and settles, section by section, into a document.

Built from the design handoff `design_handoff_solidus_site` (art direction DB0002 v2; copy fixed
verbatim per SC/BRD/CP0001 v1.2, 22 Aug 2026). **No text may be added without sign-off.**
Client amendment 23 Aug 2026: the em-dash constructions in the firm paragraphs were rewritten
dash-free. Em-dashes that remain in the registers are deliberate placeholders that fill at
incorporation — never "TBD".

## Stack & deployment

Static — no build step, no dependencies. Live at https://soliduscommodities.com via GitHub
Pages (repo `dimi-d-mcg/solidus-site`). **Pipeline: every push to `main` deploys automatically**
through GitHub's native branch build ("pages build and deployment" in the Actions tab);
`.nojekyll` keeps files served raw (needed for `.well-known/`). DNS at Namecheap: apex A
records to GitHub Pages (185.199.108–111.153), `www` CNAME to `dimi-d-mcg.github.io`, plus the
Search Console verification TXT (keep it); soldiuscommodities.com (typo domain, brand
protection) 301-redirects here.
When editing `css/site.css` or `js/site.js`, bump the `?v=` cache-buster in index.html
(and the CSS one in 404.html). A strict CSP is set as a meta tag: no inline scripts or styles
anywhere — put styles in site.css and script in site.js.

- `index.html` — the page (all copy verbatim)
- `css/site.css` — locked palette, Fraunces/Archivo, layout
- `js/site.js` — motion layer (progressive enhancement; page is fully usable without it)
- `assets/img/` — web-sized brand artwork (masters live outside the repo)

Fonts load from the Google Fonts CDN (Fraunces variable + Archivo variable).

## At incorporation

1. Fill the em-dash placeholders in `index.html` (licence no., DPMS reg., registered office,
   e-mail domains) and make the two e-mail values `mailto:` links.
2. Done at deploy: absolute `og:image`, `og:url`, and canonical are set to
   https://soliduscommodities.com/.

The hero film is wired (`SOLIDUS_CONFIG` block at the bottom of `index.html`): 21:9, 30s,
plays once, rests on its logo end frame. Web encodes in `assets/media/` — 1920w (9.3 MB) and
1280w (5.0 MB, served ≤768px viewports) H.264/faststart, poster = extracted end frame.
The 42.6 MB HEVC master stays on the Desktop (`hf_20260822_130411_*.mp4`).

## Motion rules (DB0002 v2 + liveliness pass)

Scroll is never hijacked. Hero scrub is scroll-linked; parallax differential 15% clamped ±40px;
every reveal fires once; durations 300–600ms, ease-out only. The liveliness pass (client
request, Aug 2026) stays inside the document metaphor: the header slash draws itself at load;
section rules draw in (a Paper cover retracting) as sections arrive; commodity rows arrive with
choreography — numeral, name, line at 90ms steps while the photograph settles (1.04→1) into its
frame; compliance rules draw with the stamps (90ms stagger, cap 450ms). Company details and the
footer stay perfectly still — the page ends as a document at rest.
When the film ends, a scroll cue appears bottom-centre — the house device (a Porphyry rule with
round terminals) drawing itself downward on a 2.4s loop; no text over the film, no icons. It is
position:fixed (the sticky stage hangs below the fold pre-pin), suppressed if the viewer has
already scrolled, and the first scroll dismisses it permanently.
`prefers-reduced-motion` (or no JS) collapses everything to the static settled document.

## Large screens

Composition and measure are locked, so wide viewports scale the whole sheet instead of
stretching it: above ~1390px CSS width the page zooms continuously (viewport / 1360, capped
2.6 at 4K) via `body { zoom }` — JS applies the fluid value, stepped `@media` rules cover
no-JS. Hero cinema math is zoom-aware (`pageZoom()` in site.js), and the pinned hero heights
are set in real pixels divided by zoom because vh units multiply under `body { zoom }`.

## Layout notes (client revisions, Aug 2026)

- Commodity index runs full spread / pair / full spread / pair: gold and coal keep the
  editorial two-column rows (4:5 plates, parallax); copper+cobalt and fertiliser+sulphur sit
  as side-by-side square plates with smaller numerals. Same six lines, roughly half the scroll.
- Photograph frames are 1px Ink (the plate rule); the hero panel stays Hairline.
- Vertical rhythm tightened from the handoff: firm 80px top, sections 128px, row gap 140px,
  footer 96px.
- css/js URLs carry a `?v=` cache-buster — bump it whenever either file changes.

## Hard bans (build fails if any appear)

Gradients · drop shadows · glassmorphism/blur · pill buttons · radius >2px · dark mode ·
metallics on screen · emoji · icon sets (the slash is the only graphic device) ·
Inter/Space Grotesk/Roboto/Playfair · title-case headings · added copy of any kind.

## Local preview

```
py -m http.server 4573
```

then open http://localhost:4573
