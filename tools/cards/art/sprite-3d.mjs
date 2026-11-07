// A flat sprite in red/blue 3D glasses, with anaglyph fringes and a fake blob shadow. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const sprite = [
    '...hhhhhh...',
    '..hhhhhhhh..',
    '.hhhhhhhhhh.',
    '.hssssssssh.',
    'wwwwwwwwwwww',
    'wRRRwwwwBBBw',
    'wRRRwsswBBBw',
    '.wwwwsswwww.',
    '.ssssssssss.',
    '..sssmmsss..',
    '...ssssss...',
    '..tttttttt..',
    '.tttttttttt.',
    'stttttttttts',
    's.ttbbbbtt.s',
    '..pppppppp..',
    '..ppp..ppp..',
    '..ff....ff..',
  ]
  const pal = { h: 4, s: 15, w: 7, R: 8, B: 12, m: 2, t: 3, b: 9, p: 13, f: 4 }
  const x0 = 10, y0 = 1
  // blob shadow
  rect(9, 19, 14, 2, 5), rect(11, 21, 10, 1, 5), rect(11, 18, 10, 1, 5)
  // anaglyph fringes: the silhouette in red to the left, blue to the right
  const each = (fn) => sprite.forEach((row, j) => [...row].forEach((ch, i) => ch in pal && fn(x0 + i, y0 + j, ch)))
  each((x, y) => px(x - 2, y, 8))
  each((x, y) => px(x + 2, y, 12))
  each((x, y, ch) => px(x, y, pal[ch]))
  // shading on the tunic and face
  rect(19, 12, 2, 3, 3), px(20, 13, 1)
}
