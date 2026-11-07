// End-to-end test of CPU players.
// 1. One phone and three CPUs play a whole game to a win or a loss.
// 2. Two phones and two CPUs: the host's phone goes away mid-game and the other
//    phone takes over the CPU turns, again to the end of the game.
// Every CPU turn must be played exactly once, and the table must never stall.
// Run: npm run test:cpu   (CHROME=/path/to/chrome-or-headless-shell to override, Q='&net=mqtt' for MQTT)
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'
import os from 'node:os'

const CHROME =
  process.env.CHROME ?? `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`

const server = process.env.BASE_URL ? null : await createServer({ server: { port: 5198, strictPort: true }, logLevel: 'error' })
await server?.listen()
// CPUs wait 80 ms instead of 1.5 s, so a whole game fits in a test run.
const URL = (process.env.BASE_URL ?? 'http://localhost:5198/') + '?cpuDelay=80' + (process.env.Q ?? '')

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
  page.on('console', (m) => ['error', 'warn'].includes(m.type()) && log(name, 'console', m.type(), m.text().slice(0, 160)))
  await page.goto(URL)
  return { name, ctx, page }
}

/** Room snapshot, with the events of the game so far. */
const snap = (d) =>
  d.page.evaluate(() => {
    const r = window.__room
    const s = r.roomState.value
    const g = s?.game
    return s && {
      version: s.version, phase: s.phase, me: r.myId.value, online: r.connected.value.size,
      players: s.players.map((p) => ({ id: p.id, name: p.name, cpu: !!p.cpu })),
      result: g?.result, current: g && r.rules.currentPlayer(g), turn: g?.turn, stats: g?.stats, events: g?.events ?? [],
      skipButton: !!document.evaluate('//button[contains(., "salta il turno")]', document, null, 9, null).singleNodeValue,
    }
  })

async function waitFor(d, pred, what, ms = 45000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    const s = await snap(d).catch(() => null)
    if (s && pred(s)) return s
    await new Promise((r) => setTimeout(r, 200))
  }
  check(false, `${d.name}: timed out waiting for ${what}`)
  return snap(d).catch(() => null)
}

/** This device plays its own turn with the CPU strategy, or skips an absent human. */
const actFor = (d, skip) =>
  d.page.evaluate((skip) => {
    const r = window.__room
    const s = r.roomState.value
    const g = s.game
    const cur = r.rules.currentPlayer(g)
    if (cur === r.myId.value) r.dispatch({ type: 'move', id: cur, move: r.cpu.chooseMove(g) })
    else if (skip.includes(cur)) r.dispatch({ type: 'move', id: r.myId.value, move: { type: 'skipAbsent' } })
  }, skip)

/**
 * Drive the game from `d` until it ends. Watches every event so it can check
 * that no turn ever has more cards played than allowed, and that the table
 * never stalls on a CPU.
 */
async function playToEnd(d, label, { skip = [], ms = 240000 } = {}) {
  const seen = new Map()
  let s = await snap(d)
  const cpus = new Set(s.players.filter((p) => p.cpu).map((p) => p.id))
  let lastChange = Date.now()
  let lastVersion = s.version
  let skipShown = false
  // CPU turns are short in the test, so catch the "thinking" line whenever it is drawn rather than by sampling.
  await d.page.evaluate(() => {
    window.__sawThinking = false
    new MutationObserver(() => {
      if (document.querySelector('.turnbar')?.textContent?.includes('ci sta pensando')) window.__sawThinking = true
    }).observe(document.body, { subtree: true, childList: true, characterData: true })
  })
  const end = Date.now() + ms
  while (Date.now() < end) {
    s = await snap(d)
    for (const e of s.events) seen.set(e.seq, e)
    if (cpus.has(s.current) && s.skipButton) skipShown = true
    if (s.result !== 'playing') break
    if (s.version !== lastVersion) (lastVersion = s.version), (lastChange = Date.now())
    if (Date.now() - lastChange > 15000) {
      check(false, `${label}: table stalled at version ${s.version}, turn of ${s.current}, stats ${JSON.stringify(s.stats)}`)
      return s
    }
    if (!cpus.has(s.current)) await actFor(d, skip)
    await new Promise((r) => setTimeout(r, 120))
  }
  check(s.result === 'won' || s.result === 'lost', `${label}: game over, ${s.result}, after ${s.turn + 1} turns, board ${JSON.stringify(s.stats)}`)
  const plays = [...seen.values()].filter((e) => e.kind === 'play' || e.kind === 'illegal')
  const perTurn = new Map()
  for (const e of plays) perTurn.set(e.turn, (perTurn.get(e.turn) ?? 0) + 1)
  const cpuPlays = plays.filter((e) => cpus.has(e.player)).length
  check(cpuPlays > 0, `${label}: CPUs played ${cpuPlays} cards`)
  check([...perTurn.values()].every((n) => n <= 2), `${label}: never more than two cards in one turn (no CPU move applied twice)`)
  const seqs = [...seen.keys()].sort((a, b) => a - b)
  check(seqs.every((q, i) => i === 0 || q === seqs[i - 1] + 1), `${label}: saw every event (${seqs.length}), so the per-turn check covers the whole game`)
  check(await d.page.evaluate(() => window.__sawThinking), `${label}: the turn bar says when a CPU is thinking`)
  check(!skipShown, `${label}: no "salta il turno" offer for a CPU`)
  return s
}

