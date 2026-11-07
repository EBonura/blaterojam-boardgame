// Survival Horror 3D: first-person view down a dark hospital corridor in perspective. A flashlight cone from the
// player's hand lights a bloody handprint and a half-open door; at the far end a tall figure waits in a dim red
// doorway under a dangling lamp. Heartbeat line in the corner.
import { pen } from './_pix.mjs'
export const size = [64, 48]

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

export default function draw({ px }) {
  const p = pen(px)
  const VX = 34, VY = 20 // vanishing point
  const FL = 28, FR = 40, FT = 14, FB = 27 // far opening

  // which surface a pixel belongs to
  const surf = (x, y) => {
    if (x >= FL && x <= FR && y >= FT && y <= FB) return 'far'
    if (y > FB) {
      const k = (y - FB) / (47 - FB)
      if (x >= FL - k * FL && x <= FR + k * (63 - FR)) return 'floor'
    }
    if (y < FT) {
      const k = (FT - y) / FT
      if (x >= FL - k * FL && x <= FR + k * (63 - FR)) return 'ceil'
    }
    return x < VX ? 'left' : 'right'
  }

  // flashlight spot, centred on the right wall near the floor
  const SX = 49, SY = 31
  const ramps = {
    right: [1, 1, 5, 13, 6, 7],
    left: [1, 1, 1, 5, 13, 6],
    floor: [0, 1, 5, 5, 6, 6],
    ceil: [0, 0, 0, 1, 5, 5],
    far: [0, 0, 0, 0, 1, 1],
  }
  for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) {
    const s = surf(x, y)
    const d = Math.hypot((x - SX) / 16, (y - SY) / 14)
    let i = Math.max(0, 1 - d) // spot
    // the cone from the hand (bottom left) toward the spot
    const ax = 14, ay = 40, bx = SX, by = SY
    const vx = bx - ax, vy = by - ay
    const t = ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)
    if (t > 0 && t < 1) {
      const dist = Math.abs((x - ax) * vy - (y - ay) * vx) / Math.hypot(vx, vy)
      if (dist < 1 + t * 7) i = Math.max(i, 0.25 + 0.15 * t)
    }
    const r = ramps[s]
    const v = i * (r.length - 1) + (BAYER[y % 4][x % 4] / 16 - 0.5) * 0.35
    px(x, y, r[Math.max(0, Math.min(r.length - 1, Math.round(v)))])
  }

  // corridor edges where walls meet floor and ceiling, faint
  p.line(0, 47, FL, FB, 5)
  p.line(63, 47, FR, FB, 5)
  p.line(0, 0, FL, FT, 1)
  p.line(63, 0, FR, FT, 1)
  // far doorway: dim red light, a tall thin figure standing in it
  p.rect(30, 16, 8, 11, 2)
  p.hline(30, 16, 8, 8)
  p.rect(29, 15, 10, 1, 5), p.vline(29, 15, 12, 5), p.vline(38, 15, 12, 1)
  p.sprite(32, 17, [
    '.00.',
    '0880',
    '.00.',
    '0000',
    '0000',
    '0000',
    '0.00',
    '0..0',
    '0..0',
    '0..0',
  ])
  p.px(32, 18, 8), p.px(35, 18, 8)
  p.px(33, 18, 0), p.px(34, 18, 0)
  p.px(31, 22, 0), p.px(36, 22, 0), p.px(31, 23, 0), p.px(36, 24, 0) // long arms

  // dangling lamp halfway down, one bulb dead
  p.vline(34, 7, 4, 5)
  p.rect(32, 11, 5, 1, 6)
  p.px(31, 12, 5), p.px(37, 12, 5)
  p.px(33, 12, 5), p.px(35, 12, 5)

  // door ajar on the dark left wall, pale fingers curling round its edge
  p.poly([[6, 9], [14, 13], [14, 36], [6, 40]], 0)
  p.line(6, 9, 14, 13, 5), p.line(14, 13, 14, 36, 5)
  p.poly([[8, 11], [12, 13], [12, 36], [8, 38]], 1)
  p.sprite(13, 22, ['6.', '66', '6.', '66', '6.', '6.'])
  p.px(14, 22, 13), p.px(14, 24, 13)
  // bloody handprint and a drip trail on the lit wall
  p.sprite(46, 25, [
    '8.8.8..',
    '8.8.8.8',
    '888888.',
    '.88828.',
    '.8882..',
    '..82...',
    '..2....',
    '..2....',
  ])
  p.px(48, 34, 2), p.px(48, 36, 2)
  // drag marks on the floor toward the far door
  for (const [x, y] of [[44, 42], [43, 40], [41, 37], [40, 35], [39, 33], [38, 31], [37, 29]]) p.px(x, y, 2)
  for (const [x, y] of [[46, 41], [45, 39], [43, 36]]) p.px(x, y, 2)

  // player's hand and flashlight, bottom left, pointing down the corridor
  p.sprite(0, 35, [
    '..........776.',
    '.........77665',
    '........566651',
    '.......566551.',
    '......56655 1.',
    '.....56655.1..',
    '....5665511...',
    '..ff665511....',
    '.fff4f551.....',
    'fffff4f1......',
    'ffff4f44......',
    'fff4444.......',
    'ff444.........',
  ].map((r) => r.replace(' ', '5')), { f: 15 })
  // heartbeat monitor, top left
  p.sprite(2, 2, [
    '.....8.......',
    '....8.8......',
    '8888...8.8888',
    '........8....',
  ])
  p.px(14, 2, 8)
}
