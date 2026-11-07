// Screenshots of the game screen at phone size: 4 players, one game started.
// Usage: node tools/shot-game.mjs   (writes tools/out/game-*.png)
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'
import os from 'node:os'
const CHROME = process.env.CHROME ?? `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const server = await createServer({ server: { port: 5196, strictPort: true }, logLevel: 'error' })
await server.listen()
const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio'] })
const pages = []
for (const n of ['Anna', 'Bruno', 'Carla', 'Dario']) {
  const ctx = await b.createBrowserContext(); const p = await ctx.newPage()
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  p.on('pageerror', (e) => console.log(n, 'pageerror', e.message))
  await p.goto('http://localhost:5196/'); p.name = n; pages.push(p)
}
const [A, ...rest] = pages
await A.locator('input[autocomplete=nickname]').fill('Anna'); await A.locator('button.primary').click()
const code = await A.$eval('.roomcode strong', (e) => e.textContent)
for (const p of rest) { await p.locator('input[autocomplete=nickname]').fill(p.name); await p.locator('input.code').fill(code); await p.locator('.join button').click() }
await A.waitForFunction(() => window.__room.connected.value.size === 4 && window.__room.roomState.value.players.length === 4, { timeout: 60000 })
await A.locator('button.primary').click()
for (const p of pages) await p.waitForFunction(() => window.__room.roomState.value?.phase === 'playing', { timeout: 30000 })
const meIs = async (p) => p.evaluate(() => { const r = window.__room; return r.rules.currentPlayer(r.roomState.value.game) === r.myId.value })
let cur, other
for (const p of pages) (await meIs(p)) ? (cur = p) : (other ??= p)
await new Promise((r) => setTimeout(r, 400))
await cur.screenshot({ path: 'tools/out/game-mine.png', fullPage: true })
await other.screenshot({ path: 'tools/out/game-other.png' })
await cur.locator('.hand .cards .card:not([disabled])').click()
await new Promise((r) => setTimeout(r, 300))
await cur.screenshot({ path: 'tools/out/game-choose.png', fullPage: true })
// play it (choose the first stat if needed) and capture the reveal on another phone
const stat = await cur.$('.stats button'); if (stat) await stat.click()
await cur.locator('.choose button.primary').click()
await other.waitForSelector('.reveal', { timeout: 15000 })
await new Promise((r) => setTimeout(r, 500))
await other.screenshot({ path: 'tools/out/game-reveal.png' })
await b.close(); await server.close(); process.exit(0)