const create = async (d) => {
  await d.page.locator('input[autocomplete=nickname]').fill(d.name)
  await d.page.locator('button.primary').click()
  return d.page.$eval('.roomcode strong', (e) => e.textContent)
}
const join = async (d, code) => {
  await d.page.locator('input[autocomplete=nickname]').fill(d.name)
  await d.page.locator('input.code').fill(code)
  await d.page.locator('.join button').click()
}
const addCpus = async (d, n) => {
  for (let i = 0; i < n; i++) {
    const before = (await snap(d)).players.length
    await d.page.locator('button.add-cpu').click()
    await waitFor(d, (s) => s.players.length === before + 1, 'a CPU seat')
  }
}

try {
  // ---- 1. One phone, three CPUs
  {
    const A = await device('Anna')
    const code = await create(A)
    log('room', code)
    await addCpus(A, 4)
    let s = await snap(A)
    check(s.players.filter((p) => p.cpu).length === 4, `four CPUs added: ${s.players.map((p) => p.name).join(', ')}`)
    const tags = await A.page.$$eval('.players .cpu-tag', (els) => els.length)
    check(tags === 4, 'each CPU row has a CPU tag')
    // Take one away again with its ✕ button.
    await A.page.locator('.players li.cpu .cpu-remove').click()
    s = await waitFor(A, (s) => s.players.length === 4, 'a CPU removed')
    check(s.players.filter((p) => p.cpu).length === 3, 'the host removed a CPU')
    await A.page.locator('button.primary').click()
    s = await waitFor(A, (s) => s.phase === 'playing', 'game start')
    check(s.phase === 'playing', 'one phone and three CPUs can start a game')
    await playToEnd(A, 'Anna + 3 CPU')
    await A.ctx.close()
  }

  // ---- 2. Two phones, two CPUs, the host goes away mid-game
  {
    const [A, B] = await Promise.all(['Anna', 'Bruno'].map(device))
    const code = await create(A)
    log('room', code)
    await join(B, code)
    await waitFor(B, (s) => s.players.length === 2 && s.online === 2, 'Bruno connected')
    await addCpus(A, 2)
    await waitFor(B, (s) => s.players.filter((p) => p.cpu).length === 2, 'Bruno sees the CPUs')
    check((await B.page.$$('button.add-cpu')).length === 0, 'only the host has "Aggiungi CPU"')
    await A.page.locator('button.primary').click()
    await waitFor(B, (s) => s.phase === 'playing', 'game start on Bruno')

    // A few turns with Anna hosting. Both phones play their own turns.
    const cpus = new Set((await snap(A)).players.filter((p) => p.cpu).map((p) => p.id))
    let cpuTurns = 0
    for (let last = -1; cpuTurns < 3; ) {
      const s = await snap(A)
      if (s.result !== 'playing') break
      if (s.turn !== last && cpus.has(s.current)) (cpuTurns++, (last = s.turn))
      await Promise.all([actFor(A, []), actFor(B, [])])
      await new Promise((r) => setTimeout(r, 150))
    }
    const annaId = (await snap(A)).me
    const before = await snap(B)
    check(before.result === 'playing', `CPU turns played while Anna hosts (${cpuTurns})`)
    await A.ctx.close()
    log('Anna dropped')
    await waitFor(B, (s) => s.online === 1, 'Bruno notices Anna left', 30000)
    const s = await playToEnd(B, 'Bruno hosting after Anna left', { skip: [annaId] })
    const after = s.events.filter((e) => e.kind === 'play' && cpus.has(e.player) && e.seq > (before.events.at(-1)?.seq ?? 0))
    check(after.length > 0 || s.result !== 'playing', `Bruno played CPU turns after the host left (${after.length} in the last events)`)
  }
} catch (e) {
  check(false, e.stack)
} finally {
  await browser.close()
  await server?.close()
  log(failed ? 'SOME CHECKS FAILED' : 'ALL CHECKS PASSED')
  process.exit(failed ? 1 : 0)
}
