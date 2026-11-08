// End-to-end room test over the real public signaling relays.
// Each "device" is a separate browser context (own localStorage), like separate phones.
// Run: npm run test:rooms   (CHROME=/path/to/chrome-or-headless-shell to override, RELAY=1 for relay-only)
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'
import { prepare } from './browser-env.mjs'
import os from 'node:os'

const CHROME =
  process.env.CHROME ?? `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`

// BASE_URL tests an already-served build (see tools/test-zip.mjs); otherwise run the dev server.
const server = process.env.BASE_URL ? null : await createServer({ server: { port: 5199, strictPort: true }, logLevel: 'error' })
await server?.listen()
const URL = (process.env.BASE_URL ?? 'http://localhost:5199/')

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
  await prepare(page)
  page.on('pageerror', (e) => log(`${name} pageerror`, e.message))
  page.on('console', (m) => m.type() === 'error' && log(name, 'console error', m.text().slice(0, 160)))
  page.on('response', (r) => r.status() >= 400 && log(name, 'HTTP', r.status(), r.url()))
  await page.goto(URL)
  return { name, ctx, page }
}
const snap = (d) =>
  d.page.evaluate(() => {
    const r = window.__room
    const s = r.roomState.value
    const g = s?.game
    return s && { version: s.version, phase: s.phase, players: s.players.map((p) => p.name), me: r.myId.value, online: r.connected.value.size,
      turn: g?.turn, current: g && r.rules.currentPlayer(g), stats: g?.stats, gameJson: g && JSON.stringify(g.order), sheet: g?.sheet,
      votes: Object.fromEntries(Object.entries(s.votes ?? {}).map(([id, v]) => [s.players.find((p) => p.id === id)?.name, v])) }
  })
async function waitFor(d, pred, what, ms = 45000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    const s = await snap(d).catch(() => null)
    if (s && pred(s)) return s
    await new Promise((r) => setTimeout(r, 300))
  }
  const last = await snap(d).catch(() => null)
  check(false, `${d.name}: timed out waiting for ${what} (last seen: ${JSON.stringify(last && { version: last.version, online: last.online, players: last.players, order: last.gameJson })}${d.page.evaluate ? ', net: ' + JSON.stringify(await d.page.evaluate(() => window.__room.debugInfo()).catch(() => null)) : ''})`)
  // Everyone else's view too, to see where it stalled.
  for (const o of globalThis.__devs ?? []) {
    if (o === d || o.page.isClosed?.() || !o.page.evaluate) continue
    const v = await o.page.evaluate(() => { const r = window.__room; const s = r.roomState.value; return { me: r.myId.value.slice(0, 6), version: s?.version, players: s?.players.map((p) => p.name + ':' + p.id.slice(0, 6)), recent: s?.recent?.slice(-3), host: r.debugInfo() } }).catch((e) => String(e))
    log('  view of', o.name, JSON.stringify(v))
  }
  return last
}
const join = async (d, code) => {
  await d.page.locator('input[autocomplete=nickname]').fill(d.name)
  await d.page.locator('input.code').fill(code)
  await d.page.locator('.join button').click()
}
/** The current player plays their first legal card (or passes). */
const playTurn = (d) =>
  d.page.evaluate(() => {
    const r = window.__room
    const g = r.roomState.value.game
    const card = g.blind ? g.hand[0] : g.hand.find((c) => r.rules.isLegal(g, c))
    const move = card ? { type: 'play', card, stat: 'audio', value: 5 } : { type: 'pass' }
    r.dispatch({ type: 'move', id: r.myId.value, move })
  })

