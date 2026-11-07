// Builds card art and print-ready cards from src/cards/cards.json.
//   public/cards/art/<id>.svg   pixel art used in the game (32x24 grid)
//   print/<id>.svg              full card, 63x88 mm trim + 3 mm bleed (69x94 mm)
// Run: npm run cards
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { effectRows, DISPLAY_ORDER, STAT_LABEL } from '../../src/cards/effects.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/cards/cards.json'), 'utf8'))

// PICO-8 palette
export const PAL = ['#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8',
  '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa']
const ART_W = 32, ART_H = 24
const SANS = "system-ui, Helvetica, Arial, sans-serif"
const PIXEL = "'Silkscreen', 'Press Start 2P', monospace"

async function artSvgBody(id) {
  const file = path.join(root, 'tools/cards/art', `${id}.mjs`)
  if (!fs.existsSync(file)) return `<text x="16" y="13" font-size="2.6" font-family="monospace" text-anchor="middle" fill="${PAL[13]}">${id}</text>`
  const grid = Array.from({ length: ART_H }, () => Array(ART_W).fill(-1))
  const px = (x, y, c) => { if (x >= 0 && y >= 0 && x < ART_W && y < ART_H) grid[y][x] = c }
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c) }
  const { default: draw } = await import(pathToFileURL(file).href + `?t=${Date.now()}`)
  draw({ px, rect })
  // Merge horizontal runs of one colour into single rects to keep files small.
  let out = ''
  for (let y = 0; y < ART_H; y++) {
    for (let x = 0; x < ART_W; ) {
      const c = grid[y][x]
      let w = 1
      while (x + w < ART_W && grid[y][x + w] === c) w++
      if (c >= 0) out += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${PAL[c]}"/>`
      x += w
    }
  }
  return out
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Greedy word wrap by estimated character width (~0.55em per char). */
function wrap(text, widthMm, sizeMm, k = 0.55) {
  const max = Math.floor(widthMm / (sizeMm * k))
  const lines = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > max && line) (lines.push(line), (line = word))
    else line = (line + ' ' + word).trim()
  }
  if (line) lines.push(line)
  return lines
}
const tspans = (lines, x, lh) => lines.map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(l)}</tspan>`).join('')

function background(frame) {
  if (frame.rainbow)
    return `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">${['#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8']
      .map((c, i, a) => `<stop offset="${i / (a.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient></defs><rect width="69" height="94" fill="url(#bg)"/>`
  if (frame.foil)
    return `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c2c3c7"/><stop offset=".35" stop-color="#fff1e8"/><stop offset=".5" stop-color="#83769c"/><stop offset=".65" stop-color="#fff1e8"/><stop offset="1" stop-color="#c2c3c7"/></linearGradient></defs><rect width="69" height="94" fill="url(#bg)"/>`
  return `<rect width="69" height="94" fill="${frame.color}"/>`
}

const TONE = { gd: PAL[9], prog: PAL[12], graf: PAL[14], audio: PAL[11], neg: PAL[8], any: PAL[10] }

function titleBlock(title, y0 = 6, h = 11) {
  const up = title.toUpperCase()
  const size = up.length > 18 ? 3.3 : up.length > 12 ? 3.8 : 4.6
  const lines = wrap(up, 52, size, 0.66)
  const y = y0 + h / 2 - ((lines.length - 1) * size * 1.12) / 2 + size * 0.36
  return `<text x="34.5" y="${y}" text-anchor="middle" font-family="${SANS}" font-weight="900" font-size="${size}" fill="${PAL[7]}">${tspans(lines, 34.5, size * 1.12)}</text>`
}

function artWindow(art, y = 21.5, h = 39) {
  return `<svg x="${34.5 - (h * 4) / 6}" y="${y}" width="${(h * 4) / 3}" height="${h}" viewBox="0 0 ${ART_W} ${ART_H}" shape-rendering="crispEdges">${art}</svg>`
}

/** The effect box: big numbers, like the game. */
function effectBlock(card, top, bottom) {
  const rows = effectRows(card.effect)
  const h = bottom - top
  let out = ''
  if (!rows) {
    const lines = wrap(card.text, 48, 3.6)
    const y = top + h / 2 - ((lines.length - 1) * 4.5) / 2 + 1.3
    return `<text x="34.5" y="${y}" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="3.6" fill="${PAL[7]}">${tspans(lines, 34.5, 4.5)}</text>`
  }
  const quote = card.quote ? card.quote.flatMap((l) => wrap(l, 50, 2.3, 0.46)) : []
  const space = h - (quote.length ? quote.length * 3 + 1.5 : 0)
  const num = Math.min([0, 13, 9, 7, 5.6][rows.length], (space / rows.length) * 0.82)
  const step = space / rows.length
  if (rows.length === 1) {
    // One effect: a huge number with its label centred underneath.
    const r = rows[0], fill = TONE[r.tone]
    const big = Math.min(14, space * 0.55)
    const label = wrap(r.label.toUpperCase(), 50, 3, 0.62)
    const block = big * 0.75 + 1.5 + label.length * 3.3
    const y0 = top + (space - block) / 2 + big * 0.75
    out += `<text x="34.5" y="${y0}" text-anchor="middle" font-family="${SANS}" font-weight="900" font-size="${big}" fill="${fill}">${esc(r.num)}</text>`
    out += `<text x="34.5" y="${y0 + 1.5 + 3}" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="3" fill="${fill}">${tspans(label, 34.5, 3.3)}</text>`
  } else rows.forEach((r, i) => {
    const cy = top + step * (i + 0.5) + num * 0.36
    const fill = TONE[r.tone]
    const ls = Math.max(2.4, Math.min(3.4, num * 0.42))
    out += `<text x="30" y="${cy}" text-anchor="end" font-family="${SANS}" font-weight="900" font-size="${num}" fill="${fill}">${esc(r.num)}</text>`
    out += `<text x="32" y="${cy - num * 0.36 + ls * 0.36}" font-family="${SANS}" font-weight="800" font-size="${ls}" fill="${fill}">${esc(r.label.toUpperCase())}</text>`
  })
  if (quote.length)
    out += `<text x="34.5" y="${top + space + 2.2}" text-anchor="middle" font-family="${SANS}" font-style="italic" font-size="2.3" fill="${PAL[15]}">${tspans(quote, 34.5, 3)}</text>`
  return out
}

