// Arcade Retro: a space-shooter screen on a CRT. Three rows of original aliens (jellies, winged bugs, toothy blobs), a saucer crossing the top, the
// player ship firing and one invader bursting; score dots and spare ships on top, an enemy shot zigzagging down.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // black space, a ringed planet far behind, layered stars
  p.rect(0, 0, 64, 48, 0)
  p.disc(55, 40, 5, 2)
  p.ellipse(54, 39, 3, 3, 8)
  p.px(52, 37, 14), p.px(53, 36, 14)
  p.line(47, 43, 63, 37, 13)
  p.line(48, 43, 62, 38, 5)
  for (const [x, y] of [[3, 12], [12, 30], [24, 41], [37, 34], [60, 14], [8, 22], [42, 26], [30, 16], [19, 9], [58, 41], [2, 38], [48, 17]]) p.px(x, y, 5)
  for (const [x, y] of [[15, 21], [33, 28], [5, 33], [60, 22], [27, 37]]) p.px(x, y, 6)
  for (const [x, y] of [[40, 42], [9, 41]]) p.sprite(x - 1, y - 1, ['.6.', '676', '.6.'])

  // HUD: score dots, high score, spare ships
  for (let i = 0; i < 6; i++) p.rect(1 + i * 3, 1, 2, 2, 7)
  for (let i = 0; i < 4; i++) p.rect(23 + i * 3, 1, 2, 2, 10)
  for (const x of [50, 56]) p.sprite(x, 0, ['..7..', '.ccc.', 'ccccc'], { c: 12 })
  p.hline(0, 4, 64, 1)

  // saucer crossing the top
  p.sprite(5, 6, [
    '...e88e...',
    '.88888888.',
    '8a8a8a8a82',
    '.22222222.',
  ], { e: 14, a: 10 })

  // invaders: lit top rows, shaded bottom rows
  // original aliens: a one-eyed jelly, a winged bug with mandibles, a round toothy blob with antennae
  const jelly = ['..aaaaa..', '.aaaaaaa.', 'aaa777aaa', 'aaa707aaa', 'bbbbbbbbb', '.b.b.b.b.', 'b..b.b..b']
  const bug = ['b...aaa...b', 'bb.aaaaa.bb', 'bbba0a0abbb', '.bbaaaaabb.', '...aaaaa...', '...a...a...', '..a.....a..']
  const blob = ['.a.....a.', '..a...a..', '..aaaaa..', '.aa0a0aa.', 'aaaaaaaaa', 'a0707070a', '.bbbbbbb.']
  const alien = (x, y, rows, lit, shade, hi) => {
    p.sprite(x, y, rows, { a: lit, b: shade })
    const top = rows[0].indexOf('a')
    if (top >= 0) p.px(x + top, y, hi)
  }
  for (const x of [8, 22, 36, 50]) alien(x, 10, jelly, 14, 2, 7)
  for (const x of [8, 36, 50]) alien(x - 1, 19, bug, 11, 3, 7)
  for (const x of [8, 36, 50]) alien(x, 27, blob, 9, 4, 10)

  // the middle bug bursting
  for (const [x, y] of [[26, 18], [22, 20], [30, 20], [24, 23], [28, 23], [21, 25], [31, 25], [26, 27]]) p.px(x, y, 10)
  for (const [x, y] of [[25, 20], [27, 20], [24, 22], [28, 22], [26, 25]]) p.px(x, y, 9)
  p.sprite(25, 21, ['.7.', '777', '.7.'])
  p.px(20, 19, 8), p.px(32, 22, 8), p.px(23, 27, 8)

  // player laser
  p.vline(26, 29, 7, 10)
  p.vline(26, 31, 3, 7)

  // enemy shot zigzagging down
  for (const [x, y] of [[44, 34], [45, 35], [44, 36], [45, 37]]) p.px(x, y, 8)

  // player ship with thruster flame
  p.sprite(21, 37, [
    '.....7.....',
    '....676....',
    '....c6c....',
    '...cc7cc...',
    '.8.cc6cc.8.',
    '8ccccccccd8',
    'cccc1c1cccd',
    'ddd.ddd.ddd',
    '....a9a....',
    '.....a.....',
  ], { c: 12, d: 13, a: 10 })
  p.px(21, 42, 6)

  // ground line, rounded CRT corners
  p.hline(0, 47, 64, 3)
  for (const [x, y] of [[0, 0], [63, 0], [0, 47], [63, 47]]) p.px(x, y, 5)
}
