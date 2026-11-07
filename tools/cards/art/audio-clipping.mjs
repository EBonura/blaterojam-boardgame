// Audio clipping: the waveform slams into the red limits and flattens, the meters max out,
// and the speaker on the desk cracks and smokes. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // the audio editor window behind
  p.rect(1, 2, 46, 34, 5)
  p.hline(1, 2, 46, 6), p.vline(1, 2, 34, 6)
  p.rect(2, 3, 44, 3, 13)
  p.px(3, 4, 8), p.px(5, 4, 10), p.px(7, 4, 11)
  p.rect(3, 7, 34, 27, 0)
  for (let x = 6; x < 37; x += 6) p.vline(x, 7, 27, 1) // time grid
  p.hline(3, 20, 34, 1)
  // clip limits
  for (let x = 3; x < 37; x += 2) p.px(x, 10, 8), p.px(x, 30, 8)
  // waveform: it swells from quiet to far too loud, the peaks sheared flat in red
  for (let x = 3; x < 37; x++) {
    const t = x - 3
    const env = 2 + t * 0.55
    const a = Math.round(env * (0.55 + 0.45 * Math.abs(Math.sin(t * 1.7) * Math.cos(t * 0.6))))
    const clipped = a >= 9
    const h = Math.min(a, 9)
    p.vline(x, 20 - h, 2 * h + 1, clipped ? 11 : 3)
    if (h > 2) p.vline(x, 20 - h + 2, 2 * h - 3, clipped ? 3 : 11)
    if (clipped) p.px(x, 11, 8), p.px(x, 29, 8), p.px(x, 12, 14), p.px(x, 28, 14)
  }
  p.hline(3, 20, 34, 7)
  // meters, all the way into the red, clip lights on
  for (const mx of [39, 43]) {
    p.rect(mx, 7, 3, 27, 0)
    for (let y = 12; y < 34; y += 2) p.hline(mx, y, 3, y < 18 ? 8 : y < 24 ? 10 : 11)
    p.rect(mx, 8, 3, 3, 8), p.px(mx + 1, 9, 7)
  }
  // clip glow
  p.px(41, 6, 10), p.px(38, 8, 9), p.px(46, 8, 9)

  // desk
  p.rect(0, 40, 64, 8, 4)
  p.hline(0, 40, 64, 9)
  p.rect(0, 43, 64, 5, 2)

  // the speaker: wooden box, cracked cone, smoke
  p.rect(43, 18, 18, 23, 4)
  p.hline(43, 18, 18, 9), p.vline(43, 18, 23, 9)
  p.vline(60, 19, 22, 2), p.hline(44, 40, 17, 2)
  p.rect(41, 19, 2, 22, 0) // shadow edge against the window
  p.disc(52, 34, 5, 0), p.disc(52, 34, 4, 5), p.disc(52, 34, 2.5, 6), p.disc(52, 34, 1, 0)
  p.px(50, 31, 7), p.px(49, 32, 6)
  p.disc(52, 24, 2.5, 0), p.disc(52, 24, 1.5, 6), p.px(51, 23, 7) // tweeter
  // crack through the cone
  p.line(48, 30, 51, 33, 0), p.line(51, 33, 50, 36, 0), p.line(53, 35, 56, 38, 0)
  // smoke
  p.ellipse(57, 13, 3, 2, 6), p.ellipse(60, 9, 2.5, 2, 5), p.ellipse(56, 6, 2, 1.5, 5), p.px(56, 12, 7)
  // shock lines blasting out
  p.line(37, 37, 34, 39, 10), p.line(38, 34, 34, 34, 10), p.line(62, 30, 63, 28, 10)
  p.line(37, 31, 35, 29, 9)
  // headphones knocked off onto the desk
  for (let t = Math.PI; t <= 2 * Math.PI; t += 0.05) {
    p.px(Math.round(19 + 7 * Math.cos(t)), Math.round(41 + 6 * Math.sin(t)), 5)
    p.px(Math.round(19 + 6 * Math.cos(t)), Math.round(41 + 5 * Math.sin(t)), 6)
  }
  p.rect(10, 38, 4, 5, 8), p.hline(10, 38, 4, 14), p.vline(13, 39, 4, 2), p.vline(10, 39, 3, 14)
  p.rect(24, 38, 4, 5, 8), p.hline(24, 38, 4, 14), p.vline(27, 39, 4, 2)
  p.hline(9, 43, 20, 2)
}
