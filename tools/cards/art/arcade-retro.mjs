// Arcade space shooter: a ship firing up at generic invaders, score dots on top. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // black screen with a few stars
  rect(0, 0, 32, 24, 0)
  for (const [x, y] of [[1, 6], [29, 4], [27, 13], [3, 15], [10, 16], [24, 18], [30, 9], [6, 11]]) px(x, y, 5)
  px(20, 15, 6), px(2, 21, 6)
  // score row and lives
  for (let x = 1; x < 12; x += 2) px(x, 1, 7)
  px(13, 1, 10), px(15, 1, 10)
  for (const x of [25, 28]) px(x + 1, 0, 12), rect(x, 1, 3, 1, 12)
  // invader sprite, 7x5
  const alien = ['..x.x..', '.xxxxx.', 'xx.x.xx', 'xxxxxxx', '.x...x.']
  const drawAlien = (ax, ay, c, shade) => {
    alien.forEach((row, j) => [...row].forEach((ch, i) => ch === 'x' && px(ax + i, ay + j, j >= 3 ? shade : c)))
  }
  for (const ax of [3, 12, 21]) drawAlien(ax, 4, 14, 2)
  for (const ax of [3, 21]) drawAlien(ax, 10, 11, 3)
  // the middle bottom alien is exploding
  for (const [x, y] of [[15, 10], [13, 11], [17, 11], [14, 12], [16, 12], [12, 13], [18, 13], [15, 14]]) px(x, y, 10)
  px(15, 12, 9), px(15, 11, 7)
  // laser
  rect(15, 15, 1, 2, 10)
  // ship
  px(15, 17, 7)
  rect(14, 18, 3, 1, 12)
  rect(13, 19, 5, 1, 12)
  rect(12, 20, 7, 1, 12)
  rect(12, 21, 7, 1, 1)
  px(15, 18, 7), px(15, 19, 6)
  px(12, 20, 8), px(18, 20, 8)
  // ground line
  rect(0, 23, 32, 1, 3)
}
