// Builds card art and print-ready cards from src/cards/cards.json.
//   public/cards/art/<id>.svg   pixel art used in the game (32x24 grid, or the size an art module exports)
//   print/<id>.svg              full card, 63x88 mm trim + 3 mm bleed (69x94 mm)
// Look: KUDA Games' card style (parchment in a wooden frame, dark ink, the card type as a gem in the frame),
// with the pixel art set into a dark "screen".
// Run: npm run cards [-- <id> ...]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { effectRows, DISPLAY_ORDER, STAT_LABEL } from '../../src/cards/effects.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/cards/cards.json'), 'utf8'))

// PICO-8 palette
export const PAL = ['#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8',
  '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa']
const SANS = 'system-ui, Helvetica, Arial, sans-serif'
const SERIF = 'Georgia, serif'
const AUTHORS = 'BONNIE GAMES · KUDA GAMES'
const INK = '#3b2616'
const INK_TONE = { gd: '#b4560a', prog: '#1d5b9b', graf: '#a52a68', audio: '#2e7a2e', neg: '#a3122a', any: '#7a4d00' }
// Every card has the same wooden frame; its type shows as a gem set into the top of the frame.
const RAINBOW = ['#a8453a', '#b9803a', '#b9a23f', '#5f8a46', '#3f6f8f', '#6a5a86', '#9a5070']
const SILVER = ['#8f9095', '#d8d4cc', '#76707e', '#d8d4cc', '#8f9095']
const SHEET_GEM = { color: '#3f6f8f' }
const gradient = (id, stops) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${stops.map((c, i, a) => `<stop offset="${i / (a.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`

/** Runs an art module and returns its pixels as SVG rects, plus the grid size. */
async function loadArt(id) {
  const file = path.join(root, 'tools/cards/art', `${id}.mjs`)
  if (!fs.existsSync(file)) return { w: 32, h: 24, body: `<text x="16" y="13" font-size="2.6" font-family="monospace" text-anchor="middle" fill="${PAL[13]}">${id}</text>` }
  const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`)
  const [W, H] = mod.size ?? [32, 24]
  const grid = Array.from({ length: H }, () => Array(W).fill(-1))
  const px = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y][x] = c }
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c) }
  mod.default({ px, rect })
  // Merge horizontal runs of one colour into single rects to keep files small.
  let body = ''
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; ) {
      const c = grid[y][x]
      let w = 1
      while (x + w < W && grid[y][x + w] === c) w++
      if (c >= 0) body += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${PAL[c]}"/>`
      x += w
    }
  }
  return { w: W, h: H, body }
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Greedy word wrap by estimated character width. */
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

function gemFill(frame) {
  if (frame.rainbow) return gradient('gem', RAINBOW)
  if (frame.foil) return gradient('gem', SILVER)
  return `<linearGradient id="gem"><stop offset="0" stop-color="${frame.color}"/></linearGradient>`
}

function defs(frame) {
  return `<defs>
    ${gemFill(frame)}
    <filter id="paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="fine"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" seed="8" result="blot"/>
      <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.1  0 0 0 0.22 0" result="fineC"/>
      <feColorMatrix in="blot" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.28  0 0 0 0 0.12  0 0 0 1.1 -0.45" result="blotC"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="blotC"/><feMergeNode in="fineC"/></feMerge>
    </filter>
    <filter id="wood" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04 0.9" numOctaves="3" seed="5" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.06  0 0 0 0 0.03  0 0 0 0.9 -0.15" result="grainC"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="grainC"/></feMerge>
    </filter>
    <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#5a3414" stop-opacity="0"/><stop offset="1" stop-color="#5a3414" stop-opacity=".45"/></radialGradient>
  </defs>`
}

/** Thin dark rule with a small diamond in the middle, like KUDA's panel dividers. */
const rule = (y) => `<rect x="8" y="${y - 0.35}" width="53" height="0.7" fill="${INK}" opacity=".75"/><rect x="33.6" y="${y - 0.9}" width="1.8" height="1.8" transform="rotate(45 34.5 ${y})" fill="${INK}"/>`
const corner = (x, y, sx, sy) => `<path d="M${x} ${y + sy * 4} V${y} H${x + sx * 4}" fill="none" stroke="${INK}" stroke-width="0.6" opacity=".8"/><circle cx="${x + sx * 1.3}" cy="${y + sy * 1.3}" r="0.5" fill="${INK}" opacity=".8"/>`

function frameAndParchment(frame) {
  return `${defs(frame)}
  <rect width="69" height="94" fill="#7a4a26" filter="url(#wood)"/>
  <rect width="69" height="94" fill="#2a1408" opacity=".25"/>
  <rect x="4.6" y="4.6" width="59.8" height="84.8" rx="2.6" fill="none" stroke="#2a1408" stroke-width="0.9" opacity=".7"/>
  <rect x="5.5" y="5.5" width="58" height="83" rx="2" fill="#ead6ac" filter="url(#paper)"/>
  <rect x="5.5" y="5.5" width="58" height="83" rx="2" fill="url(#vig)"/>
  <rect x="5.5" y="5.5" width="58" height="83" rx="2" fill="none" stroke="${INK}" stroke-width="0.5" opacity=".8"/>
  ${corner(7, 7, 1, 1)}${corner(62, 7, -1, 1)}${corner(7, 87, 1, -1)}${corner(62, 87, -1, -1)}
  ${gem}`
}

/** The card type: a gem set into the top of the frame. */
const gem = `<circle cx="34.5" cy="4.6" r="3.3" fill="#2a1408"/><circle cx="34.5" cy="4.6" r="2.6" fill="url(#gem)"/>
  <circle cx="34.5" cy="4.6" r="2.6" fill="none" stroke="#c9962b" stroke-width=".5"/><ellipse cx="33.6" cy="3.7" rx="1" ry=".6" fill="#fff" opacity=".55"/>`

function title(text) {
  const up = text.toUpperCase()
  const size = up.length > 18 ? 3.4 : up.length > 12 ? 4 : 4.8
  const lines = wrap(up, 50, size, 0.64)
  const y = 11.6 - ((lines.length - 1) * size * 1.1) / 2 + size * 0.36
  return `<text x="34.5" y="${y}" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="${size}" letter-spacing="0.15" fill="${INK}">${tspans(lines, 34.5, size * 1.1)}</text>`
}

/** Pixel art sits in a dark "screen" set into the parchment, so it keeps its contrast. */
function artScreen(art, y, h) {
  const w = (h * 4) / 3, x = 34.5 - w / 2
  return `<rect x="${x - 1.4}" y="${y - 1.4}" width="${w + 2.8}" height="${h + 2.8}" rx="2" fill="${INK}"/>
  <rect x="${x - 0.5}" y="${y - 0.5}" width="${w + 1}" height="${h + 1}" rx="1.2" fill="#14203f"/>
  <svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${art.w} ${art.h}" shape-rendering="crispEdges">${art.body}</svg>`
}

const footer = `<text x="34.5" y="87.4" text-anchor="middle" font-family="${SANS}" font-size="1.5" letter-spacing="0.2" fill="${INK}" opacity=".75">${AUTHORS}</text>`

/** The effect box: big numbers in dark inks. */
function effect(card, top, bottom) {
  const rows = effectRows(card.effect)
  const h = bottom - top
  if (!rows) {
    const lines = wrap(card.text, 46, 3.6)
    const y = top + h / 2 - ((lines.length - 1) * 4.5) / 2 + 1.3
    return `<text x="34.5" y="${y}" text-anchor="middle" font-family="${SANS}" font-weight="600" font-size="3.6" fill="${INK}">${tspans(lines, 34.5, 4.5)}</text>`
  }
  const quote = card.quote ? card.quote.flatMap((l) => wrap(l, 48, 2.3, 0.46)) : []
  const space = h - (quote.length ? quote.length * 3 + 1 : 0)
  let out = ''
  if (rows.length === 1) {
    const r = rows[0], fill = INK_TONE[r.tone]
    const big = Math.min(14, space * 0.55)
    const label = wrap(r.label.toUpperCase(), 48, 3, 0.62)
    const block = big * 0.75 + 1.5 + label.length * 3.3
    const y0 = top + (space - block) / 2 + big * 0.75
    out += `<text x="34.5" y="${y0}" text-anchor="middle" font-family="${SANS}" font-weight="900" font-size="${big}" fill="${fill}">${esc(r.num)}</text>`
    out += `<text x="34.5" y="${y0 + 4.5}" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="3" letter-spacing="0.2" fill="${fill}">${tspans(label, 34.5, 3.3)}</text>`
  } else {
    const step = space / rows.length
    const num = Math.min([0, 13, 9, 7, 5.6][rows.length], step * 0.82)
    rows.forEach((r, i) => {
      const cy = top + step * (i + 0.5) + num * 0.36
      const fill = INK_TONE[r.tone]
      const ls = Math.max(2.4, Math.min(3.4, num * 0.42))
      out += `<text x="30" y="${cy}" text-anchor="end" font-family="${SANS}" font-weight="900" font-size="${num}" fill="${fill}">${esc(r.num)}</text>`
      out += `<text x="32" y="${cy - num * 0.36 + ls * 0.36}" font-family="${SANS}" font-weight="700" font-size="${ls}" fill="${fill}">${esc(r.label.toUpperCase())}</text>`
    })
  }
  if (quote.length) out += `<text x="34.5" y="${top + space + 1.8}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="2.3" fill="${INK}">${tspans(quote, 34.5, 3)}</text>`
  return out
}

const svg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="69mm" height="94mm" viewBox="0 0 69 94">
  <!-- trim box: x 3..66, y 3..91. Safe area: 3 mm inside the trim. -->
  ${inner}
</svg>
`

function printCard(card, frame, art) {
  return svg(`${frameAndParchment(frame)}
  ${title(card.title)}
  ${rule(17.5)}
  ${artScreen(art, 21.5, 36)}
  ${rule(61.5)}
  ${effect(card, 62.5, 85.5)}
  ${footer}`)
}

function printSheet(sheet, art) {
  const rows = DISPLAY_ORDER.map((id, i) => {
    const y = 66.2 + i * 5.2
    return `<text x="11" y="${y}" font-family="${SANS}" font-weight="700" font-size="3.3" fill="${INK_TONE[id]}">${esc(STAT_LABEL[id].toUpperCase())}</text>
  <text x="58" y="${y + 0.4}" text-anchor="end" font-family="${SANS}" font-weight="900" font-size="5" fill="${INK}">${sheet.target[id]}</text>`
  }).join('\n  ')
  return svg(`${frameAndParchment(SHEET_GEM)}
  ${title(sheet.title)}
  ${rule(17.5)}
  <text x="34.5" y="21.3" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="2.8" fill="${INK}">Scheda videogioco · ${esc(sheet.difficulty)}</text>
  ${artScreen(art, 24, 32)}
  ${rule(60.5)}
  ${rows}
  ${footer}`)
}

const artDir = path.join(root, 'public/cards/art')
const printDir = path.join(root, 'print')
fs.mkdirSync(artDir, { recursive: true })
fs.mkdirSync(printDir, { recursive: true })

const only = process.argv.slice(2)
const want = (id) => !only.length || only.includes(id)
const writeArt = (id, art) =>
  fs.writeFileSync(path.join(artDir, `${id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.w} ${art.h}" shape-rendering="crispEdges">${art.body}</svg>\n`)

let n = 0
for (const card of data.play) {
  if (!want(card.id)) continue
  const art = await loadArt(card.id)
  writeArt(card.id, art)
  fs.writeFileSync(path.join(printDir, `${card.id}.svg`), printCard(card, data.frames[card.frame], art))
  n++
}
for (const card of data.imprevisti) {
  if (!want(card.id)) continue
  const art = await loadArt(card.id)
  writeArt(card.id, art)
  fs.writeFileSync(path.join(printDir, `${card.id}.svg`), printCard(card, data.frames.bianco, art))
  n++
}
for (const sheet of data.sheets) {
  if (!want(sheet.id)) continue
  const art = await loadArt(sheet.id)
  writeArt(sheet.id, art)
  fs.writeFileSync(path.join(printDir, `${sheet.id}.svg`), printSheet(sheet, art))
  n++
}
console.log(`built ${n} cards`)
