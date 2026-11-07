# Card art brief

Pixel art for the Blatero Game Jam board game (a co-op board game about making a game at a game jam). Every card has one 32x24 pixel illustration in the PICO-8 palette, written as a small JS module.

## Format
`tools/cards/art/<id>.mjs`, default export `draw({ rect, px })`:
- `px(x, y, c)` sets one pixel; `rect(x, y, w, h, c)` fills a rectangle. Grid is 32 wide, 24 tall, origin top-left. Off-grid pixels are ignored.
- `c` is a PICO-8 palette index: 0 black, 1 navy, 2 plum, 3 dark green, 4 brown, 5 dark grey, 6 light grey, 7 white, 8 red, 9 orange, 10 yellow, 11 lime, 12 blue, 13 lavender, 14 pink, 15 peach.
- Unset pixels show the art window background, a dark navy (#14203f). Plan contrast against it: black (0) and navy (1) shapes vanish on it unless outlined or set on a lighter shape.
- Examples in the style we approved: `tools/cards/art/caffe.mjs` (coffee cup) and `tools/cards/art/patch-su-patch.mjs` (bug on a code editor).

## Style
- One clear subject with a strong silhouette, readable at phone size (the art shows about 150 px wide in game). Fill roughly 60 to 80 percent of the frame.
- Simple shading: a light side and a shadow side, a highlight pixel or two. A small ground shadow is fine.
- Videogame and game jam humour is welcome (visual gags, references to dev life), but keep it readable at a glance.
- No words in the art. Short glyphs are fine when they are the joke (".zip", "60", "3D"), drawn in pixels.
- Keep each card visually distinct from the others in the set.

## Check your work
- Build only your cards: `npm run cards -s -- <id> <id> ...` (writes public/cards/art/<id>.svg and print/<id>.svg).
- Render them to a PNG and look at it: `node tools/cards/preview.mjs tools/out/<lane>.png <id> <id> ...` then open the PNG with the Read tool. Iterate until each one reads clearly. Check a few at a time so the image stays legible.

## Rules
- Only create or edit `tools/cards/art/<id>.mjs` for the ids assigned to you. Don't touch any other file, don't commit, don't run `npm run cards` without ids (other lanes are writing their own cards at the same time).
- Card titles and effects are in `src/cards/cards.json` (read-only for you).
