// Visual Novel: a smiling heroine's portrait on a rooftop at sunset, city skyline and cherry blossoms behind her,
// petals drifting; the dialogue box below with a name tag, a line of text and the blinking next arrow.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // sunset sky: plum at the top, pink, orange, a yellow sun low on the right
  p.rect(0, 0, 64, 7, 2)
  p.hline(0, 7, 64, 14), p.hline(0, 5, 64, 8)
  p.rect(0, 8, 64, 9, 14)
  p.hline(0, 17, 64, 9), p.hline(0, 15, 64, 15)
  p.rect(0, 18, 64, 16, 9)
  p.disc(53, 22, 5, 10)
  p.ellipse(53, 22, 4, 4, 10)
  p.px(51, 19, 7), p.px(52, 18, 7)
  p.hline(42, 13, 14, 15), p.hline(46, 14, 12, 9)
  p.hline(4, 10, 10, 15)

  // city skyline in plum, a few lit windows
  const towers = [[0, 24, 6], [6, 20, 5], [11, 26, 4], [42, 25, 5], [47, 21, 6], [53, 27, 4], [57, 23, 7]]
  for (const [x, y, w] of towers) {
    p.rect(x, y, w, 34 - y, 2)
    p.vline(x, y, 34 - y, 8)
  }
  for (const [x, y] of [[2, 27], [8, 23], [8, 27], [49, 24], [59, 26], [44, 29], [61, 30]]) p.px(x, y, 10)
  // rooftop railing
  p.hline(0, 30, 64, 5)
  for (let x = 1; x < 64; x += 5) p.vline(x, 30, 4, 5)
  p.hline(0, 31, 64, 13)

  // cherry branch top left with blossoms, petals drifting right
  p.line(0, 4, 9, 7, 4), p.line(9, 7, 15, 6, 4), p.line(5, 5, 8, 2, 4)
  for (const [x, y] of [[2, 3], [7, 1], [9, 5], [13, 4], [15, 7], [4, 6], [11, 8]]) {
    p.sprite(x - 1, y - 1, ['.e.', 'e7e', '.e.'], { e: 14 })
  }
  for (const [x, y] of [[20, 9], [44, 6], [58, 11], [38, 16], [6, 15], [17, 21]]) p.px(x, y, 14), p.px(x + 1, y, 7)

  // the heroine: long brown hair, big blue eyes, sailor uniform with a red ribbon
  p.sprite(19, 3, [
    '.........hhhhhhh..........',
    '......hhhhHHhhhhhhh.......',
    '.....hhHHhhhhhhhhhhh......',
    '....hhHhhhhhhhhhhhhhd.....',
    '....hHhhhhhhhhhhhhhhhd....',
    '...hhhhhhhhhhhhhhhhhhd....',
    '...hhhhhfhhhhhffhhhhhhd...',
    '...hhhhffffhhffffffhhhd...',
    '..hhhhffffffffffffffhhd...',
    '..hhhhfnnnfffffnnnffhhhd..',
    '..hhhhf7bbfffff7bbfffhhd..',
    '..hhhhfbbbfffffbbbfffhhd..',
    '..hhhhfn1nfffffn1nffshhd..',
    '..hhhheefffffffffeefshhd..',
    '..dhhhfffffffffffffsshhd..',
    '..dhhh.ffffff88fffss.hhd..',
    '..dhhh..sffffffffss..hhd..',
    '..dhhhh...sssssss...hhhd..',
    '.ddhhhh....fffff....hhhdd.',
    '.ddhhhh....sfffs....hhhdd.',
    '.ddhhh..uuuuuuuuuuu..hhdd.',
    'ddhhh.uucuuurrruuucuu.hhdd',
    'ddhh.uuucuuurRruuucguu.hdd',
    'dhh.uuuuccuurrRuucgguuu.hd',
    'dh.uuuuuuccccRRccgggguuu.d',
    'd.uuuuuuuuuc..cggggguuuu..',
    '.uuuuuuuuuuuc.cgggggguuuu.',
    'uuuuuuuuuuuuuc.cgggggguuuu',
  ], { h: 4, H: 9, d: 2, f: 15, s: 4, e: 14, n: 0, b: 12, u: 7, g: 6, c: 1, r: 8, R: 2 })
  // highlight streak in the hair (light from top-left)
  p.px(25, 6, 15), p.px(24, 7, 9)

  // dialogue box with name tag, text and the next arrow
  p.rect(1, 35, 62, 12, 1)
  p.hline(1, 35, 62, 13)
  p.vline(1, 35, 12, 13)
  p.hline(1, 46, 62, 0), p.vline(62, 36, 11, 0)
  p.rect(3, 32, 15, 5, 14)
  p.hline(3, 32, 15, 7)
  p.hline(3, 36, 15, 8)
  p.hline(5, 34, 9, 2)
  p.hline(4, 39, 22, 7), p.hline(28, 39, 14, 7), p.hline(44, 39, 9, 7)
  p.hline(4, 42, 17, 6), p.hline(23, 42, 6, 6)
  p.sprite(56, 42, ['aaaaa', '.a9a.', '..a..'], { a: 10 })
}
