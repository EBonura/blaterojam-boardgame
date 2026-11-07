// A game screen whose build came out corrupted: shifted bands, stray blocks. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // monitor
  rect(2, 1, 28, 19, 5)
  rect(2, 1, 28, 1, 6)
  rect(13, 20, 6, 2, 5), rect(10, 22, 12, 1, 6)
  // the intended frame: sky, sun, hills, ground, a little hero
  const scene = (x, y) => {
    if ((x - 22) ** 2 + (y - 5) ** 2 <= 5) return 10
    if (y >= 15) return y === 15 ? 11 : 3
    if (y >= 11 && Math.abs(x - 8) <= 15 - y - 1) return 3
    if (x >= 13 && x <= 14 && y >= 11 && y <= 14) return y === 11 ? 15 : 8
    return 12
  }
  // row offsets and colour swaps that make it a glitch
  const shift = { 5: 4, 6: 4, 7: 4, 11: -3, 12: -3, 16: 5 }
  const swap = { 12: 14, 3: 2, 10: 11, 11: 9 }
  for (let y = 3; y < 18; y++) for (let x = 4; x < 28; x++) {
    let c = scene(x - (shift[y] ?? 0), y)
    if (shift[y] && (y === 5 || y === 6 || y === 16)) c = swap[c] ?? c
    px(x, y, c)
  }
  // torn rows and stray blocks
  rect(4, 9, 24, 1, 0), rect(10, 9, 6, 1, 7)
  rect(19, 13, 4, 2, 14), rect(6, 4, 3, 1, 11), rect(24, 14, 2, 3, 0), rect(16, 3, 2, 2, 8)
  // blocks spilling off the screen edge
  rect(28, 6, 2, 2, 14), rect(30, 9, 2, 1, 11), rect(0, 12, 2, 2, 12)
}
