// A low-poly fox head, flat-shaded facets lit from the top left, over a 3D viewport grid with an axis gizmo. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]
export default function draw({ px }) {
  const p = pen(px)
  // viewport floor grid in perspective, very low contrast
  for (let y of [31, 34, 38, 43]) p.hline(0, y, 64, 1)
  for (let k = -6; k <= 6; k++) p.line(32 + k * 5, 29, 32 + k * 16, 47, 1)
  p.hline(0, 29, 64, 1)
  // axis gizmo in the corner
  p.line(4, 44, 10, 44, 8), p.px(10, 44, 14)
  p.line(4, 44, 4, 38, 11), p.px(4, 38, 11)
  p.line(4, 44, 1, 47, 12)
  p.px(4, 44, 7)
  // the fox, built from flat triangles on a layer so it can get a dark outline
  const L = layer()
  const tri = (a, b, c, col) => L.poly([a, b, c], col)
  const V = (x, y) => [Math.round(8 + x * 1.5), Math.round(1 + y * 1.8)]
  const earL = V(5, 0), earR = V(27, 0), crown = V(16, 6), inL = V(12, 6), inR = V(20, 6)
  const chL = V(3, 12), chR = V(29, 12), flL = V(0, 16), flR = V(32, 16)
  const brow = V(16, 12), jawL = V(10, 18), jawR = V(22, 18), chin = V(16, 23.5)
  const midL = V(9, 9), midR = V(23, 9)
  // ears: outer facets, then dark inner ear
  tri(earL, chL, inL, 9), tri(earL, inL, crown, 15)
  tri(earR, inR, chR, 4), tri(earR, crown, inR, 9)
  tri(V(6, 3), V(6, 9), V(11, 6), 2), tri(V(6, 3), V(11, 6), V(9, 5), 4)
  tri(V(26, 3), V(26, 9), V(21, 6), 2)
  // forehead, split into more facets
  tri(chL, inL, midL, 9), tri(inL, brow, midL, 15), tri(chL, midL, brow, 9)
  tri(inL, crown, brow, 15), tri(crown, inR, brow, 9)
  tri(inR, midR, brow, 9), tri(inR, chR, midR, 4), tri(midR, chR, brow, 4)
  // white cheek ruffs
  tri(chL, brow, jawL, 7), tri(chL, flL, jawL, 6), tri(chL, flL, V(1, 13), 7)
  tri(chR, brow, jawR, 6), tri(chR, flR, jawR, 13), tri(chR, flR, V(31, 13), 6)
  // muzzle
  tri(brow, jawL, chin, 15), tri(brow, jawR, chin, 6)
  tri(V(16, 12), V(13, 13), V(16, 19), 9), tri(V(16, 12), V(19, 13), V(16, 19), 4)
  tri(jawL, chin, V(13, 20), 6), tri(jawR, chin, V(19, 20), 13)
  L.outline(0)
  L.stamp(px)
  // facet edges catching the light on the lit side
  p.line(...earL.map(Math.round), ...inL.map(Math.round), 15)
  // eyes: dark almond shapes with a glint
  p.sprite(20, 17, ['000.', '0700', '.000'])
  p.sprite(40, 17, ['.000', '0070', '000.'])
  // nose
  p.sprite(30, 37, ['0000', '0500', '.00.'])
}