try {
  const devs = await Promise.all(['Anna', 'Bruno', 'Carla', 'Dario'].map(device))
  globalThis.__devs = devs
  const [A, B, C, D] = devs
  await A.page.locator('input[autocomplete=nickname]').fill(A.name)
  await A.page.locator('button.primary').click()
  const code = await A.page.$eval('.roomcode strong', (e) => e.textContent)
  log('room', code)

  await Promise.all([B, C, D].map((d) => join(d, code)))
  for (const d of devs) {
    const s = await waitFor(d, (s) => s.players.length === 4 && s.online === 4, '4 players connected')
    check(s?.players.length === 4, `${d.name} sees ${s?.players.join(', ')}`)
  }

  await A.page.locator('button.primary').click()
  for (const d of devs) await waitFor(d, (s) => s.phase === 'voting', 'the vote')
  // Anna and Bruno pick Puzzle Game, Bruno and Carla Quiz Game, Carla Roguelike, Dario nothing. Then Carla swaps Roguelike for Puzzle Game: 3 to 2.
  const pick = (d, title) => d.page.evaluate((title) => [...document.querySelectorAll('.sheet')].find((b) => b.querySelector('.sh-title').textContent === title).click(), title)
  await pick(A, 'Puzzle Game'); await pick(B, 'Puzzle Game'); await pick(B, 'Quiz Game'); await pick(C, 'Quiz Game'); await pick(C, 'Roguelike')
  await waitFor(D, (s) => s.votes?.Carla?.length === 2, 'Dario sees Carla\'s picks')
  check((await D.page.$$eval('.sheet', (bs) => bs.map((b) => b.querySelectorAll('.sh-votes i').length))).reduce((a, b) => a + b, 0) === 5, 'the live tally shows all five picks on Dario\'s phone')
  await pick(C, 'Roguelike'); await pick(C, 'Puzzle Game')
  for (const d of devs) await d.page.locator('.vote-bar button.primary').click()
  for (const d of devs) await waitFor(d, (s) => s.phase === 'playing', 'game start')
  const started = await snap(A)
  check(started.sheet === 'puzzle-game', `the most voted videogame is made (${started.sheet})`)
  check(true, 'game started on all devices')

  const live = () => devs.filter((d) => !d.page.isClosed())
  async function oneTurn(label) {
    const s = await snap(live()[0])
    const cur = live().find((d) => d.id === s.current)
    if (cur) await playTurn(cur)
    else await live()[0].page.evaluate(() => window.__room.dispatch({ type: 'move', id: window.__room.myId.value, move: { type: 'skipAbsent' } }))
    for (const d of live()) await waitFor(d, (x) => x.version > s.version && x.turn !== undefined, label)
    const v = await Promise.all(live().map(snap))
    check(v.every((x) => x.version === v[0].version && JSON.stringify(x.stats) === JSON.stringify(v[0].stats)), `${label}: everyone has the same board ${JSON.stringify(v[0].stats)}`)
  }
  for (const d of devs) d.id = (await snap(d)).me
  await oneTurn('turn 1')
  await oneTurn('turn 2')

  // The host's phone "locks": Anna's page goes away. Someone else hosts and play goes on.
  const annaId = A.id
  await A.page.close()
  log('Anna dropped')
  await waitFor(B, (s) => s.online === 3, 'Bruno notices Anna left', 30000)
  await oneTurn('turn after the host dropped')
  const versionWhileAway = (await snap(B)).version

  // Anna comes back on the same phone and types the same code.
  A.page = await A.ctx.newPage()
  await prepare(A.page)
  await A.page.goto(URL)
  await join(A, code)
  let s = await waitFor(A, (s) => s.version >= versionWhileAway && s.online === 4, 'Anna back in the room')
  check(s?.me === annaId, 'Anna got her own seat back')
  check(s?.phase === 'playing' && s?.players.length === 4, 'Anna sees the current game')

  // Carla's phone dies and she comes back on a new device: she takes over her own seat.
  const carlaId = C.id
  await C.ctx.close()
  C.page = { isClosed: () => true }
  await waitFor(A, (s) => s.online === 3, 'Anna notices Carla left', 30000)
  const C2 = await device('Carla')
  await join(C2, code)
  await C2.page.waitForSelector('::-p-xpath(//div[@class="claim"]//button[contains(., "Carla")])', { timeout: 45000 })
  // The clock may have played a card for the absent Carla meanwhile: its reveal covers the screen, so close it first.
  const covered = await C2.page.evaluate(() => { const n = document.querySelectorAll('.reveal').length; document.querySelectorAll('.reveal').forEach((r) => r.click()); return n })
  if (covered) log('a reveal covered the screen on the new device; closed it before claiming')
  await C2.page.evaluate(() => [...document.querySelectorAll('.claim button')].find((b) => b.textContent.includes('Carla')).click())
  s = await waitFor(C2, (s) => s.online === 4 && !s.gameJson.includes(carlaId), 'Carla takes her seat on the new device')
  check(s && s.players.includes('Carla'), 'new device took over the free seat')
  C2.id = s.me
  devs[2] = C2
  await oneTurn('turn after the seat takeover')
} catch (e) {
  check(false, e.stack)
} finally {
  await browser.close()
  await server?.close()
  log(failed ? 'SOME CHECKS FAILED' : 'ALL CHECKS PASSED')
  process.exit(failed ? 1 : 0)
}
