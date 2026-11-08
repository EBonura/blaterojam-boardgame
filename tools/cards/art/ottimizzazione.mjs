// Ottimizzazione: the settings panel at the last minute. The graphics and audio sliders pushed all the way to
// "low", and the FPS counter shooting up in green. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)
  // panel
  p.rect(0, 0, 64, 48, 1)
  p.rect(2, 2, 60, 44, 0)
  p.rect(3, 3, 58, 42, 5)
  p.rect(3, 3, 58, 6, 13), p.hline(3, 3, 58, 6)
  // gear in the title bar
  p.disc(8, 6, 2, 6), p.px(8, 6, 13)
  for (const [dx, dy] of [[0, -3], [0, 3], [-3, 0], [3, 0]]) p.px(8 + dx, 6 + dy, 6)
  p.hline(13, 6, 18, 6)
  // a slider row: icon, track, knob at the low end, "low" marks
  const slider = (y, icon, colour) => {
    p.rect(5, y, 9, 9, 1), icon(6, y + 1)
    p.rect(17, y + 3, 24, 3, 0), p.rect(18, y + 4, 22, 1, 13)
    p.rect(18, y + 4, 2, 1, colour)
    const k = layer()
    k.rect(17, y + 1, 4, 7, 7), k.vline(20, y + 1, 7, 6)
    k.outline(0)
    k.stamp(px)
    p.sprite(17, y - 2, ['8.8', '.8.'])
  }
  // picture icon (graphics): sky, sun, hills
  slider(12, (x, y) => (p.rect(x, y, 7, 7, 12), p.px(x + 5, y + 1, 10), p.poly([[x, y + 6], [x + 3, y + 3], [x + 6, y + 6]], 3)), 14)
  // note icon (audio)
  slider(26, (x, y) => (p.vline(x + 4, y, 6, 11), p.hline(x + 4, y, 3, 11), p.px(x + 6, y + 1, 11), p.ellipse(x + 3, y + 5, 1.5, 1, 11)), 11)
  // the FPS meter: a little screen with a rising green graph and an up arrow
  p.rect(44, 11, 15, 30, 0)
  p.rect(45, 12, 13, 28, 1)
  for (let y = 15; y < 39; y += 4) p.hline(45, y, 13, 2)
  const pts = [[46, 37], [48, 36], [50, 33], [52, 30], [54, 24], [56, 17]]
  for (let i = 0; i + 1 < pts.length; i++) p.line(...pts[i], ...pts[i + 1], 11)
  const up = layer()
  up.poly([[52, 17], [56, 12], [60, 17]], 11)
  up.rect(55, 17, 3, 5, 11)
  up.outline(3)
  up.stamp(px)
  // FPS digits under the graph: "60"
  p.sprite(48, 41, ['bbb.bbb', 'b...b.b', 'bbb.b.b', 'b.b.b.b', 'bbb.bbb'], { b: 11 })
  // bottom row: two small "apply" and "cancel" buttons
  p.rect(5, 38, 16, 5, 11), p.hline(5, 38, 16, 7), p.hline(8, 40, 10, 3)
  p.rect(23, 38, 16, 5, 6), p.hline(26, 40, 10, 5)
}
