// Rhythm Game: a neon note highway rushing toward the player in perspective, four lanes of gem notes falling onto
// the hit rings, one note bursting in a perfect hit; stage spotlights, speaker stacks and a combo flame on the side.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // concert backdrop: dark plum, spotlight beams, stars of light
  p.rect(0, 0, 64, 48, 1)
  p.rect(0, 0, 64, 10, 2)
  p.dither(0, 10, 64, 3, 2, 1)
  for (const [x0, x1] of [[6, 18], [58, 46]]) {
    for (let y = 0; y < 30; y++) {
      const t = y / 30, a = Math.round(x0 + (x1 - x0) * t * 0.5), w = 1 + Math.round(t * 5)
      for (let i = 0; i < w; i++) if ((a + i + y) % 2 === 0) px(a + (x0 < x1 ? i : -i), y, 13)
    }
  }
  p.rect(4, 0, 4, 2, 6), p.rect(56, 0, 4, 2, 6)

  // highway in perspective: narrow far end at the top, wide near the bottom
  const TOP = 3, BOT = 47, TL = 23, TR = 41, BL = 4, BR = 60
  const edge = (y, side) => (side ? TR + (BR - TR) * (y - TOP) / (BOT - TOP) : TL + (BL - TL) * (y - TOP) / (BOT - TOP))
  for (let y = TOP; y <= BOT; y++) {
    const l = Math.round(edge(y, 0)), r = Math.round(edge(y, 1))
    p.hline(l, y, r - l + 1, 0)
    // fret bars moving toward the player, spaced wider as they come closer
    const z = Math.pow((y - TOP) / (BOT - TOP), 0.6) * 9
    if (Math.abs(z - Math.round(z)) < 0.07) p.hline(l, y, r - l + 1, 1)
    p.px(l, y, 14), p.px(r, y, 12)
    p.px(l - 1, y, 2), p.px(r + 1, y, 13)
  }
  // lane dividers
  const lanePos = (y, k) => edge(y, 0) + (edge(y, 1) - edge(y, 0)) * k / 4
  for (let k = 1; k < 4; k++) for (let y = TOP; y <= BOT; y++) if (y % 2 === 0) p.px(Math.round(lanePos(y, k)), y, 5)

  const COLORS = [[14, 8, 2], [10, 9, 4], [12, 13, 1], [11, 3, 1]]
  // gem note at depth y in lane k, sized with perspective
  const note = (y, k) => {
    const [lit, base, dark] = COLORS[k]
    const cx = lanePos(y, k + 0.5), w = (edge(y, 1) - edge(y, 0)) / 4
    const rx = Math.max(1, w * 0.36), ry = Math.max(1, rx * 0.45)
    p.ellipse(cx, y, rx, ry, base)
    p.ellipse(cx, y + 1, rx, ry * 0.6, dark)
    p.ellipse(cx, y, rx, ry * 0.7, base)
    p.hline(Math.round(cx - rx * 0.5), Math.round(y - ry * 0.5), Math.max(1, Math.round(rx * 0.6)), lit)
    p.px(Math.round(cx - rx * 0.5), Math.round(y - ry * 0.5), 7)
  }
  note(7, 1)
  note(12, 3)
  note(17, 0)
  note(22, 2)
  note(29, 1)
  note(32, 3)
  // a held note's sustain trail in lane 0
  for (let y = 24; y < 39; y++) p.px(Math.round(lanePos(y, 0.5)), y, 14)
  note(38, 0)

  // hit rings at the strike line
  const HY = 42
  for (let k = 0; k < 4; k++) {
    const [lit, base, dark] = COLORS[k]
    const cx = lanePos(HY, k + 0.5)
    p.ellipse(cx, HY, 5, 2, dark)
    p.ring(cx, HY, 5, 2, base)
    p.px(Math.round(cx) - 3, HY - 2, lit)
  }
  // perfect hit bursting in lane 2
  const bx = Math.round(lanePos(HY, 2.5))
  p.ellipse(bx, HY, 4, 2, 7)
  for (const [dx, dy] of [[0, -7], [-6, -5], [6, -5], [-9, -1], [9, -1], [-3, -10], [4, -9]]) {
    p.line(bx + Math.round(dx * 0.4), HY + Math.round(dy * 0.4), bx + dx, HY + dy, dy < -6 ? 12 : 7)
  }
  p.sprite(bx - 1, HY - 14, ['.a.', 'a7a', '.a.'], { a: 10 })

  // speaker stacks on both sides
  const speaker = (x) => {
    p.rect(x, 26, 7, 21, 0)
    p.vline(x, 26, 21, 5), p.hline(x, 26, 7, 5)
    for (const y of [29, 37]) {
      p.disc(x + 3, y + 2, 2, 5)
      p.disc(x + 3, y + 2, 1, 1)
      p.px(x + 2, y + 1, 6)
    }
    p.rect(x + 2, 44, 3, 1, 5)
  }
  speaker(0), speaker(57)

  // combo flame and multiplier pips, top right
  p.sprite(55, 13, ['..8..', '.888.', '.898.', '89a98', '89a98', '.999.'], { a: 10 })
  for (let i = 0; i < 4; i++) p.rect(55 + (i % 2) * 3, 20 + Math.floor(i / 2) * 3, 2, 2, i < 3 ? 11 : 5)
  // health meter, top left: in the green
  p.rect(2, 13, 6, 10, 0)
  p.rect(3, 17, 4, 5, 11), p.hline(3, 17, 4, 7), p.rect(3, 14, 4, 3, 1)
}
