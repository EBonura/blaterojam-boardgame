// Quiz show screen: a big question mark over four coloured answer buttons. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // studio backdrop with spotlight rays
  rect(0, 0, 32, 13, 2)
  for (let y = 0; y < 13; y++) {
    px(15 - y, y, 14), px(16 + y, y, 14)
  }
  rect(0, 13, 32, 11, 1)
  // question mark with an orange drop shadow
  const q = ['..xxxx..', '.xxxxxx.', 'xx....xx', 'xx....xx', '.....xx.', '....xx..', '...xx...', '...xx...', '........', '...xx...', '...xx...']
  const qx = 12, qy = 1
  q.forEach((row, j) => [...row].forEach((ch, i) => ch === 'x' && px(qx + i + 1, qy + j + 1, 9)))
  q.forEach((row, j) => [...row].forEach((ch, i) => ch === 'x' && px(qx + i, qy + j, 10)))
  px(qx + 3, qy, 7), px(qx + 2, qy + 1, 7)
  // four answer buttons with highlight, shadow and a line of "text"
  const btn = (x, y, c, light, dark) => {
    rect(x, y, 13, 4, c)
    rect(x, y, 13, 1, light)
    rect(x, y + 4, 13, 1, dark)
    rect(x + 3, y + 2, 7, 1, 7)
  }
  btn(2, 13, 8, 14, 2)
  btn(17, 13, 12, 6, 1)
  btn(2, 18, 10, 7, 9)
  btn(17, 18, 11, 7, 3)
  // a sparkle
  px(27, 4, 7), px(26, 5, 7), px(28, 5, 7), px(27, 6, 7), px(27, 5, 10)
  px(4, 8, 7)
}
