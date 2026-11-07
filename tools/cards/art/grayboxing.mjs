// A level blocked out in grey boxes, with a lone orange player capsule. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // a box in oblique view: front face with faint grid, top shifted up-right, shadowed right side
  const box = (x, yb, w, h, d) => {
    const y = yb - h + 1
    rect(x, y, w, h, 6)
    for (let gx = x + 4; gx < x + w; gx += 4) rect(gx, y, 1, h, 13)
    for (let gy = yb - 4; gy > y; gy -= 4) rect(x, gy, w, 1, 13)
    for (let i = 1; i <= d; i++) rect(x + w - 1 + i, y - i + 1, 1, h, 5)
    for (let i = 1; i <= d; i++) rect(x + i, y - i, w, 1, 7)
  }
  // floor slab: dark grey top with a grid, darker front
  for (let i = 0; i < 5; i++) rect(i, 18 - i, 27, 1, 5)
  for (let x = 2; x < 31; x += 4) for (let i = 0; i < 5; i++) px(x + i, 18 - i, 13)
  rect(0, 19, 27, 3, 13), rect(0, 20, 27, 2, 5)
  for (let i = 1; i < 5; i++) rect(26 + i, 19 - i, 1, 3, 5)
  // tall block, a low step, a ramp-free mid block
  box(2, 18, 8, 13, 3)
  box(12, 18, 6, 5, 3)
  box(21, 17, 6, 9, 3)
  // player capsule standing on the low step
  const cap = ['.oo.', 'oooo', 'oooo', 'oooo', 'oooo', 'oooo', '.oo.']
  cap.forEach((row, j) => [...row].forEach((ch, i) => ch === 'o' && px(13 + i, 6 + j, i === 3 ? 4 : 9)))
  px(14, 7, 15), px(14, 8, 15)
  rect(13, 12, 5, 1, 13)
}
