// A plate of spaghetti tangled around code braces and a stray cable. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const ell = (cx, cy, rx, ry, x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1
  // plate
  for (let y = 0; y < 24; y++)
    for (let x = 0; x < 32; x++) {
      if (ell(16, 18.5, 15.5, 4.6, x, y)) px(x, y, y > 19 ? 6 : 7)
      if (ell(16, 18, 11, 2.8, x, y)) px(x, y, 6)
    }
  rect(6, 23, 20, 1, 13)
  // pasta pile: yellow, with darker gaps between the noodles
  const pile = (x, y) => ell(16, 14, 10.5, 6.5, x, y) && y < 19
  for (let y = 0; y < 24; y++) for (let x = 0; x < 32; x++) if (pile(x, y)) px(x, y, 10)
  for (let k = 0; k < 6; k++)
    for (let x = 4; x < 28; x++) {
      const y = Math.round(9.5 + k * 1.9 + 1.3 * Math.sin(x * 0.7 + k * 2.3))
      if (pile(x, y)) px(x, y, 9)
    }
  for (const [x, y] of [[10, 10], [11, 10], [20, 12], [21, 12], [13, 15], [14, 15], [22, 16], [8, 14]]) px(x, y, 15)
  // big code braces around the pile, like a code block
  const lb = ['.##', '.#.', '.#.', '.#.', '#..', '.#.', '.#.', '.#.', '.##'], rb = ['##.', '.#.', '.#.', '.#.', '..#', '.#.', '.#.', '.#.', '##.']
  const glyph = (g, x0, y0, c) => g.forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && (px(x0 + 2 * i, y0 + j, c), px(x0 + 2 * i + 1, y0 + j, c))))
  glyph(lb, 0, 5, 12), glyph(rb, 26, 5, 12)
  // a few noodles hanging over the braces and the plate rim
  for (const [x, y] of [[3, 8], [4, 9], [3, 10], [28, 10], [27, 11], [28, 12], [9, 19], [9, 20], [22, 19], [23, 20], [23, 21]]) px(x, y, 10)
  // a red cable weaving out of the pile to a plug
  for (const [x, y] of [[18, 9], [19, 10], [20, 11], [21, 13], [22, 14], [23, 15], [24, 16], [25, 16], [26, 16], [27, 15], [28, 15]]) px(x, y, 8)
  rect(28, 14, 2, 3, 6), px(30, 14, 5), px(30, 16, 5)
  // meatball with sauce
  rect(13, 7, 5, 3, 4), rect(14, 6, 3, 1, 4), px(14, 7, 15), rect(12, 10, 7, 1, 8), px(15, 11, 8), px(17, 9, 2)
}
