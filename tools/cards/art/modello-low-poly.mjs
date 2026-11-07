// A low-poly fox head made of flat-shaded triangles, lit from the top left. 32x24, PICO-8 palette indexes.
export default function draw({ px }) {
  const tri = ([ax, ay], [bx, by], [cx, cy], c) => {
    const s = (x1, y1, x2, y2, x, y) => (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)
    for (let y = 0; y < 24; y++)
      for (let x = 0; x < 32; x++) {
        const X = x + 0.5, Y = y + 0.5
        const d1 = s(ax, ay, bx, by, X, Y), d2 = s(bx, by, cx, cy, X, Y), d3 = s(cx, cy, ax, ay, X, Y)
        if ((d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0)) px(x, y, c)
      }
  }
  const earL = [5, 0], earR = [27, 0], crown = [16, 6], inL = [12, 6], inR = [20, 6]
  const chL = [3, 12], chR = [29, 12], flL = [0, 16], flR = [32, 16]
  const brow = [16, 12], jawL = [10, 18], jawR = [22, 18], chin = [16, 23]
  // ears
  tri(earL, chL, inL, 9), tri(earL, inL, crown, 15)
  tri(earR, inR, chR, 4), tri(earR, crown, inR, 9)
  tri([6, 3], [6, 9], [11, 6], 2), tri([26, 3], [26, 9], [21, 6], 2)
  // forehead
  tri(chL, inL, brow, 9), tri(inL, crown, brow, 15), tri(crown, inR, brow, 9), tri(inR, chR, brow, 4)
  // white cheek ruffs
  tri(chL, brow, jawL, 7), tri(chL, flL, jawL, 6)
  tri(chR, brow, jawR, 6), tri(chR, flR, jawR, 13)
  // muzzle
  tri(brow, jawL, chin, 15), tri(brow, jawR, chin, 6)
  tri([16, 12], [13, 13], [16, 19], 9), tri([16, 12], [19, 13], [16, 19], 4)
  // nose and eyes
  px(15, 20, 0), px(16, 20, 0), px(15, 21, 0), px(16, 21, 0), px(15, 20, 5)
  for (const [x, y] of [[10, 10], [11, 10], [11, 11], [21, 10], [20, 10], [20, 11]]) px(x, y, 0)
  px(10, 10, 7), px(21, 10, 7)
}
