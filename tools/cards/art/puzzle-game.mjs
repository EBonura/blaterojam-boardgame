// Falling-block puzzle: a well of coloured blocks, a piece dropping in and a next-piece box. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // well
  rect(3, 0, 1, 22, 6)
  rect(22, 0, 1, 22, 6)
  rect(3, 21, 20, 2, 6)
  rect(3, 22, 20, 1, 5)
  rect(4, 0, 18, 21, 0)
  const cols = { r: [8, 2], b: [12, 1], g: [11, 3], y: [10, 9], o: [9, 4], p: [14, 2] }
  const cell = (cx, cy, k, ox = 4, oy = 0) => {
    const [c, d] = cols[k]
    const x = ox + cx * 3, y = oy + cy * 3
    rect(x, y, 3, 3, c)
    px(x, y, 7)
    px(x + 2, y + 2, d), px(x + 1, y + 2, d), px(x + 2, y + 1, d)
  }
  // stacked blocks
  const stack = [
    [0, 6, 'r'], [1, 6, 'r'], [2, 6, 'b'], [3, 6, 'b'], [5, 6, 'g'],
    [0, 5, 'y'], [1, 5, 'r'], [2, 5, 'b'], [4, 5, 'g'], [5, 5, 'g'],
    [0, 4, 'y'], [1, 4, 'y'], [5, 4, 'o'],
  ]
  for (const [cx, cy, k] of stack) cell(cx, cy, k)
  // falling piece, pointed at the gap
  for (const [cx, cy] of [[2, 1], [3, 1], [4, 1], [3, 2]]) cell(cx, cy, 'p')
  // drop guide
  for (let y = 10; y < 12; y += 2) px(10, y, 5)
  // next box and score dots
  rect(24, 1, 7, 7, 6)
  rect(25, 2, 5, 5, 0)
  rect(26, 3, 3, 1, 9), rect(27, 4, 1, 2, 9), px(26, 3, 10)
  for (let y = 10; y < 20; y += 2) rect(25, y, 5, 1, y < 16 ? 7 : 5)
}
