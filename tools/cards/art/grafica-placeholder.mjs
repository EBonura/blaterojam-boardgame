// The missing-texture cube: magenta and black checkers on every face. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const X0 = 5, Y0 = 6, S = 16, D = 5 // front face corner, size, depth
  // ground shadow
  rect(X0 + 2, Y0 + S, S + D - 2, 1, 1)
  // front face: 4px checkers
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) px(X0 + x, Y0 + y, ((x >> 2) + (y >> 2)) % 2 ? 0 : 14)
  // top face: sheared up and to the right
  for (let i = 1; i <= D; i++)
    for (let x = 0; x < S; x++) px(X0 + x + i, Y0 - i, ((x >> 2) + (((i - 1) * 2) / D | 0)) % 2 ? 14 : 0)
  // side face in shadow
  for (let i = 1; i <= D; i++)
    for (let y = 0; y < S; y++) px(X0 + S - 1 + i, Y0 + y - i, (((y + 1) >> 2) + (((i - 1) * 2) / D | 0)) % 2 ? 2 : 0)
  // light edges so the black squares don't melt into the background
  rect(X0 + D + 1, Y0 - D - 1, S, 1, 7)
  for (let i = 0; i <= D; i++) px(X0 + i, Y0 - i, 7), px(X0 + S + i, Y0 - i - 1 + 0, i === 0 ? 7 : 6)
  rect(X0, Y0, S, 1, 7)
  rect(X0 - 1, Y0, 1, S, 14)
  rect(X0 + S - 1 + D + 1, Y0 - D, 1, S, 2)
  for (let i = 0; i <= D; i++) px(X0 + S + i, Y0 + S - 1 - i, 2)
  rect(X0, Y0 + S, S, 1, 2)
}