function printCard(card, frame, label, art) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="69mm" height="94mm" viewBox="0 0 69 94">
  <!-- trim box: x 3..66, y 3..91. Safe area: 3 mm inside the trim. -->
  ${background(frame)}
  <rect x="6" y="6" width="57" height="82" rx="2.5" fill="${PAL[1]}"/>
  <path d="M6 17 V8.5 a2.5 2.5 0 0 1 2.5 -2.5 H60.5 a2.5 2.5 0 0 1 2.5 2.5 V17 Z" fill="#14203f"/>
  <rect x="6" y="17" width="57" height="0.7" fill="${frame.color}"/>
  ${titleBlock(card.title)}
  <text x="60.5" y="21" text-anchor="end" font-family="${SANS}" font-style="italic" font-weight="700" font-size="2.6" fill="${frame.color}">${esc(label)}</text>
  ${artWindow(art)}
  <path d="M6 62 H63 V85.5 a2.5 2.5 0 0 1 -2.5 2.5 H8.5 a2.5 2.5 0 0 1 -2.5 -2.5 Z" fill="#16244a"/>
  <rect x="6" y="62" width="57" height="0.7" fill="${frame.color}"/>
  ${effectBlock(card, 63, 85.5)}
  <text x="34.5" y="87.2" text-anchor="middle" font-family="${SANS}" font-size="1.5" fill="${PAL[13]}">BLATERO GAME JAM · KUDA GAMES</text>
</svg>
`
}

function printSheet(sheet, art) {
  const rows = DISPLAY_ORDER.map((id, i) => {
    const y = 64.5 + i * 5.6
    return `<text x="11" y="${y}" font-family="${SANS}" font-weight="700" font-size="3.4" fill="${TONE[id]}">${esc(STAT_LABEL[id])}</text>
  <text x="58" y="${y}" text-anchor="end" font-family="${SANS}" font-weight="900" font-size="4.6" fill="${PAL[7]}">${sheet.target[id]}</text>`
  }).join('\n  ')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="69mm" height="94mm" viewBox="0 0 69 94">
  <rect width="69" height="94" fill="${PAL[12]}"/>
  <rect x="6" y="6" width="57" height="82" rx="2.5" fill="${PAL[1]}"/>
  <path d="M6 17 V8.5 a2.5 2.5 0 0 1 2.5 -2.5 H60.5 a2.5 2.5 0 0 1 2.5 2.5 V17 Z" fill="#14203f"/>
  ${titleBlock(sheet.title)}
  ${artWindow(art, 19.5, 36)}
  <text x="34.5" y="60" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="2.2" letter-spacing="0.2" fill="${PAL[12]}">SCHEDA VIDEOGIOCO · ${esc(sheet.difficulty.toUpperCase())}</text>
  ${rows}
  <text x="34.5" y="86.3" text-anchor="middle" font-family="${SANS}" font-size="1.8" fill="${PAL[13]}">BLATERO GAME JAM · KUDA GAMES</text>
</svg>
`
}

const artDir = path.join(root, 'public/cards/art')
const printDir = path.join(root, 'print')
fs.mkdirSync(artDir, { recursive: true })
fs.mkdirSync(printDir, { recursive: true })

const only = process.argv.slice(2)
const want = (id) => !only.length || only.includes(id)
const writeArt = (id, art) => fs.writeFileSync(path.join(artDir, `${id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ART_W} ${ART_H}" shape-rendering="crispEdges">${art}</svg>\n`)

let n = 0
for (const card of data.play) {
  if (!want(card.id)) continue
  const art = await artSvgBody(card.id)
  writeArt(card.id, art)
  fs.writeFileSync(path.join(printDir, `${card.id}.svg`), printCard(card, data.frames[card.frame], data.levels[card.level], art))
  n++
}
for (const card of data.imprevisti) {
  if (!want(card.id)) continue
  const art = await artSvgBody(card.id)
  writeArt(card.id, art)
  fs.writeFileSync(path.join(printDir, `${card.id}.svg`), printCard(card, data.frames.bianco, data.levels.imprevisto, art))
  n++
}
for (const sheet of data.sheets) {
  if (!want(sheet.id)) continue
  const art = await artSvgBody(sheet.id)
  writeArt(sheet.id, art)
  fs.writeFileSync(path.join(printDir, `${sheet.id}.svg`), printSheet(sheet, art))
  n++
}
console.log(`built ${n} cards`)
