// What a game costs on the wire, and how long a move takes to show up.
//   npm run zip && node tools/test-zip.mjs tools/net-bytes.mjs     (DELAY=60 holds every message 60 ms, like a mobile link; MOVES=24)
// Four phones (browser contexts) join one room over the real relays. Every RTCDataChannel.send is counted in the
// page, by message type (Trystero's frame names the action). Phases: lobby (joining, then 15 s idle), vote, game
// (each move made on the phone whose turn it is), then 15 s idle in the game. For each move: how long until the
// phone that made it shows it, and until the other phones do (one clock: all pages are in one browser).
import puppeteer from 'puppeteer-core'
import { createServer } from 'vite'
import os from 'node:os'
import fs from 'node:fs'

const CHROME = process.env.CHROME ?? `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const server = process.env.BASE_URL ? null : await createServer({ server: { port: 5198, strictPort: true }, logLevel: 'error' })
await server?.listen()
const URL = process.env.BASE_URL ?? 'http://localhost:5198/'
const DELAY = Number(process.env.DELAY ?? 0)
const MOVES = Number(process.env.MOVES ?? 24)
const IDLE = Number(process.env.IDLE ?? 15000)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio'] })

async function device(name) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  await page.evaluateOnNewDocument((delay) => {
    const tx = (window.__tx = { bytes: 0, msgs: 0, kinds: {} })
    const send = RTCDataChannel.prototype.send
    const dec = new TextDecoder()
    RTCDataChannel.prototype.send = function (data) {
      const n = typeof data === 'string' ? data.length : data.byteLength ?? data.size ?? 0
      let kind = '?'
      try {
        const u = data instanceof ArrayBuffer ? new Uint8Array(data) : ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : null
        if (u) kind = dec.decode(u.subarray(0, 12)).replace(/\0/g, '').trim() || '?'
      } catch {}
      tx.bytes += n
      tx.msgs++
      const k = (tx.kinds[kind] ??= { bytes: 0, msgs: 0 })
      k.bytes += n
      k.msgs++
      if (delay) setTimeout(() => this.readyState === 'open' && send.call(this, data), delay)
      else return send.call(this, data)
    }
  }, DELAY)
  await page.goto(URL)
  await page.waitForFunction(() => window.__room)
  // Record when each room version arrives here.
  await page.evaluate(() => {
    window.__seen = {}
    window.__room.roomState.subscribe((s) => s && (window.__seen[s.version] ??= performance.timeOrigin + performance.now()))
  })
  return { name, page }
}
const tx = (d) => d.page.evaluate(() => structuredClone(window.__tx))
const snap = (d) => d.page.evaluate(() => { const s = window.__room.roomState.value; return s && { version: s.version, phase: s.phase, n: s.players.length, me: window.__room.myId.value, cur: s.game && window.__room.rules.currentPlayer(s.game), result: s.game?.result } })
async function waitAll(devs, pred, ms = 60000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    const ss = await Promise.all(devs.map(snap))
    if (ss.every((s) => s && pred(s))) return ss
    await sleep(100)
  }
  throw new Error('timed out')
}
const totals = async (devs) => {
  const all = await Promise.all(devs.map(tx))
  const kinds = {}
  for (const t of all) for (const [k, v] of Object.entries(t.kinds)) ((kinds[k] ??= { bytes: 0, msgs: 0 }).bytes += v.bytes), (kinds[k].msgs += v.msgs)
  return { bytes: all.reduce((a, t) => a + t.bytes, 0), msgs: all.reduce((a, t) => a + t.msgs, 0), kinds }
}
const diff = (a, b) => {
  const kinds = {}
  for (const [k, v] of Object.entries(b.kinds)) {
    const p = a.kinds[k] ?? { bytes: 0, msgs: 0 }
    if (v.msgs - p.msgs) kinds[k] = { bytes: v.bytes - p.bytes, msgs: v.msgs - p.msgs }
  }
  return { bytes: b.bytes - a.bytes, msgs: b.msgs - a.msgs, kinds }
}
const pct = (xs, p) => { const s = [...xs].sort((a, b) => a - b); return s.length ? Math.round(s[Math.min(s.length - 1, Math.floor(p * s.length))]) : null }

const report = { delayMs: DELAY, phases: {} }
try {
  const devs = await Promise.all(['Anna', 'Bruno', 'Carla', 'Dario'].map(device))
  const [A, ...others] = devs
  let mark = await totals(devs)
  await A.page.locator('input[autocomplete=nickname]').fill('Anna')
  await A.page.locator('button.primary').click()
  const code = await A.page.$eval('.roomcode strong', (e) => e.textContent)
  for (const d of others) {
    await d.page.locator('input[autocomplete=nickname]').fill(d.name)
    await d.page.locator('input.code').fill(code)
    await d.page.locator('.join button').click()
  }
  await waitAll(devs, (s) => s.n === 4)
  let now = await totals(devs)
  report.phases.join = diff(mark, now)
  mark = now
  await sleep(IDLE)
  now = await totals(devs)
  report.phases.lobbyIdle = { ...diff(mark, now), seconds: IDLE / 1000 }
  mark = now
  await A.page.locator('button.primary').click()
  await waitAll(devs, (s) => s.phase === 'voting')
  for (const d of devs) await d.page.locator('.vote-bar button.primary').click()
  await waitAll(devs, (s) => s.phase === 'playing')
  now = await totals(devs)
  report.phases.vote = diff(mark, now)
  mark = now

  const self = [], others2 = []
  for (let i = 0; i < MOVES; i++) {
    const ss = await Promise.all(devs.map(snap))
    if (ss[0].result !== 'playing') break
    const d = devs[ss.findIndex((s) => s.me === s.cur)]
    const v0 = ss[0].version
    const t0 = await d.page.evaluate(() => {
      const r = window.__room
      const g = r.roomState.value.game
      const m = r.rules.timeoutMove(g, () => 0.37)
      const t = performance.timeOrigin + performance.now()
      r.dispatch({ type: 'move', id: r.myId.value, move: { ...m, timeout: undefined } })
      return t
    })
    await waitAll(devs, (s) => s.version > v0, 20000)
    const seen = await Promise.all(devs.map((x) => x.page.evaluate((v) => window.__seen[v + 1], v0)))
    devs.forEach((x, k) => (x === d ? self : others2).push(seen[k] - t0))
    report.movers = (report.movers ?? 0) + (d === A ? 0 : 1)
  }
  now = await totals(devs)
  report.phases.game = { ...diff(mark, now), moves: self.length }
  mark = now
  await sleep(IDLE)
  now = await totals(devs)
  report.phases.gameIdle = { ...diff(mark, now), seconds: IDLE / 1000 }
  report.state = await A.page.evaluate(() => ({ roomStateBytes: JSON.stringify(window.__room.roomState.value).length, gameBytes: JSON.stringify(window.__room.roomState.value.game).length }))
  report.latencyMs = { mover: { p50: pct(self, 0.5), p95: pct(self, 0.95) }, others: { p50: pct(others2, 0.5), p95: pct(others2, 0.95) } }
  report.perMove = Math.round(report.phases.game.bytes / Math.max(1, report.phases.game.moves))
  report.idlePerSecond = Math.round(report.phases.gameIdle.bytes / (IDLE / 1000))
} catch (e) {
  report.error = String(e)
}
console.log(JSON.stringify(report, null, 1))
if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify(report, null, 1))
await browser.close()
await server?.close()
process.exit(report.error ? 1 : 0)
