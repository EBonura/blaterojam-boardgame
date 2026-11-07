# Card art brief

Pixel art for the Blatero Game Jam board game (a co-op board game about making a game at a game jam). Every card (play cards, Imprevisti, game sheets) has one 64x48 pixel illustration in the PICO-8 palette, written as a small JS module.

## Format
`tools/cards/art/<id>.mjs` exports `size` and a default `draw({ rect, px })`:

```js
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]
export default function draw({ px }) {
  const p = pen(px)
  p.rect(0, 38, 64, 10, 4)          // ground
  p.ellipse(32, 22, 14, 10, 12)     // subject
  p.sprite(26, 18, ['.77.', '7007'], { 0: 1 }) // details from strings
}
```

- Grid is 64 wide, 48 tall, origin top-left. Off-grid pixels are ignored. `rect(x, y, w, h, c)` and `px(x, y, c)` come from the build.
- `c` is a PICO-8 palette index: 0 black, 1 navy, 2 plum, 3 dark green, 4 brown, 5 dark grey, 6 light grey, 7 white, 8 red, 9 orange, 10 yellow, 11 lime, 12 blue, 13 lavender, 14 pink, 15 peach.
- Unset pixels show the art window background, a dark navy (#14203f). Black (0) and PICO navy (1) are close to it, so a dark shape needs a lighter rim or a lit backdrop to read.
- `_pix.mjs` helpers (all take a palette index): `pen(px)` gives `rect, hline, vline, line, ellipse, disc, ring, poly, dither, sprite`. `sprite(x, y, rows, map, { flip })` draws string rows where hex digits are palette indexes and `.` is transparent (`map` renames characters, e.g. `{ s: 15 }`). `layer()` is an offscreen 64x48 with the same helpers plus `outline(c, { corners })` and `stamp(px, dx, dy)`, handy to give a subject a dark outline. Use whatever mix of rects, shapes and sprite strings keeps the module readable.

## Style
- One clear focal subject with a strong silhouette, readable at phone size (the art shows 150 to 200 px wide in the game, about 3 screen pixels per art pixel) and in print. Fill roughly 60 to 80 percent of the frame.
- Light comes from the top-left on every card. Lit faces and top-left edges get the highlight, bottom-right sides get the shadow, cast shadows fall down-right.
- Two or three tones per material plus a highlight. Ramps that work in this palette:
  - white/metal: 7 > 6 > 5 (> 0)
  - skin: 15 > 4 shadow (14 for blush), dark skin 4 > 2
  - red: 8 > 2; pink: 14 > 8 > 2; orange: 9 > 4 > 2; yellow: 10 > 9 > 4
  - green: 11 > 3 > 1; blue: 12 > 13 > 1; lavender: 13 > 5 > 1; brown/wood: 4 > 2 > 0, or 9 > 4 > 2 for light wood
- Outlines: selective. A dark outline (0, or the darkest tone of the ramp) on the shadow side and where the subject meets the background; lit edges can go without. Avoid pillow shading (concentric dark rims all round) and avoid noise; dither sparingly, for gradients and texture.
- A background or ground that sets the scene where it helps: a desk edge, a wall with a poster, a night window, a floor shadow. Keep it lower contrast than the subject (navy 1, lavender 13 at low coverage, greys) so the focal point still pops.
- Storytelling details and game-jam jokes are welcome: sticky notes, a cold coffee, a tiny bug crawling, a progress bar at 99 percent, a clock, cables, crumbs. One or two per card, never cluttering the focal point.
- No words, except short pixel glyphs that are the joke (".ZIP", ".RAR", "60", "3D"). Code on screens is coloured dashes.
- No real-world IP: no Nintendo or Mario elements (no question blocks, green warp pipes, mushrooms with spots, red-capped plumbers), no copied logos or characters, no official PICO-8 logo. Generic genre imagery only.
- Keep each card visually distinct from the others in the set.

## The jam team (recurring cast)
When a card shows one of the four jam roles, use these looks so they stay recognisable across cards:
- Game designer: short brown hair (4), orange sweater (9 with 4 shadow), dark trousers; often with a marker or sticky notes.
- Programmer: grey hoodie (6/5) with the hood up or down, round glasses with blue screen glare (12), brown hair; slightly tired eyes.
- Artist (grafico): red beret (8/2), white and blue striped shirt (7/12), small moustache; holds a brush, palette or pen.
- Composer: pink-red hair (8/14), big headphones (5/6), lavender top (13/5).

Simple figures read best at this size: head about 10 to 12 px tall, 1x2 or 2x2 eyes, body about as tall again.

## Card families
- Play cards (roles, tools, bonuses): an object or a character on the navy background, with a small ground, desk or backdrop.
- Imprevisti (mishaps): a moment of jam disaster told in one picture; red, orange and yellow accents for alarm, a touch of comedy.
- Game sheets: key art for a genre of game, like a screenshot or a poster of that game. These can fill the whole frame with a scene (sky, level, track, dungeon).

## Check your work
- Look at the art big and at phone size: `python3 tools/cards/art-view.py tools/out/<lane>.png <id> <id> ...` (S=6 by default for zoom; C=2 columns) then open the PNG with the Read tool. Check a few at a time so the image stays legible.
- Build only your cards: `npm run cards -s -- <id> <id> ...` (writes public/cards/art/<id>.svg and print/<id>.svg). Then see them on a card: `W=300 node tools/cards/preview.mjs tools/out/<lane>-cards.png <id> <id> ...`.
- Iterate until each one reads at a glance at phone size.

## Rules
- Only create or edit `tools/cards/art/<id>.mjs` for the ids assigned to you. Don't touch any other file (`_pix.mjs` included: ask if it needs a helper), don't commit, don't run `npm run cards` without ids (other lanes are writing their own cards at the same time).
- Card titles, effects and quotes are in `src/cards/cards.json` (read-only for you).
