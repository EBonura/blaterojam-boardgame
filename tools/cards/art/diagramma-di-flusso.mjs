// A flowchart: start pill, a decision diamond with a question mark, two outcome boxes. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // start
  rect(11, 0, 10, 4, 11)
  px(11, 0, 3), px(20, 0, 3), px(11, 3, 3), px(20, 3, 3)
  rect(12, 3, 8, 1, 3)
  rect(13, 1, 6, 1, 7)
  // arrow down to the decision
  rect(16, 4, 1, 2, 7)
  // decision diamond
  for (let i = 0; i < 6; i++) {
    rect(16 - i, 6 + i, 1 + 2 * i, 1, 10)
    rect(16 - i, 16 - i, 1 + 2 * i, 1, 10)
    px(16 + i, 16 - i, 9), px(16 - i, 16 - i, 9), px(16 + i, 6 + i, 9)
  }
  px(14, 8, 7), px(15, 7, 7) // shine
  // branches out to the two outcomes
  rect(4, 11, 7, 1, 7), rect(4, 11, 1, 6, 7)
  rect(22, 11, 7, 1, 7), rect(28, 11, 1, 6, 7)
  px(3, 16, 7), px(5, 16, 7), px(27, 16, 7), px(29, 16, 7)
  // outcome boxes
  rect(0, 17, 9, 6, 12), rect(0, 22, 9, 1, 1)
  rect(2, 19, 5, 1, 7), rect(2, 20, 3, 1, 7)
  rect(23, 17, 9, 6, 8), rect(23, 22, 9, 1, 2)
  rect(25, 19, 5, 1, 7), rect(25, 20, 3, 1, 7)
}
