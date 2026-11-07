// Tower defense: creeps marching along a winding dirt path while towers fire at them. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // grass
  rect(0, 0, 32, 24, 3)
  for (const [x, y] of [[2, 1], [11, 1], [28, 2], [3, 11], [16, 9], [27, 20], [13, 21], [30, 14], [1, 19]]) px(x, y, 11)
  // path: in from the left, down the right side, back left and out the bottom
  rect(0, 3, 25, 4, 4), rect(21, 3, 4, 15, 4), rect(5, 14, 20, 4, 4), rect(5, 14, 4, 10, 4)
  rect(0, 4, 24, 2, 9), rect(22, 4, 2, 13, 9), rect(6, 15, 18, 2, 9), rect(6, 15, 2, 9, 9)
  // creeps with tiny health bars
  const creep = (x, y, hp) => {
    rect(x, y + 1, 3, 2, 2)
    px(x + 1, y, 2)
    px(x, y + 1, 8), px(x + 2, y + 1, 8)
    rect(x, y - 2, 3, 1, 0)
    rect(x, y - 2, hp, 1, 11)
  }
  creep(3, 4, 3)
  creep(12, 4, 3)
  creep(22, 10, 1)
  creep(15, 15, 2)
  // stone tower with a cannon, inside the bend
  const tower = (x, y, top) => {
    rect(x, y + 2, 5, 6, 6)
    rect(x + 4, y + 2, 1, 6, 5)
    rect(x, y + 1, 5, 1, 6)
    px(x, y, 6), px(x + 2, y, 6), px(x + 4, y, 6)
    px(x + 2, y + 4, 0)
    rect(x, y + 8, 5, 1, 5)
    if (top) px(x + 1, y - 1, top), px(x + 2, y - 2, top), px(x + 3, y - 1, top), px(x + 2, y - 1, 7)
  }
  tower(10, 6, 12)
  tower(26, 7, 8)
  tower(14, 18, 0)
  // shots: a blue bolt and a cannonball trail
  for (const [x, y] of [[13, 4], [15, 3]]) px(x, y, 12)
  px(14, 4, 7)
  for (const [x, y] of [[25, 9], [24, 10]]) px(x, y, 10)
  px(23, 10, 9)
  px(16, 17, 10), px(16, 16, 9)
  // hit sparks on the hurt creep
  px(21, 9, 7), px(25, 11, 7)
}
