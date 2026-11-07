// FPS Multiplayer: first-person view in a container yard. The player's rifle flashes as the crosshair lands on a
// red-team soldier peeking from behind a crate; kill feed, minimap, health bar and ammo on the HUD, a blue teammate
// with a name tag on the left.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // pale overcast sky, crane silhouettes
  p.rect(0, 0, 64, 20, 6)
  p.rect(0, 0, 64, 6, 13)
  p.hline(0, 6, 64, 13), p.dither(0, 7, 64, 2, 13, 6)
  p.hline(36, 4, 22, 5), p.vline(54, 4, 16, 5), p.vline(52, 4, 16, 5)
  for (let y = 5; y < 20; y += 3) p.line(52, y, 54, y + 2, 5)
  p.line(40, 4, 40, 9, 5), p.rect(39, 9, 3, 2, 5)

  // back wall of the yard
  p.rect(0, 14, 64, 14, 5)
  p.hline(0, 14, 64, 6)
  for (let x = 2; x < 64; x += 5) p.vline(x, 15, 12, 1)

  // concrete ground in perspective with a hazard line
  p.rect(0, 28, 64, 20, 5)
  p.hline(0, 28, 64, 6)
  p.dither(0, 29, 64, 3, 6, 5)
  p.line(24, 34, 30, 34, 1), p.line(48, 33, 56, 33, 1), p.line(10, 45, 22, 45, 1)
  p.line(20, 29, 0, 41, 10), p.line(21, 29, 2, 41, 10)

  // stacked containers on the left: blue over orange, corrugated
  const container = (x, y, w, h, lit, base, dark) => {
    p.rect(x, y, w, h, base)
    p.hline(x, y, w, lit)
    for (let i = x + 2; i < x + w - 1; i += 2) p.vline(i, y + 1, h - 2, dark)
    p.hline(x, y + h - 1, w, 1)
    p.vline(x + w - 1, y, h, dark)
  }
  container(0, 10, 19, 9, 6, 12, 13)
  container(0, 19, 23, 10, 10, 9, 4)
  p.rect(18, 21, 2, 6, 4), p.px(18, 23, 10)
  // the blue teammate at the container corner, name tag above
  p.sprite(24, 20, ['.cc.', 'c11c', 'cfff', 'cccc', 'c.cc', '1..1'], { c: 12, f: 15 })
  p.hline(23, 17, 6, 12), p.px(22, 17, 1), p.px(29, 17, 1)

  // crate in the middle distance with the enemy peeking out
  p.rect(36, 22, 12, 9, 4)
  p.rect(36, 22, 12, 1, 9), p.vline(36, 22, 9, 9)
  p.line(37, 23, 46, 29, 2), p.line(37, 29, 46, 23, 2)
  p.hline(36, 30, 12, 2), p.vline(47, 23, 8, 2)
  p.hline(37, 31, 12, 1)
  // red soldier: helmet, visor, shoulder and rifle poking out
  p.sprite(39, 15, [
    '.8888.',
    '888822',
    '800002',
    '8ffff2',
    '.8822.',
    '888822',
    '888822',
  ], { f: 15 })
  p.px(40, 15, 14), p.px(40, 17, 6)
  p.hline(32, 21, 7, 0), p.px(31, 21, 5)
  // name tag in red
  p.hline(39, 12, 6, 8)

  // crosshair on him, with a hit marker
  const CX = 41, CY = 18
  for (const [dx, dy] of [[-6, 0], [-5, 0], [-4, 0], [4, 0], [5, 0], [6, 0], [0, -6], [0, -5], [0, -4], [0, 4], [0, 5], [0, 6]]) p.px(CX + dx, CY + dy, 11)
  for (const [dx, dy] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) p.px(CX + dx, CY + dy, 7)

  // the player's rifle, bottom right, pointing into the scene and firing
  const g = layer()
  g.poly([[0, 7], [13, 7], [13, 12], [0, 10]], 1) // barrel
  g.hline(0, 7, 13, 6), g.hline(0, 8, 13, 5)
  g.poly([[11, 8], [26, 3], [26, 17], [15, 17]], 1) // body side
  g.poly([[11, 7], [26, 1], [26, 5], [13, 9]], 5) // lit top
  g.line(11, 7, 26, 1, 6)
  g.line(14, 12, 26, 8, 13), g.line(16, 15, 26, 12, 0)
  g.rect(18, 0, 4, 3, 0), g.hline(18, 0, 4, 5) // sight
  // hand on the grip, green sleeve
  g.sprite(14, 12, ['..fff....', '.fffff...', 'ffff4f333', 'fff44f333', '.f44.3b33', '....33333'], { f: 15, b: 11 })
  g.outline(0)
  g.stamp(px, 37, 31)
  p.px(37, 37, 0), p.px(37, 38, 0)
  // muzzle flash and an ejected shell casing
  p.sprite(30, 33, ['..a..', '.a7a.', 'a777a', '.a9a.', '..a..'], { a: 10 })
  p.px(29, 35, 9), p.px(35, 35, 9), p.px(32, 31, 9)
  p.sprite(57, 29, ['a.', '.9'], { a: 10 })

  // HUD: kill feed top right, minimap top left, health and ammo bottom left
  p.rect(43, 1, 20, 7, 1)
  p.hline(44, 2, 5, 12), p.sprite(50, 2, ['666', '.6.']), p.hline(54, 2, 7, 8)
  p.hline(44, 5, 6, 8), p.sprite(51, 5, ['666', '.6.']), p.hline(55, 5, 6, 12)
  p.disc(5, 5, 4, 1)
  p.ring(5, 5, 4, 4, 13)
  p.px(5, 5, 7), p.px(4, 4, 7), p.px(7, 3, 8), p.px(3, 7, 12), p.px(6, 7, 12)
  p.rect(1, 42, 3, 3, 7), p.hline(0, 43, 5, 7), p.vline(2, 41, 5, 7), p.px(2, 43, 8)
  p.rect(6, 42, 16, 3, 0)
  p.rect(6, 42, 11, 3, 11), p.hline(6, 42, 11, 7), p.hline(6, 44, 11, 3)
  for (let i = 0; i < 8; i++) p.rect(6 + i * 2, 46, 1, 2, i < 6 ? 10 : 5)
}
