// Builds card art and print-ready cards from src/cards/cards.json.
//   public/cards/art/<id>.svg      pixel art used in the game (32x24 grid)
//   print/<lang>/<id>.svg          full card, 63x88 mm trim + 3 mm bleed (69x94 mm)
// Run: npm run cards
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/cards/cards.json'), 'utf8'))

// PICO-8 palette
export const PAL = ['#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8',
  '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa']
const ART_W = 32, ART_H = 24

async function artSvgBody(id) {
  const file = path.join(root, 'tools/cards/art', `${id}.mjs`)
  if (!fs.existsSync(file)) return `<text x="16" y="13" font-size="3" text-anchor="middle" fill="${PAL[6]}">${id}</text>`
  const grid = Array.from({ length: ART_H }, () => Array(ART_W).fill(-1))
  const px = (x, y, c) => { if (x >= 0 && y >= 0 && x < ART_W && y < ART_H) grid[y][x] = c }
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c) }
  const { default: draw } = await import(pathToFileURL(file).href)
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

/** Greedy word wrap by estimated character width (font-size in mm, ~0.52em per char). */
function wrap(text, widthMm, sizeMm) {
  const max = Math.floor(widthMm / (sizeMm * 0.52))
  const lines = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > max && line) (lines.push(line), (line = word))
    else line = (line + ' ' + word).trim()
  }
  if (line) lines.push(line)
  return lines
}

function printCard(card, kind, art, lang) {
  const W = 69, H = 94 // mm, includes 3 mm bleed on each side
  const title = card.title[lang]
  const titleSize = title.length > 16 ? 3.6 : 4.4
  const body = wrap(card.text[lang], 48, 3).map((l, i) => `<tspan x="34.5" dy="${i ? 4 : 0}">${esc(l)}</tspan>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">
  <!-- trim box: x 3..66, y 3..91. Safe area: 3 mm inside the trim. -->
  <rect width="${W}" height="${H}" fill="${kind.color}"/>
  <rect x="6" y="6" width="57" height="82" rx="2.5" fill="${PAL[1]}"/>
  <text x="34.5" y="14" text-anchor="middle" font-family="'Silkscreen', 'Press Start 2P', monospace" font-weight="700" font-size="${titleSize}" fill="${PAL[7]}">${esc(title.toUpperCase())}</text>
  <svg x="8.5" y="17" width="52" height="39" viewBox="0 0 ${ART_W} ${ART_H}" shape-rendering="crispEdges">
    <rect width="${ART_W}" height="${ART_H}" fill="#14203f"/>${art}
  </svg>
  <rect x="8.5" y="57.5" width="52" height="5" rx="1" fill="${kind.color}"/>
  <text x="34.5" y="61.1" text-anchor="middle" font-family="system-ui, Helvetica, Arial, sans-serif" font-weight="800" font-size="3" letter-spacing="0.4" fill="${PAL[0]}">${esc(kind.label[lang].toUpperCase())}</text>
  <text x="34.5" y="68.5" text-anchor="middle" font-family="system-ui, Helvetica, Arial, sans-serif" font-size="3" fill="${PAL[7]}">${body}</text>
  <text x="34.5" y="86.3" text-anchor="middle" font-family="system-ui, Helvetica, Arial, sans-serif" font-size="1.8" fill="${PAL[13]}">BLATERO GAME JAM · KUDA GAMES</text>
</svg>
`
}

const artDir = path.join(root, 'public/cards/art')
fs.mkdirSync(artDir, { recursive: true })
for (const lang of ['it', 'en']) fs.mkdirSync(path.join(root, 'print', lang), { recursive: true })

for (const card of data.cards) {
  const kind = data.kinds[card.kind]
  if (!kind) throw new Error(`card ${card.id}: unknown kind ${card.kind}`)
  const art = await artSvgBody(card.id)
  fs.writeFileSync(path.join(artDir, `${card.id}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ART_W} ${ART_H}" shape-rendering="crispEdges">${art}</svg>\n`)
  for (const lang of ['it', 'en']) fs.writeFileSync(path.join(root, 'print', lang, `${card.id}.svg`), printCard(card, kind, art, lang))
}
console.log(`built ${data.cards.length} cards`)
