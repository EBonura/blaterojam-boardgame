// Pixel art: a slime sprite zoomed up on an editor's transparency checkerboard, a pencil placing the last pixel. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const sprite = [
    '..GGG..',
    '.GWGGG.',
    'GWGGGGG',
    'GGEGEGG',
    'GGGGGG.',
    'DGDGDGD',
  ]
  const col = { G: 11, W: 7, E: 0, D: 3 }
  sprite.forEach((row, j) => [...row].forEach((ch, i) => {
    const c = col[ch] ?? ((i + j) % 2 ? 6 : 7) // empty cells show the checkerboard
    rect(1 + i * 3, 2 + j * 3, 3, 3, c)
  }))
  rect(22, 3, 1, 18, 5), rect(2, 20, 21, 1, 5) // canvas shadow
  rect(19, 11, 3, 3, 11) // the pixel being placed
  // pencil, tip on the new pixel
  for (let i = 0; i < 8; i++) rect(23 + i, 3 + (7 - i), 2, 2, 10), px(24 + i, 4 + (7 - i), 9)
  px(22, 11, 15), px(23, 11, 15), px(22, 12, 15) // sharpened wood
  px(21, 12, 0) // lead
  rect(30, 1, 2, 2, 6) // ferrule
  px(31, 0, 14), px(30, 0, 14) // eraser
}
