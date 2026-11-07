// Two devs shouting at each other, their words tangled into one scribble. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // tangled scribbles: loop-de-loops from each mouth, crossing in the middle
  const loops = (x0, dir, y0, c) => {
    for (let t = 0; t < 15; t += 0.05) {
      px(Math.round(x0 + dir * (0.85 * t - 2.6 * Math.sin(t))), Math.round(y0 - 2.6 * Math.cos(t)), c)
    }
  }
  loops(6, 1, 6, 7)
  loops(26, -1, 7, 14)
  // clash spark in the middle
  px(16, 0, 10), px(15, 1, 10), px(16, 1, 10), px(17, 1, 10), px(16, 2, 10)
  // bubble tails down to the mouths
  px(8, 11, 7), px(9, 12, 7)
  px(23, 12, 14), px(22, 13, 14)
  // left dev: brown hair, green hoodie, facing right
  rect(1, 20, 10, 4, 3), rect(1, 20, 10, 1, 11)
  rect(3, 13, 7, 7, 15)
  rect(3, 12, 7, 2, 4), rect(2, 13, 2, 4, 4)
  rect(6, 15, 3, 1, 0), px(8, 16, 7) // angry brow and eye
  rect(9, 17, 2, 2, 8), px(10, 17, 0) // shouting mouth
  // right dev: pink hair, orange hoodie, facing left
  rect(21, 20, 10, 4, 9), rect(21, 20, 10, 1, 10)
  rect(22, 13, 7, 7, 15)
  rect(22, 12, 7, 2, 14), rect(28, 13, 2, 4, 14)
  rect(23, 15, 3, 1, 0), px(23, 16, 7)
  rect(21, 17, 2, 2, 8), px(21, 17, 0)
  // steam out of their heads
  px(4, 10, 6), px(5, 9, 6), px(27, 10, 6), px(26, 9, 6)
}
