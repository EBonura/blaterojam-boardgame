// Dumps art module pixel grids as JSON: node tools/cards/art-grid.mjs id id ...
import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url'
const out = {}
for (const id of process.argv.slice(2)) {
  const mod = await import(pathToFileURL(path.resolve('tools/cards/art', id + '.mjs')).href + '?t=' + Date.now())
  const [W, H] = mod.size ?? [32, 24]
  const g = Array.from({ length: H }, () => Array(W).fill(-1))
  const px = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c }
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c) }
  mod.default({ px, rect })
  out[id] = g
}
process.stdout.write(JSON.stringify(out))
