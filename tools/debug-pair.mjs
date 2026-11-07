// Two devices, prints console output, to debug connection problems.
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'
import os from 'node:os'
const CHROME = process.env.CHROME ?? `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const extra = (process.env.ARGS ?? '').split(' ').filter(Boolean)
const server = await createServer({ server: { port: 5198, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio', ...extra] })
const q = process.env.Q ?? ''
const pages = []
for (const n of ['A', 'B']) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  p.on('console', (m) => console.log(n, m.type(), m.text().slice(0, 200)))
  p.on('pageerror', (e) => console.log(n, 'pageerror', e.message))
  await p.goto('http://localhost:5198/' + q)
  pages.push(p)
}
const [A, B] = pages
await A.locator('input[autocomplete=nickname]').fill('Anna')
await A.locator('button.primary').click()
const code = await A.$eval('.roomcode strong', (e) => e.textContent)
await B.locator('input[autocomplete=nickname]').fill('Bruno')
await B.locator('input.code').fill(code)
await B.locator('.join button').click()
for (let i = 0; i < 12; i++) {
  await new Promise((r) => setTimeout(r, 2500))
  const s = await Promise.all(pages.map((p) => p.evaluate(() => ({ st: window.__room.status.value, n: window.__room.roomState.value?.players.length, on: window.__room.connected.value.size }))))
  console.log('t', i, JSON.stringify(s))
  if (s.every((x) => x.on === 2)) break
}
await browser.close(); await server.close(); process.exit(0)
