// A dev face-down on the keyboard under the moon, coffee cups piling up. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // moon and stars
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    if (dx * dx + dy * dy <= 10 && (dx - 2) ** 2 + (dy + 1) ** 2 > 7) px(4 + dx, 4 + dy, 10)
  }
  px(2, 6, 15), px(3, 7, 15)
  for (const [x, y] of [[11, 1], [13, 5], [9, 7], [30, 6], [26, 10], [1, 11]]) px(x, y, 7)
  // Zzz rising from the sleeper
  const z = (x, y, s) => { rect(x, y, s, 1, 7), rect(x, y + s - 1, s, 1, 7); for (let i = 1; i < s - 1; i++) px(x + s - 1 - i, y + i, 7) }
  z(17, 5, 4), z(22, 0, 5)
  // desk
  rect(0, 19, 32, 1, 9)
  rect(0, 20, 32, 1, 4)
  rect(0, 21, 32, 3, 2)
  // hoodie shoulders behind the head
  for (let y = 10; y < 19; y++) {
    const w = y < 11 ? 12 : y < 12 ? 16 : 18
    rect(11 - w / 2, y, w, 1, 12)
  }
  rect(5, 10, 12, 1, 13)
  // arms flopped on the desk, hands limp
  rect(0, 16, 4, 3, 12), rect(0, 16, 4, 1, 13), rect(0, 17, 1, 2, 15)
  rect(18, 16, 4, 3, 12), rect(18, 16, 4, 1, 13), rect(22, 17, 2, 2, 15)
  // keyboard
  rect(4, 17, 15, 2, 6)
  for (let x = 4; x < 19; x += 2) px(x, 17, 7)
  // head, face down: hair and two ears
  for (let dy = -5; dy <= 4; dy++) for (let dx = -5; dx <= 5; dx++) {
    if (dx * dx + dy * dy <= 27) px(11 + dx, 12 + dy, 4)
  }
  px(8, 8, 9), px(9, 8, 9), px(7, 9, 9), px(10, 7, 9) // shine on the hair
  rect(5, 12, 1, 3, 15), rect(17, 12, 1, 3, 15) // ears
  px(15, 17, 12), px(16, 18, 12) // drool on the keys
  // a pyramid of empty coffee cups
  const cup = (x, y) => { rect(x, y, 3, 4, 7), rect(x + 2, y, 1, 4, 6), rect(x, y, 3, 1, 4), px(x + 3, y + 1, 6), px(x + 3, y + 2, 6) }
  cup(24, 15), cup(28, 15), cup(26, 11)
}
