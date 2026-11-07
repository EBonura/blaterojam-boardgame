// MMORPG raid: a crowd of tiny adventurers around a huge horned boss with a long health bar. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // arena floor
  rect(0, 13, 32, 11, 5)
  for (const [x, y] of [[3, 15], [27, 16], [12, 22], [22, 21], [6, 20]]) px(x, y, 0), px(x + 1, y, 0)
  // boss health bar
  rect(1, 0, 30, 4, 7)
  rect(2, 1, 28, 2, 2)
  rect(2, 1, 19, 2, 8)
  rect(2, 1, 19, 1, 14)
  // boss: horned red ogre with yellow eyes and claws
  rect(10, 6, 12, 10, 8)
  rect(11, 5, 10, 1, 8)
  rect(19, 6, 3, 10, 2) // shadow side
  rect(8, 9, 2, 6, 8), rect(22, 9, 2, 6, 2) // arms
  px(8, 15, 7), px(9, 15, 7), px(22, 15, 7), px(23, 15, 7)
  px(9, 4, 7), px(10, 5, 7), px(8, 3, 6) // horns
  px(22, 4, 7), px(21, 5, 7), px(23, 3, 6)
  rect(12, 8, 2, 1, 10), rect(18, 8, 2, 1, 10)
  rect(13, 11, 6, 2, 0), px(14, 11, 7), px(17, 11, 7)
  rect(11, 16, 3, 2, 2), rect(18, 16, 3, 2, 2) // legs
  // the raid: tiny adventurers in a ring
  const hero = (x, y, hat, body) => {
    px(x, y, hat), px(x + 1, y, hat), px(x + 2, y, hat)
    px(x + 1, y + 1, 15)
    px(x, y + 2, body), px(x + 1, y + 2, body), px(x + 2, y + 2, body)
    px(x, y + 3, 0), px(x + 2, y + 3, 0)
  }
  const party = [[1, 12, 12, 12], [4, 17, 6, 6], [1, 19, 11, 3], [8, 20, 10, 9], [13, 19, 7, 7], [18, 20, 14, 2], [23, 19, 6, 12], [27, 17, 9, 4], [28, 12, 13, 1], [25, 13, 11, 11]]
  for (const [x, y, h, b] of party) hero(x, y, h, b)
  // spells flying at the boss
  for (const [x, y, c] of [[5, 11, 12], [6, 10, 12], [16, 18, 10], [15, 17, 10], [26, 11, 11], [25, 10, 11], [10, 18, 9]]) px(x, y, c)
  px(12, 6, 7), px(20, 13, 7) // hits
}
