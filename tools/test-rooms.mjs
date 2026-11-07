// End-to-end room test over the real public signaling relays.
// Each "device" is a separate browser context (own localStorage), like separate phones.
// Run: npm run test:rooms   (CHROME=/path/to/chrome-or-headless-shell to override)
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'
import os from 'node:os'

const CHROME =
  process.env.CHROME ?? `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`

const server = await createServer({ server: { port: 5199, strictPort: true }, logLevel: 'error' })
await server.listen()
const URL = 'http://localhost:5199/' + (process.env.Q ?? '')

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio'] })
const t0 = Date.now()
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a)
let failed = false
const check = (ok, msg) => {
  log(ok ? 'PASS' : 'FAIL', msg)
  if (!ok) failed = true
}

async function device(name) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  page.on('pageerror', (e) => log(`${name} pageerror`, e.message))
  page.on('console', (m) => m.type() !== 'debug' && log(name, m.type(), m.text().slice(0, 160)))
  await page.goto(URL)
  return { name, ctx, page }
}
const snap = (d) =>
  d.page.evaluate(() => {
    const r = window.__room
    const s = r.roomState.value
    return s && { version: s.version, phase: s.phase, players: s.players.map((p) => p.name), turn: s.game?.turn, me: r.myId.value, online: r.connected.value.size, game: s.game }
  })
async function waitFor(d, pred, what, ms = 45000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    const s = await snap(d).catch(() => null)
    if (s && pred(s)) return s
    await new Promise((r) => setTimeout(r, 300))
  }
  check(false, `${d.name}: timed out waiting for ${what}`)
  return snap(d).catch(() => null)
}
const setName = async (d) => {
  await d.page.locator('input[autocomplete=nickname]').fill(d.name)
}
const join = async (d, code) => {
  await setName(d)
  await d.page.locator('input.code').fill(code)
  await d.page.locator('.join button').click()
}

try {
  const [A, B, C] = await Promise.all(['Anna', 'Bruno', 'Carla'].map(device))
  await setName(A)
  await A.page.locator('button.primary').click()
  const code = await A.page.$eval('.roomcode strong', (e) => e.textContent)
  log('room', code)

  await Promise.all([join(B, code), join(C, code)])
  for (const d of [A, B, C]) {
    const s = await waitFor(d, (s) => s.players.length === 3 && s.online === 3, '3 players connected')
    check(s?.players.length === 3, `${d.name} sees ${s?.players.join(', ')}`)
  }

  // Host starts the game.
  await A.page.locator('button.primary').click()
  for (const d of [A, B, C]) await waitFor(d, (s) => s.phase === 'playing', 'game start')
  check(true, 'game started on all devices')

  // Whoever's turn it is ends it; everyone should see turn 1.
  const devs = { Anna: A, Bruno: B, Carla: C }
  async function endTurnBy(expectedTurn) {
    const s = await snap(A.page.isClosed() ? B : A)
    const turnId = s.game.order[s.game.turn % s.game.order.length]
    for (const d of Object.values(devs)) {
      if (d.page.isClosed()) continue
      const me = (await snap(d)).me
      if (me === turnId) {
        await d.page.locator('button.primary').click()
        return
      }
    }
    log('current player is not connected for turn', expectedTurn)
  }
  await endTurnBy(1)
  for (const d of [A, B, C]) await waitFor(d, (s) => s.turn === 1, 'turn 1')
  check(true, 'turn synced to everyone')

  // Host's phone "locks": Anna's page goes away. Bruno should become host and keep play going.
  const annaId = (await snap(A)).me
  await A.page.close()
  log('Anna dropped')
  await waitFor(B, (s) => s.online === 2, 'Bruno notices Anna left', 30000)
  // Play one more turn without Anna if it's not hers.
  let s = await snap(B)
  if (s.game.order[s.game.turn % 3] !== annaId) {
    await endTurnBy(2)
    s = await waitFor(C, (s) => s.turn === 2, 'turn 2 without the original host')
    check(s?.turn === 2, 'play continues after the host dropped')
  }
  const versionWhileAway = (await snap(B)).version

  // Anna comes back on the same phone and types the same code.
  A.page = await A.ctx.newPage()
  await A.page.goto(URL)
  await join(A, code)
  s = await waitFor(A, (s) => s.version >= versionWhileAway && s.online === 3, 'Anna back in the room')
  check(s?.me === annaId, 'Anna got her own seat back')
  check(s?.phase === 'playing' && s?.players.length === 3, 'Anna sees the current game')

  // Carla's phone dies and she comes back on a new device: she takes over her own seat.
  const carlaId = (await snap(C)).me
  await C.ctx.close()
  await waitFor(A, (s) => s.online === 2, 'Anna notices Carla left', 30000)
  const C2 = await device('Carla')
  await join(C2, code)
  const claim = await C2.page.waitForSelector('::-p-xpath(//div[@class="claim"]//button[contains(., "Carla")])', { timeout: 45000 })
  await claim.click()
  s = await waitFor(C2, (s) => s.online === 3 && s.game && !JSON.stringify(s.game).includes(carlaId), 'Carla takes her seat on the new device')
  check(s && s.players.includes('Carla'), 'new device took over the free seat')
} catch (e) {
  check(false, e.stack)
} finally {
  await browser.close()
  await server.close()
  log(failed ? 'SOME CHECKS FAILED' : 'ALL CHECKS PASSED')
  process.exit(failed ? 1 : 0)
}
