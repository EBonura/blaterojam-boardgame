// Patch on patch: a big bug crawling over the code editor, plastered with band-aids,
// while two baby bugs sneak out from under the newest patch. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // editor window
  p.rect(1, 1, 62, 46, 5)
  p.hline(1, 1, 62, 6), p.vline(1, 1, 46, 6)
  p.rect(2, 2, 60, 4, 13)
  p.px(4, 3, 8), p.px(7, 3, 10), p.px(10, 3, 11)
  p.rect(14, 3, 10, 2, 6), p.rect(25, 3, 8, 2, 5) // tabs
  p.rect(3, 7, 58, 39, 0)
  p.rect(3, 7, 5, 39, 1) // gutter
  for (let y = 9; y < 45; y += 3) p.hline(4, y, 2, 13)
  // code: coloured dashes with indents
  const lines = [[0, 8, 12], [2, 12, 11], [2, 6, 14], [4, 14, 9], [4, 9, 6], [2, 5, 14], [0, 3, 12], [0, 10, 11], [2, 13, 9], [2, 7, 12], [4, 11, 14], [0, 4, 6]]
  lines.forEach(([ind, len, c], i) => {
    const y = 9 + i * 3
    p.hline(10 + ind * 2, y, len, c)
    p.hline(10 + ind * 2 + len + 2, y, Math.max(2, 9 - len / 2), 6)
  })

  // a band-aid of length L centred on (cx, cy), turned by ang: peach strip with rounded ends,
  // brown edge on the shadow side, white pad, little vent dots
  const aid = (cx, cy, ang, L = 15, H = 5) => {
    const c = Math.cos(ang), s = Math.sin(ang), R = Math.ceil(L / 2) + 2
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
      const u = x * c + y * s + L / 2, v = -x * s + y * c + H / 2
      if (u < 0 || u >= L || v < 0 || v >= H) continue
      const end = Math.min(u, L - u)
      if (end < 1 && (v < 1 || v >= H - 1)) continue
      const pad = Math.abs(u - L / 2) < 2.5 && v >= 1 && v < H - 1
      let col = pad ? 7 : 15
      if (v >= H - 1 || u >= L - 1) col = 4
      else if (v < 1) col = 7
      else if (!pad && Math.floor(u) % 3 === 0 && Math.floor(v) === 2) col = 14
      p.px(cx + x, cy + y, col)
    }
  }

  // the bug: red shell, dark head, six jointed legs
  const legs = [[34, 21, 29, 19, 26, 15], [33, 27, 28, 27, 25, 30], [35, 32, 31, 36, 30, 40], [48, 21, 53, 19, 56, 15], [49, 27, 54, 27, 57, 30], [47, 32, 51, 36, 52, 40]]
  for (const [a, b, c, d, e, f] of legs) {
    p.line(a, b, c, d, 5), p.line(c, d, e, f, 5), p.line(a, b + 1, c, d + 1, 2), p.line(c + 1, d, e + 1, f, 2)
  }
  p.ellipse(41, 27, 8.5, 9, 0)
  p.ellipse(41, 27, 7.5, 8, 8)
  p.ellipse(43, 29, 6, 6.5, 2)
  p.ellipse(40, 26, 6, 6.5, 8)
  p.vline(41, 19, 17, 0) // wing split
  p.px(36, 22, 14), p.px(35, 23, 14), p.px(35, 24, 14), p.px(37, 21, 7) // shine
  p.ellipse(41, 16, 4.5, 3.5, 5)
  p.ellipse(41.5, 16.5, 3.5, 2.5, 0)
  p.ellipse(40.5, 15.5, 3.5, 2.5, 5)
  p.hline(39, 13, 3, 6)
  p.rect(38, 15, 2, 2, 7), p.rect(42, 15, 2, 2, 7), p.px(39, 16, 0), p.px(43, 16, 0) // eyes
  p.line(38, 14, 39, 15, 0), p.line(44, 14, 43, 15, 0) // smug brows
  p.line(38, 12, 35, 8, 5), p.line(44, 12, 47, 8, 5)
  p.px(35, 8, 8), p.px(47, 8, 8)

  // band-aids crossed over the bug, more over the code
  aid(41, 28, 0.75)
  aid(41, 28, -0.75)
  aid(17, 18, -0.15, 13)
  aid(19, 38, 0.2, 13)
  p.rect(12, 28, 10, 3, 6), p.hline(12, 28, 10, 7), p.hline(12, 30, 10, 5), p.px(22, 29, 6) // grey duct tape

  // two baby bugs escaping the latest patch
  const baby = (x, y) => { p.rect(x, y, 3, 2, 8), p.px(x, y, 14), p.px(x + 3, y, 0), p.px(x - 1, y + 2, 0), p.px(x + 3, y + 2, 0) }
  baby(30, 42), baby(35, 40)
  p.px(28, 42, 6), p.px(33, 40, 6) // tiny trails
  // red underline under a code line
  for (let x = 14; x < 28; x += 2) p.px(x, 13, 8), p.px(x + 1, 14, 8)
}
