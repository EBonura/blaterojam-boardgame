// The itch.io page images: the cover (630x500, from tools/cover/) and phone screenshots of a real game
// against 3 CPUs: home, vote, the board mid-game, a card being chosen, a played card, an Imprevisto, the end.
// Usage: node tools/shot-itch.mjs   (writes release/itch/*.png, at 2x)
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import os from 'node:os'
const CHROME = process.env.CHROME ?? `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const OUT = 'release/itch'
fs.mkdirSync(OUT, { recursive: true })
const server = await createServer({ server: { port: 5197, strictPort: true }, logLevel: 'error' })
await server.listen()
const URL = 'http://localhost:5197'
const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio'] })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// cover
{
  const p = await b.newPage()
  await p.setViewport({ width: 630, height: 500, deviceScaleFactor: 2 })
  await p.goto(`${URL}/tools/cover/index.html`, { waitUntil: 'networkidle0' })
  await p.evaluate(() => document.fonts.ready)
  await wait(500)
  await p.screenshot({ path: `${OUT}/cover.png` })
  await p.close()
}

// a game
const p = await b.newPage()
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
p.on('pageerror', (e) => console.log('pageerror', e.message))
const shot = async (name) => (await p.screenshot({ path: `${OUT}/${name}.png` }), console.log('shot', name))
await p.goto(`${URL}/`, { waitUntil: 'networkidle0' })
await p.locator('input[autocomplete=nickname]').fill('Anna')
await wait(500)
await shot('1-home')
await p.locator('button.primary').click()
for (let i = 0; i < 3; i++) await p.locator('button.add-cpu').click()
await wait(300)
// Plays games until one is won (the end screen to show is the win); the other shots come from the first game.
const state = () => p.evaluate(() => {
  const r = window.__room, g = r.roomState.value?.game
  return {
    reveal: document.querySelector('.reveal')?.className ?? null,
    end: !!document.querySelector('.endscreen'),
    mine: !!g && g.result === 'playing' && r.rules.currentPlayer(g) === r.myId.value,
    turn: g?.turn ?? 0,
  }
})
const taken = new Set()
const deadline = Date.now() + 9 * 60_000
for (let game = 1; Date.now() < deadline; game++) {
  if (game > 1) await p.locator('.endscreen button.primary').click(), await wait(400)
  await p.locator('button.primary').click()
  await wait(400)
  const sheets = await p.$$('.sheet')
  await sheets[5].click(), await sheets[4].click()
  await wait(500)
  if (game === 1) await shot('2-vote')
  await p.locator('.vote-bar button.primary').click()
  while (Date.now() < deadline) {
    const s = await state()
    if (s.end) break
    if (s.reveal) {
      // one played card and one Imprevisto, shown once they've settled on screen; the rest are tapped away
      const kind = s.reveal.includes('imprevisto') ? 'imprevisto' : s.reveal.includes('play') && s.turn >= 4 ? 'play' : null
      if (kind && !taken.has(kind)) await wait(900), await shot(kind === 'play' ? '5-played-card' : '6-imprevisto'), taken.add(kind)
      await p.click('.reveal').catch(() => {})
      await wait(250)
      continue
    }
    if (s.mine) {
      await wait(700)
      if (s.turn >= 8 && !taken.has('board')) await shot('3-board'), taken.add('board')
      if (s.turn >= 8 && !taken.has('stage')) {
        // pick a card: it moves to the stage and the bars preview its effect
        await p.locator('.hand .cards .card:not([disabled])').click()
        await wait(500)
        const stat = await p.$('.stats button'); if (stat) await stat.click()
        await wait(700)
        await shot('4-choose'), taken.add('stage')
        await p.locator('.choose-actions button.ghost').click()
        await wait(300)
      }
      await p.evaluate(() => { const r = window.__room; r.dispatch({ type: 'move', id: r.myId.value, move: r.cpu.chooseMove(r.roomState.value.game) }) })
      await wait(400)
      continue
    }
    await wait(250)
  }
  // let the last card's reveal fade out from behind the end screen
  await wait(2500)
  const result = await p.evaluate(() => window.__room.roomState.value?.game?.result)
  console.log('game', game, result)
  if (result === 'won') { await shot('7-end'); break }
}
console.log('shots', [...taken].join(' '))
await b.close(); await server.close(); process.exit(0)
