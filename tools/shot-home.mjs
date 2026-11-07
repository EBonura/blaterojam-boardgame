// Screenshot of the home screen at phone size. Usage: node tools/shot-home.mjs  (writes tools/out/home.png)
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'
import os from 'node:os'
const server = await createServer({ server: { port: 5185, strictPort: true }, logLevel: 'error' })
await server.listen()
const b = await puppeteer.launch({ executablePath: `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`, headless: true, args: ['--mute-audio'] })
const p = await b.newPage()
await p.setViewport({ width: 390, height: 750, deviceScaleFactor: 2, isMobile: true })
p.on('requestfailed', (r) => console.log('failed', r.url()))
p.on('response', (r) => r.status() >= 400 && console.log(r.status(), r.url()))
await p.goto('http://localhost:5185/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 800))
console.log(await p.evaluate(() => [...document.querySelectorAll('.credits img')].map((i) => `${i.getAttribute('src')} ${i.naturalWidth}x${i.naturalHeight}`).join(' | ')))
await p.screenshot({ path: 'tools/out/home.png' })
await b.close(); await server.close(); process.exit(0)
