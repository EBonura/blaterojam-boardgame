// Screenshots of the game at phone sizes: 1 human + 3 CPUs, the hand, a picked card on stage, and a reveal.
// Usage: node tools/shot-game.mjs   (writes tools/out/game-*.png)
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'
import os from 'node:os'
const CHROME = process.env.CHROME ?? `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const server = await createServer({ server: { port: 5196, strictPort: true }, logLevel: 'error' })
await server.listen()
const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio'] })
for (const [w, h, tag] of [[390, 750, 'iphone'], [360, 640, 'small']]) {
  const ctx = await b.createBrowserContext(); const p = await ctx.newPage()
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  p.on('pageerror', (e) => console.log('pageerror', e.message))
  await p.goto('http://localhost:5196/')
  if (tag === 'iphone') await p.screenshot({ path: `tools/out/home.png` })
  await p.locator('input[autocomplete=nickname]').fill('Anna'); await p.locator('button.primary').click()
  for (let i = 0; i < 3; i++) await p.locator('button.add-cpu').click()
  await new Promise((r) => setTimeout(r, 300))
  if (tag === 'iphone') await p.screenshot({ path: `tools/out/lobby.png` })
  await p.locator('button.primary').click()
  // wait for my turn
  await p.waitForFunction(() => { const r = window.__room; const g = r.roomState.value?.game; return g && r.rules.currentPlayer(g) === r.myId.value && !document.querySelector('.reveal') }, { timeout: 60000 })
  // tap through any reveals still queued from the CPUs' moves
  for (let i = 0; i < 10 && (await p.$('.reveal')); i++) { await p.click('.reveal'); await new Promise((r) => setTimeout(r, 150)) }
  await new Promise((r) => setTimeout(r, 900))
  await p.screenshot({ path: `tools/out/game-${tag}.png` })
  await p.locator('.hand .cards .card:not([disabled])').click()
  await new Promise((r) => setTimeout(r, 700))
  await p.screenshot({ path: `tools/out/game-stage-${tag}.png` })
  const stat = await p.$('.stats button'); if (stat) await stat.click()
  await new Promise((r) => setTimeout(r, 400))
  await p.screenshot({ path: `tools/out/game-preview-${tag}.png` })
  await p.locator('.choose-actions button.primary').click()
  await new Promise((r) => setTimeout(r, 250))
  await p.screenshot({ path: `tools/out/game-flying-${tag}.png` })
  await new Promise((r) => setTimeout(r, 450))
  await p.screenshot({ path: `tools/out/game-after-${tag}.png` })
  await ctx.close()
}
await b.close(); await server.close(); process.exit(0)
