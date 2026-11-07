// Reconnection test: a phone rejoining with the same identity, and a phone whose page freezes
// (like a locked screen or a background tab) and comes back. Both must end up connected and in sync.
// Run: node tools/test-rejoin.mjs   (Q='?net=mqtt' for MQTT)
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'
import os from 'node:os'

const CHROME = process.env.CHROME ?? `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const server = await createServer({ server: { port: 5193, strictPort: true }, logLevel: 'error' })
await server.listen()
const URL = 'http://localhost:5193/' + (process.env.Q ?? '')
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio'] })
const t0 = Date.now()
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a)
let failed = false
const check = (ok, msg) => (log(ok ? 'PASS' : 'FAIL', msg), ok || (failed = true))

async function device(name) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  page.on('pageerror', (e) => log(name, 'pageerror', e.message))
  await page.goto(URL)
  return { name, page }
}
const snap = (d) => d.page.evaluate(() => { const r = window.__room; const s = r.roomState.value; return { online: r.connected.value.size, version: s?.version, players: s?.players.length, err: r.netInfo.value.error } })
async function waitFor(d, pred, what, ms = 60000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    const s = await snap(d).catch(() => null)
    if (s && pred(s)) return s
    await new Promise((r) => setTimeout(r, 400))
  }
  check(false, `${d.name}: timed out waiting for ${what} (last ${JSON.stringify(await snap(d).catch(() => null))})`)
}
// Rename yourself = an action that must reach the host and come back to everyone.
const rename = (d, n) => d.page.evaluate((n) => window.__room.dispatch({ type: 'join', id: window.__room.myId.value, name: n }), n)
/** d sends an action; it must be applied and reach the other device (both end on the same, higher version). */
async function propagates(from, to) {
  const v0 = (await snap(to)).version
  await rename(from, 'x' + Math.random().toString(36).slice(2, 6))
  for (let i = 0; i < 60; i++) {
    const [a, b] = [await snap(from), await snap(to)]
    if (b.version > v0 && a.version === b.version) return true
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}
const names = (d) => d.page.evaluate(() => { const r = window.__room; return r.roomState.value ? r.roomState.value.players.map((p) => p.name).sort().join(',') : `no-room status=${r.status.value} url=${location.href}` })

try {
  const A = await device('laptop'), B = await device('phone')
  await A.page.locator('input[autocomplete=nickname]').fill('laptop')
  await A.page.locator('button.primary').click()
  const code = await A.page.$eval('.roomcode strong', (e) => e.textContent)
  await B.page.locator('input[autocomplete=nickname]').fill('phone')
  await B.page.locator('input.code').fill(code)
  await B.page.locator('.join button').click()
  await waitFor(A, (s) => s.online === 2 && s.players === 2, 'both connected')
  check(true, 'phone joined the laptop')

  // 1. Phone rejoins with the same identity (what happens after a screen unlock).
  await B.page.evaluate(() => window.__room.reconnectNow())
  await waitFor(B, (s) => s.online === 2, 'phone back after rejoin')
  const ok1 = await propagates(B, A)
  check(ok1, 'after a same-identity rejoin, the phone\'s actions reach the laptop')
  if (!ok1) for (const d of [A, B]) log(d.name, JSON.stringify(await d.page.evaluate(() => window.__room.debugInfo())))

  // 2. Phone page freezes for 25 s (locked screen / background), then wakes.
  const cdp = await B.page.createCDPSession()
  await cdp.send('Page.setWebLifecycleState', { state: 'frozen' })
  log('phone frozen')
  await new Promise((r) => setTimeout(r, 25000))
  await cdp.send('Page.setWebLifecycleState', { state: 'active' })
  log('phone awake')
  await waitFor(B, (s) => s.online === 2, 'phone connected after waking', 60000)
  for (const d of [A, B]) log(d.name, 'after wake', JSON.stringify(await d.page.evaluate(() => window.__room.debugInfo())))
  const ok2 = await propagates(B, A)
  if (!ok2) for (const d of [A, B]) log(d.name, JSON.stringify(await d.page.evaluate(() => window.__room.debugInfo())))
  check(ok2, 'after waking, the phone\'s actions reach the laptop')
  const ok3 = await propagates(A, B)
  check(ok3, 'and the laptop\'s actions reach the phone')
  const sa = await snap(A), sb = await snap(B)
  check(!sa.err && !sb.err, `no connection error left on screen (${sa.err || '-'} / ${sb.err || '-'})`)
} catch (e) {
  check(false, e.stack)
} finally {
  await browser.close(); await server.close()
  log(failed ? 'SOME CHECKS FAILED' : 'ALL CHECKS PASSED')
  process.exit(failed ? 1 : 0)
}
