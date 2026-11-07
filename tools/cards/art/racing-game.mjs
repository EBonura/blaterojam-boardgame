// Racing Game: chase view of a red sports car on a desert canyon road, red-orange mesas behind, a rival far ahead,
// heading under the chequered finish banner; rev counter in the red, cactus and dust at the roadside.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // sky: deep blue to pale at the horizon
  p.rect(0, 0, 64, 20, 12)
  p.rect(0, 0, 64, 5, 1)
  p.dither(0, 5, 64, 2, 12, 1)
  p.rect(0, 16, 64, 4, 6)
  p.hline(0, 15, 64, 6)
  p.hline(6, 8, 9, 7), p.hline(9, 9, 8, 6)

  // mesas: flat-topped rock, lit left faces, layered stripes
  const mesa = (x, w, top, lit, base, dark) => {
    p.rect(x, top, w, 20 - top, base)
    p.hline(x + 1, top - 1, w - 2, lit)
    p.vline(x, top, 20 - top, lit)
    p.rect(x + w - 3, top, 3, 20 - top, dark)
    for (let y = top + 3; y < 20; y += 3) p.hline(x + 1, y, w - 4, dark)
  }
  mesa(2, 13, 9, 15, 9, 4)
  mesa(45, 17, 7, 15, 9, 4)
  mesa(17, 6, 13, 9, 4, 2)
  mesa(56, 6, 12, 9, 4, 2)

  // desert ground
  p.rect(0, 20, 64, 28, 9)
  p.dither(0, 20, 64, 3, 4, 9)
  for (const [x, y] of [[4, 26], [12, 31], [55, 28], [60, 36], [7, 40], [58, 44]]) p.hline(x, y, 3, 4)
  for (const [x, y] of [[9, 23], [50, 24], [2, 33]]) p.px(x, y, 15)

  // road in perspective with red-white kerbs and a dashed centre line
  const VX = 32, TOP = 20
  for (let y = TOP; y < 48; y++) {
    const t = (y - TOP) / (47 - TOP), half = 3 + t * 30
    const l = Math.round(VX - half), r = Math.round(VX + half)
    p.hline(l, y, r - l + 1, 5)
    const k = Math.max(1, Math.round(t * 3)), band = Math.floor(Math.pow(t, 0.5) * 10) % 2
    p.hline(l - k, y, k, band ? 8 : 7)
    p.hline(r + 1, y, k, band ? 8 : 7)
    if (Math.floor(Math.pow(t, 0.5) * 12) % 2 === 0) p.hline(VX - Math.floor(t * 1.5), y, 1 + Math.floor(t * 2), 7)
  }
  // road texture
  for (const [x, y] of [[24, 34], [41, 31], [19, 44], [46, 43], [29, 27]]) p.px(x, y, 6)
  p.px(27, 39, 1), p.px(38, 37, 1)

  // finish banner on two posts
  p.vline(18, 4, 18, 6), p.vline(19, 4, 18, 5)
  p.vline(45, 4, 18, 6), p.vline(46, 4, 18, 5)
  p.rect(18, 4, 29, 6, 7)
  for (let y = 0; y < 3; y++) for (let x = 0; x < 14; x++) if ((x + y) % 2) p.rect(19 + x * 2, 5 + y * 2 - (y > 1 ? 1 : 0), 2, y > 1 ? 1 : 2, 0)
  p.hline(18, 4, 29, 6), p.hline(18, 9, 29, 5)
  p.px(17, 4, 8), p.px(47, 4, 8)

  // rival far ahead, small and blue
  p.sprite(30, 19, ['.cc.', 'c77c', '8cc8', '0..0'], { c: 12 })

  // roadside cactus and a tumbleweed
  p.sprite(5, 17, ['..3..', '..3.3', '3.3.3', '3.333', '333..', '..3..', '..3..'])
  p.sprite(58, 24, ['.4.4', '4.4.', '.4.4'])

  // the player's car from behind
  p.sprite(20, 31, [
    '.....00000000000000.....',
    '....0c7cccccccccc11c0...',
    '...0cc6666666666661cc0..',
    '...0c6111111111116611c0.',
    '..022222222222222222222.',
    '.0888e888888888888888820',
    '0e8888888888888888888882',
    '0eE88888888888888888E882',
    '0e8ee2777777777772ee8882',
    '08800006666666600008822.',
    '022288800000000888222220',
    '00000222222222222000000.',
    '0000.............00000..',
    '.000..............000...',
  ], { c: 8, e: 14, E: 7 })
  // tail lights glowing, exhaust puffs
  p.rect(22, 38, 3, 1, 8), p.rect(39, 38, 3, 1, 8)
  p.px(22, 38, 14), p.px(39, 38, 14)
  p.sprite(14, 41, ['.66.', '6665', '.55.'])
  p.sprite(9, 39, ['.6', '65'])

  // rev counter, bottom right: needle in the red
  p.disc(57, 42, 6, 0)
  p.ring(57, 42, 6, 6, 5)
  for (const [x, y, c] of [[52, 41, 7], [53, 38, 7], [57, 37, 7], [60, 38, 8], [62, 40, 8]]) p.px(x, y, c)
  p.line(57, 42, 61, 39, 8)
  p.px(57, 42, 7)
}
