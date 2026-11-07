// Rhythm game: four note lanes with notes falling onto a target line, one hit bursting. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  rect(0, 0, 32, 24, 0)
  // lane highway
  rect(4, 0, 24, 24, 1)
  for (const x of [4, 10, 16, 22, 27]) rect(x, 0, 1, 24, 5)
  // beat lines
  const lanes = [[5, 8, 2], [11, 10, 9], [17, 12, 1], [23, 11, 3]]
  // falling notes
  const note = (lane, y) => {
    const [x, c, d] = lanes[lane]
    rect(x, y, 5, 2, c)
    rect(x, y + 2, 5, 1, d)
    rect(x + 1, y, 3, 1, 7)
  }
  note(0, 2)
  note(1, 7)
  note(2, 0)
  note(3, 12)
  note(0, 13)
  // target line with a ring per lane
  rect(4, 19, 24, 1, 7)
  lanes.forEach(([x, c]) => {
    rect(x, 18, 5, 3, 0)
    rect(x + 1, 18, 3, 1, c), rect(x + 1, 20, 3, 1, c)
    px(x, 19, c), px(x + 4, 19, c)
  })
  // a hit burst in lane two
  rect(11, 17, 5, 5, 10)
  rect(12, 18, 3, 3, 7)
  for (const [x, y] of [[13, 14], [9, 16], [17, 16], [8, 19], [18, 19], [13, 23]]) px(x, y, 10)
  px(10, 15, 9), px(16, 15, 9)
  // speaker-ish side glow
  for (let y = 2; y < 22; y += 3) px(1, y, 14), px(30, y + 1, 14)
  px(2, 2, 2), px(29, 3, 2)
}
