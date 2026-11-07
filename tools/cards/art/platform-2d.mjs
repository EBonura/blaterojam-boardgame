// Side-view platformer: a hero mid-jump between floating brick platforms, reaching for a coin. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // sky and clouds
  rect(0, 0, 32, 24, 12)
  rect(2, 3, 6, 2, 7), rect(3, 2, 3, 1, 7), rect(2, 5, 6, 1, 6)
  rect(24, 1, 5, 2, 7), rect(25, 0, 2, 1, 7), rect(24, 3, 5, 1, 6)
  // distant hills
  rect(0, 17, 9, 3, 3), rect(2, 16, 5, 1, 3)
  rect(22, 16, 10, 4, 3), rect(24, 15, 6, 1, 3)
  // ground: grass over dirt
  rect(0, 20, 32, 4, 4)
  rect(0, 20, 32, 1, 11)
  rect(0, 21, 32, 1, 3)
  for (const [x, y] of [[3, 22], [9, 23], [15, 22], [21, 23], [27, 22], [30, 23]]) px(x, y, 2)
  // floating brick platforms
  const bricks = (x, y, w) => {
    rect(x, y, w, 3, 9)
    rect(x, y + 2, w, 1, 4)
    for (let i = x + 2; i < x + w; i += 3) px(i, y + 1, 4)
    rect(x, y, w, 1, 10)
  }
  bricks(19, 11, 11)
  bricks(1, 14, 7)
  // coin above the right platform
  rect(23, 5, 3, 4, 10)
  px(22, 6, 10), px(22, 7, 10), px(26, 6, 9), px(26, 7, 9)
  rect(24, 6, 1, 2, 9), px(23, 5, 7)
  px(28, 5, 7), px(20, 7, 7)
  // hero mid-jump: cap, face, one fist raised, legs tucked
  const hx = 10, hy = 6
  rect(hx + 1, hy + 1, 4, 1, 12), rect(hx + 1, hy + 2, 6, 1, 12) // cap with brim
  rect(hx + 1, hy + 3, 5, 2, 15)
  px(hx + 4, hy + 3, 0)
  rect(hx + 1, hy + 5, 4, 3, 11)
  rect(hx + 1, hy + 7, 4, 1, 3)
  px(hx + 5, hy + 5, 11), px(hx + 6, hy + 4, 15), px(hx + 6, hy + 3, 15) // raised arm
  px(hx, hy + 6, 15)
  rect(hx + 1, hy + 8, 4, 1, 1)
  px(hx, hy + 9, 1), px(hx + 4, hy + 9, 1)
  px(hx - 1, hy + 9, 4), px(hx - 1, hy + 10, 4), px(hx + 5, hy + 9, 4), px(hx + 5, hy + 10, 4)
  // jump arc dots from the left platform
  for (const [x, y] of [[6, 12], [7, 10], [8, 9]]) px(x, y, 7)
  // a blob enemy on the ground
  rect(15, 18, 4, 2, 2), rect(16, 17, 2, 1, 2)
  px(16, 18, 7), px(18, 18, 7)
}
