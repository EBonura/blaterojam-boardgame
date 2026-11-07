// Renders print/*.svg side by side to a PNG so the look can be checked quickly.
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
const CHROME = process.env.CHROME ?? `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const out = process.argv[2] ?? 'tools/out/cards.png'
const files = fs.readdirSync('print').filter((f) => f.endsWith('.svg')).map((f) => `print/${f}`)
const html = `<body style="margin:0;padding:16px;background:#ddd;display:flex;gap:16px;flex-wrap:wrap">${files
  .map((f) => `<img style="width:276px" src="data:image/svg+xml;base64,${fs.readFileSync(f).toString('base64')}">`)
  .join('')}</body>`
const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio'] })
const p = await b.newPage()
await p.setViewport({ width: 1240, height: 420, deviceScaleFactor: 1 })
await p.setContent(html, { waitUntil: 'load' })
fs.mkdirSync(path.dirname(out), { recursive: true })
await p.screenshot({ path: out, fullPage: true })
await b.close()
console.log(out)
