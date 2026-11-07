// Monster collector: a cute sprout-eared critter on a grass patch next to a starry capture orb. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // backdrop: sky band over a grassy field
  rect(0, 0, 32, 14, 12)
  rect(0, 14, 32, 10, 11)
  rect(0, 14, 32, 1, 3)
  for (const [x, y] of [[2, 17], [8, 21], [20, 22], [29, 17], [26, 21], [14, 23]]) px(x, y, 3), px(x + 1, y - 1, 3)
  rect(18, 2, 6, 2, 7), rect(19, 1, 3, 1, 7)
  // ground shadows
  rect(3, 19, 14, 2, 3)
  rect(21, 19, 8, 1, 3)
  // critter: round lavender body, leaf sprout ears, cream belly
  const body = [[7, 7, 8], [5, 8, 12], [4, 9, 14], [4, 10, 14], [4, 11, 14], [4, 12, 14], [4, 13, 14], [4, 14, 14], [4, 15, 14], [5, 16, 12], [6, 17, 10]]
  for (const [x, y, w] of body) rect(x, y, w, 1, 13)
  for (const [x, y, w] of body.slice(4)) rect(x + w - 3, y, 3, 1, 2) // shadow side
  rect(8, 12, 6, 5, 15) // belly
  rect(9, 17, 4, 1, 15)
  // leaf ears
  rect(7, 4, 2, 3, 11), px(6, 3, 11), px(5, 2, 11), px(8, 6, 3)
  rect(13, 4, 2, 3, 11), px(15, 3, 11), px(16, 2, 11), px(13, 6, 3)
  px(7, 4, 7), px(14, 4, 7)
  // eyes, cheeks, smile with a tiny fang
  for (const ex of [7, 13]) rect(ex, 9, 2, 2, 0), px(ex, 9, 7)
  px(6, 11, 14), px(16, 11, 14)
  rect(10, 11, 2, 1, 0), px(11, 12, 7)
  // feet
  rect(6, 18, 3, 1, 2), rect(13, 18, 3, 1, 2)
  // capture orb: pink sphere in a gold band with a white gem
  const orb = [[23, 8, 4], [22, 9, 6], [21, 10, 8], [20, 11, 10], [20, 12, 10], [20, 13, 10], [20, 14, 10], [21, 15, 8], [22, 16, 6], [23, 17, 4]]
  for (const [x, y, w] of orb) rect(x, y, w, 1, 14)
  for (const [x, y, w] of orb.slice(3)) rect(x + w - 2, y, 2, 1, 2)
  rect(19, 12, 12, 2, 10)
  rect(19, 13, 12, 1, 9)
  rect(24, 11, 2, 4, 7), rect(23, 12, 4, 2, 7)
  px(25, 14, 6), px(26, 13, 6)
  px(23, 9, 7), px(22, 10, 7)
  // sparkles
  for (const [x, y] of [[19, 7], [29, 8], [28, 17]]) px(x, y, 7), px(x - 1, y, 6), px(x + 1, y, 6), px(x, y - 1, 6), px(x, y + 1, 6)
}
