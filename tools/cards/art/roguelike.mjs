// Roguelike: a top-down dungeon room lit by two wall torches and fading into fog at the edges. A tiny knight squares
// up to a skeleton; a chest, a red potion, stairs down, and a gravestone with the last hero's sword (permadeath).
import { pen } from './_pix.mjs'
export const size = [64, 48]

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

export default function draw({ px }) {
  const p = pen(px)
  const lights = [[14, 8, 20], [50, 8, 20], [30, 28, 34]] // x, y, radius
  const light = (x, y) => {
    let v = 0
    for (const [lx, ly, r] of lights) v = Math.max(v, 1 - Math.hypot(x - lx, (y - ly) * 1.2) / r)
    return v
  }
  // lit, half-lit (checkered), or dark: pick from a [dark, lit] pair
  const zone = (x, y, dark, lit) => {
    const v = light(x, y)
    if (v > 0.32) return lit
    if (v > 0.2) return (x + y) % 2 ? lit : dark
    return dark
  }

  // floor: square flagstones, a lit top-left corner on each, dark mortar
  for (let y = 11; y < 48; y++) for (let x = 0; x < 64; x++) {
    const tx = (x + 2) % 7, ty = (y - 11) % 7
    if (tx === 6 || ty === 6) px(x, y, zone(x, y, 0, 1))
    else if ((tx === 0 && ty < 3) || (ty === 0 && tx < 3)) px(x, y, zone(x, y, 1, 6))
    else px(x, y, zone(x, y, 1, 5))
  }
  // a couple of cracks
  p.line(36, 39, 39, 42, 1), p.px(40, 42, 1)
  p.line(18, 17, 20, 19, 1)

  // back wall: bricks, warm near the torches
  for (let y = 0; y < 11; y++) for (let x = 0; x < 64; x++) {
    const row = Math.floor(y / 3), off = row % 2 ? 3 : 0
    if (y === 10) px(x, y, 0)
    else if ((x + off) % 6 === 5 || y % 3 === 2) px(x, y, zone(x, y + 6, 0, 1))
    else px(x, y, y % 3 === 0 ? zone(x, y + 6, 2, 4) : zone(x, y + 6, 1, 2))
  }

  // torches: bracket, flame, glow
  for (const tx of [14, 50]) {
    p.rect(tx - 1, 6, 3, 2, 5), p.px(tx, 8, 5)
    p.sprite(tx - 1, 1, ['.a.', '.aa', 'a9a', '989', '.8.'], { a: 10 })
    p.px(tx, 2, 7)
  }

  // stairs down, bottom right
  for (let i = 0; i < 4; i++) {
    p.rect(50 + i, 36 + i * 2, 11 - i, 2, [6, 5, 1, 0][i])
    p.hline(50 + i, 36 + i * 2, 11 - i, [7, 6, 5, 1][i])
  }
  p.vline(49, 36, 9, 0), p.vline(61, 36, 9, 0)

  // chest with gold bands and a glint
  p.sprite(38, 13, [
    '.4444444.',
    '499a99994',
    '4994a9944',
    '000000000',
    '4994a9942',
    '444a74442',
    '.2222222.',
  ], { a: 10 })
  p.px(46, 12, 7), p.px(47, 11, 10)

  // red potion
  p.sprite(9, 30, ['.6.', '.5.', '878', 'e88', '822', '.2.'], { e: 14 })
  p.px(10, 32, 7)

  // gravestone with the previous hero's sword stuck in front
  p.sprite(5, 39, [
    '.666.',
    '67765',
    '67565',
    '66665',
    '66555',
    '55551',
  ])
  p.vline(12, 39, 6, 6), p.px(11, 41, 9), p.px(13, 41, 9), p.px(12, 39, 7), p.px(12, 45, 5)

  // the knight: helmet, blue tunic, sword raised toward the skeleton
  p.sprite(22, 23, [
    '..666...7',
    '.67776.7.',
    '.6c0c6.6.',
    '..fff.96.',
    '.cccccf..',
    'ccc7cc...',
    '.cccc1...',
    '.4..4....',
  ], { c: 12, f: 15 })
  p.px(21, 28, 1), p.px(22, 31, 1), p.px(25, 31, 1)

  // the skeleton with a bone club
  p.sprite(33, 22, [
    '.7777..',
    '7707076',
    '777776.',
    '.7.7...',
    '6676667',
    '.676..7',
    '.676...',
    '.6.6...',
    '.6.6...',
  ])
  p.px(34, 31, 5), p.px(36, 31, 5)
  // scattered bones and a tension spark between them
  p.sprite(44, 27, ['7..7', '.66.', '7..7'])
  p.px(31, 24, 10), p.px(30, 23, 7)

  // fog of war at the edges
  for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) {
    const e = Math.min(x, 63 - x, (47 - y) * 1.4)
    if (e < 2) px(x, y, 0)
    else if (e < 5 && (x + y) % 2) px(x, y, 0)
  }
}
