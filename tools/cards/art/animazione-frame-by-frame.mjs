// A film strip: three frames of a bouncing ball, falling, stretching, squashing. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // strip with sprocket holes
  rect(0, 2, 31, 20, 5)
  for (let x = 1; x < 31; x += 4) rect(x, 3, 2, 1, 1), rect(x, 20, 2, 1, 1)
  // frames: paper background with a ground line
  for (const x0 of [1, 11, 21]) {
    rect(x0, 5, 9, 14, 15)
    rect(x0, 17, 9, 2, 4)
  }
  // frame 1: ball high up
  rect(4, 6, 4, 4, 8), rect(5, 6, 2, 4, 8)
  px(4, 6, 15), px(7, 6, 15), px(4, 9, 15), px(7, 9, 15)
  px(5, 7, 14)
  rect(4, 16, 4, 1, 13)
  // frame 2: onion skin of the last pose, then the ball falling, stretched
  rect(14, 6, 4, 4, 14), px(14, 6, 15), px(17, 6, 15), px(14, 9, 15), px(17, 9, 15)
  rect(15, 11, 3, 5, 8), px(15, 11, 15), px(17, 11, 15), px(15, 15, 15), px(17, 15, 15)
  px(15, 12, 14)
  rect(15, 16, 3, 1, 13)
  // frame 3: squashed on the ground
  rect(22, 14, 7, 3, 8), px(22, 14, 15), px(28, 14, 15)
  px(23, 14, 14), px(24, 14, 14)
  // impact puffs
  px(21, 15, 6), px(29, 15, 6), px(21, 13, 6), px(29, 13, 6)
}
