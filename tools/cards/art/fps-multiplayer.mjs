// Multiplayer FPS: first-person gun, crosshair on an enemy behind cover, kill feed and health bar. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // sky, back wall with windows, floor
  rect(0, 0, 32, 6, 12)
  rect(0, 5, 32, 9, 13)
  rect(0, 5, 32, 1, 6)
  for (const x of [3, 11, 25]) rect(x, 7, 3, 3, 1)
  rect(0, 14, 32, 10, 5)
  rect(0, 14, 32, 1, 4)
  for (const x of [2, 9, 16, 23, 30]) px(x, 18, 4)
  // crates on the left
  rect(1, 10, 7, 5, 9), rect(1, 10, 7, 1, 10), rect(7, 10, 1, 5, 4)
  px(2, 12, 4), px(4, 12, 4), px(6, 12, 4)
  // enemy soldier in red
  rect(17, 7, 3, 1, 8), rect(17, 8, 3, 2, 15), px(18, 8, 0)
  rect(16, 10, 5, 4, 8), rect(20, 10, 1, 4, 2)
  rect(17, 14, 1, 2, 2), rect(19, 14, 1, 2, 2)
  rect(14, 11, 2, 1, 0) // their gun
  // crosshair over the enemy
  for (const [x, y] of [[18, 3], [18, 4], [18, 16], [18, 17], [13, 10], [14, 10], [22, 10], [23, 10]]) px(x, y, 7)
  // gun held in the bottom right
  rect(17, 17, 6, 2, 0), rect(17, 17, 6, 1, 6), px(16, 17, 7) // barrel and muzzle
  rect(21, 16, 11, 5, 0)
  rect(21, 16, 11, 1, 6), rect(22, 18, 6, 1, 5)
  rect(24, 15, 2, 1, 0) // sight
  rect(24, 21, 4, 3, 0)
  rect(23, 19, 5, 3, 15), rect(28, 19, 4, 5, 12), rect(28, 19, 4, 1, 6) // hand and sleeve
  // kill feed, top right: winner icon, arrow, loser icon
  rect(21, 0, 11, 5, 1)
  rect(22, 1, 2, 1, 12), rect(25, 1, 3, 1, 7), rect(29, 1, 2, 1, 8)
  rect(22, 3, 2, 1, 8), rect(25, 3, 3, 1, 7), rect(29, 3, 2, 1, 12)
  // health bar and ammo
  rect(1, 21, 9, 2, 0), rect(1, 21, 6, 2, 11)
  for (let x = 12; x < 20; x += 2) px(x, 22, 10)
}
