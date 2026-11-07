// Racing game: a car from behind on a road in perspective, heading under a chequered finish banner. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // sky and hills
  rect(0, 0, 32, 10, 12)
  rect(0, 7, 10, 3, 13), rect(20, 6, 12, 4, 13), rect(3, 6, 5, 1, 13), rect(24, 5, 5, 1, 13)
  rect(0, 9, 32, 1, 13)
  rect(3, 1, 4, 1, 7), rect(24, 2, 5, 1, 7)
  // grass
  rect(0, 10, 32, 14, 3)
  // road trapezoid with kerbs
  for (let y = 10; y < 24; y++) {
    const t = y - 10
    const half = 2 + t
    const l = 16 - half, w = half * 2
    rect(l, y, w, 1, 5)
    const kerb = (t >> 1) % 2 ? 8 : 7
    px(l - 1, y, kerb), px(l + w, y, kerb)
    if (t > 6) px(l - 2, y, kerb), px(l + w + 1, y, kerb)
    if (t % 4 < 2) rect(15, y, 2, 1, 7)
  }
  // finish banner on two poles
  rect(8, 3, 1, 8, 6), rect(23, 3, 1, 8, 6)
  for (let x = 9; x < 23; x++) for (let y = 3; y < 6; y++) px(x, y, (x + y) % 2 ? 0 : 7)
  // car from behind
  rect(10, 15, 12, 6, 8)
  rect(12, 13, 8, 2, 8)
  rect(13, 13, 6, 2, 1) // rear window
  px(13, 13, 12)
  rect(9, 14, 14, 1, 2) // spoiler
  rect(9, 13, 1, 2, 2), rect(22, 13, 1, 2, 2)
  rect(10, 15, 12, 1, 14) // body highlight
  rect(11, 17, 2, 1, 10), rect(19, 17, 2, 1, 10) // tail lights
  rect(14, 18, 4, 1, 0) // plate
  rect(15, 18, 2, 1, 7)
  rect(8, 18, 2, 4, 0), rect(22, 18, 2, 4, 0) // tyres
  rect(10, 21, 12, 1, 2)
  // exhaust puffs
  px(13, 22, 6), px(12, 23, 6), px(18, 22, 6), px(19, 23, 6)
}
