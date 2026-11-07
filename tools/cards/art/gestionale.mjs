// Gestionale: a management-sim town seen from above. Red-roofed houses (one resident is complaining), a smoking
// factory, crop fields, a truck at the crossroads, and the build cursor placing a new house; money bar and a rising
// profit graph (with one dip) in the HUD.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)
  const coin = (x, y) => p.sprite(x, y, ['.aa.', 'a7a9', 'aa94', '.94.'], { a: 10 })

  // grass with faint tile corners
  p.rect(0, 0, 64, 48, 11)
  for (let y = 8; y < 48; y += 6) for (let x = 2; x < 64; x += 6) p.px(x, y, 3)
  for (const [x, y] of [[5, 9], [24, 7], [58, 43], [36, 44], [25, 23]]) p.px(x, y, 10)

  // roads: a crossroads with kerbs and a dashed centre line
  p.rect(0, 30, 64, 5, 5)
  p.hline(0, 30, 64, 6), p.hline(0, 34, 64, 1)
  p.rect(28, 4, 5, 44, 5)
  p.vline(28, 4, 44, 6), p.vline(32, 4, 44, 1)
  p.rect(28, 30, 5, 5, 5)
  for (let x = 1; x < 64; x += 4) if (x < 26 || x > 33) p.hline(x, 32, 2, 7)
  for (let y = 6; y < 48; y += 4) if (y < 29 || y > 35) p.vline(30, y, 2, 10)

  // house: roof (lit left slope), cream front with a window and a door, shadow below
  const house = (x, y, roof = 8, dark = 2, lit = 14) => {
    p.rect(x, y, 9, 4, roof)
    p.hline(x + 1, y - 1, 7, roof)
    p.rect(x + 5, y - 1, 4, 5, dark)
    p.hline(x + 1, y - 1, 3, lit)
    p.rect(x, y + 4, 9, 4, 15)
    p.vline(x + 8, y + 4, 4, 4)
    p.px(x + 2, y + 5, 12), p.px(x + 3, y + 5, 12)
    p.rect(x + 5, y + 5, 2, 3, 4)
    p.hline(x + 1, y + 8, 9, 3)
  }
  house(2, 11)
  house(15, 11, 12, 13, 6)
  house(3, 21, 9, 4, 10)
  house(16, 21)
  // complaint bubble over a house
  p.sprite(18, 3, ['.777.', '77877', '77877', '77777', '77877', '.777.', '..7..'])
  p.hline(19, 9, 3, 6)

  // trees: round crowns lit top-left, shadow down-right
  const tree = (x, y) => p.sprite(x, y, ['.333.', '3b333', '3b331', '33311', '.111.', '..4..'], { b: 11 })
  tree(10, 4), tree(23, 14), tree(57, 21), tree(35, 39), tree(1, 3)

  // factory: sawtooth roof, lit windows, a chimney smoking up and away
  p.rect(37, 17, 18, 8, 6)
  for (let i = 0; i < 3; i++) p.poly([[37 + i * 6, 17], [42 + i * 6, 14], [42 + i * 6, 17]], 13)
  for (let i = 0; i < 3; i++) p.line(37 + i * 6, 17, 42 + i * 6, 14, 7)
  p.vline(54, 17, 8, 5), p.hline(37, 24, 18, 5)
  for (const x of [39, 43, 47, 51]) p.rect(x, 19, 2, 2, 10)
  p.rect(44, 22, 3, 2, 1)
  p.rect(38, 10, 3, 7, 5), p.vline(38, 10, 7, 6), p.hline(38, 10, 3, 8)
  p.sprite(34, 4, ['.66..', '6665.', '.6655', '..55.', '...5.'])
  p.hline(37, 25, 19, 3)

  // crop fields: wheat and cabbages in rows
  p.rect(2, 37, 22, 5, 9)
  for (let y = 37; y < 42; y += 2) p.hline(2, y, 22, 10)
  p.vline(23, 37, 5, 4), p.hline(2, 42, 22, 4)
  p.rect(2, 43, 22, 5, 4)
  for (let x = 3; x < 23; x += 4) p.sprite(x, 43, ['b3', '33'], { b: 11 }), p.sprite(x + 2, 46, ['b3', '33'], { b: 11 })
  p.sprite(25, 41, ['f', 'c', '1'], { f: 15, c: 12 }) // farmer

  // build cursor placing a new house: ghost outline, bracket corners, a coin cost
  for (let y = 39; y < 47; y++) for (let x = 42; x < 52; x++) if ((x + y) % 2) px(x, y, 7)
  p.sprite(39, 37, ['777...........777', '7...............7'])
  p.sprite(39, 46, ['7...............7', '777...........777'])
  coin(54, 40)
  p.px(58, 41, 7), p.px(59, 41, 7)

  // truck at the crossroads
  p.sprite(14, 30, ['999977.', '9999771', '4444444', '.0...0.'])

  // HUD: coin and money bar top left, profit graph top right
  p.rect(0, 0, 26, 3, 1)
  coin(1, 0)
  p.rect(6, 1, 18, 1, 0)
  p.rect(6, 1, 14, 1, 11)
  p.px(19, 1, 7)
  p.rect(41, 0, 23, 10, 1)
  p.vline(41, 0, 10, 13), p.hline(41, 9, 23, 0)
  for (let x = 43; x < 63; x += 4) p.px(x, 8, 5)
  p.line(43, 7, 47, 5, 11), p.line(47, 5, 50, 7, 8), p.line(50, 7, 54, 4, 11), p.line(54, 4, 58, 3, 11), p.line(58, 3, 61, 1, 11)
  p.px(62, 1, 7), p.px(61, 2, 11)
}
