// Roguelike: a top-down dungeon room with a tiny hero, a skeleton, a chest and torches. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // stone walls with mortar lines
  rect(0, 0, 32, 24, 6)
  for (let y = 1; y < 24; y += 2) {
    for (let x = (y % 4 === 1 ? 0 : 2); x < 32; x += 4) px(x, y, 5)
  }
  // floor grid
  rect(2, 3, 28, 19, 5)
  for (let x = 2; x < 30; x += 4) rect(x, 3, 1, 19, 0)
  for (let y = 3; y < 22; y += 4) rect(2, y, 28, 1, 0)
  rect(2, 3, 28, 1, 0)
  // doorway at the top
  rect(14, 0, 4, 4, 0)
  // torches on the wall
  for (const tx of [6, 25]) {
    px(tx, 2, 4), px(tx, 1, 9), px(tx, 0, 10)
  }
  // hearts HUD on the top wall
  for (const hx of [1, 4]) px(hx, 0, 8), px(hx + 1, 0, 8), px(hx, 1, 8), px(hx + 1, 1, 8)
  // chest, top right
  rect(22, 6, 6, 1, 9)
  rect(22, 7, 6, 4, 4)
  rect(22, 8, 6, 1, 10)
  px(24, 9, 10), px(25, 9, 10)
  rect(22, 11, 6, 1, 2)
  // hero with a sword, lower left
  const hx = 8, hy = 13
  rect(hx + 1, hy, 3, 1, 12)
  rect(hx + 1, hy + 1, 3, 1, 15)
  px(hx + 2, hy + 1, 0)
  rect(hx, hy + 2, 5, 2, 12)
  px(hx, hy + 2, 15), px(hx + 4, hy + 2, 15)
  px(hx + 1, hy + 4, 4), px(hx + 3, hy + 4, 4)
  rect(hx + 5, hy - 2, 1, 4, 7)
  px(hx + 5, hy + 2, 10), px(hx + 4, hy + 2, 10), px(hx + 6, hy + 2, 10)
  // skeleton, middle
  const sx = 17, sy = 13
  rect(sx + 1, sy, 3, 2, 7)
  px(sx + 1, sy + 1, 0), px(sx + 3, sy + 1, 0)
  px(sx + 2, sy + 2, 7)
  rect(sx, sy + 3, 5, 1, 7)
  px(sx + 1, sy + 4, 6), px(sx + 2, sy + 4, 7), px(sx + 3, sy + 4, 6)
  px(sx + 1, sy + 5, 7), px(sx + 3, sy + 5, 7)
  px(sx - 1, sy + 2, 6), px(sx - 1, sy + 1, 6) // bone club
  // stairs down, bottom right
  rect(25, 17, 4, 4, 0)
  rect(25, 17, 4, 1, 13), rect(26, 19, 3, 1, 13)
}
