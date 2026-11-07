// A waveform chopped flat by the red limits, meter maxed out. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // track window
  rect(1, 2, 30, 20, 5)
  rect(2, 3, 28, 18, 0)
  // red limit lines
  rect(2, 6, 21, 1, 2), rect(2, 17, 21, 1, 2)
  // the wave as it should have been (ghost peaks past the limits)
  const wave = (x) => 11.5 - 9 * Math.sin((x - 3) * 0.64)
  for (let x = 3; x < 23; x++) {
    const y = Math.round(wave(x))
    if (y < 6 || y > 17) px(x, y, 13)
  }
  // the wave that actually came out: squared off, peaks flat and red
  let prev = null
  for (let x = 3; x < 23; x++) {
    const y = Math.max(6, Math.min(17, Math.round(wave(x))))
    const from = prev ?? y
    rect(x, Math.min(from, y), 1, Math.abs(from - y) + 1, 11)
    if (y === 6 || y === 17) px(x, y, 8), px(x, y === 6 ? 7 : 16, 8)
    prev = y
  }
  // level meter, every segment lit
  for (let y = 6; y < 20; y += 2) {
    const c = y < 10 ? 8 : y < 14 ? 10 : 11
    rect(25, y, 2, 1, c), rect(28, y, 1, 1, c)
  }
  rect(25, 4, 4, 1, 8), px(26, 4, 7)
  // clip light bursting out of the corner
  rect(27, 0, 1, 2, 10), px(30, 1, 10), px(24, 1, 10), px(31, 3, 10)
}
