// A whiteboard spiral drowning under sticky notes. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // whiteboard on legs
  rect(2, 1, 28, 17, 6)
  rect(3, 2, 26, 15, 7)
  rect(5, 18, 1, 5, 5), rect(26, 18, 1, 5, 5)
  rect(3, 17, 26, 1, 5)
  // the endless spiral
  for (let t = 0.5; t < 19; t += 0.05) {
    const r = 0.4 * t
    px(Math.round(16 + r * Math.cos(t)), Math.round(9.5 + 0.8 * r * Math.sin(t)), 12)
  }
  // sticky notes everywhere, and more falling to the floor
  const dark = { 10: 9, 14: 8, 11: 3, 12: 1, 9: 4 }
  const note = (x, y, c) => { rect(x, y, 4, 4, c), rect(x + 1, y + 1, 2, 1, dark[c]), px(x + 3, y + 3, dark[c]) }
  const notes = [[1, 0, 10], [7, 1, 14], [24, 0, 11], [28, 3, 9], [3, 6, 11], [25, 7, 10], [0, 11, 14], [27, 12, 14],
    [4, 13, 9], [21, 13, 12], [11, 0, 9], [18, 1, 10], [9, 14, 10],
    [0, 19, 12], [8, 20, 14], [13, 19, 11], [18, 20, 10], [23, 19, 9], [28, 20, 11], [15, 21, 14], [3, 21, 10]]
  for (const [x, y, c] of notes) note(x, y, c)
  // one mid-fall
  rect(13, 15, 4, 3, 9), px(16, 15, 4)
}
