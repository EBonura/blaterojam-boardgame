// Frames of the board animations: a threshold breaking before an Imprevisto, and a covered (Blackout) card being played.
// Usage: node tools/shot-fx.mjs   (writes tools/out/fx-*.png)
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'
import os from 'node:os'

const CHROME = process.env.CHROME ?? `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const server = await createServer({ server: { port: 5186, strictPort: true }, logLevel: 'error' })
await server.listen()
const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio'] })
const p = await (await b.createBrowserContext()).newPage()
await p.setViewport({ width: 390, height: 750, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
p.on('pageerror', (e) => console.log('pageerror', e.message))
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

await p.goto('http://localhost:5186/')
await p.locator('input[autocomplete=nickname]').fill('Anna')
await p.locator('button.primary').click()
for (let i = 0; i < 3; i++) await p.locator('button.add-cpu').click()
await p.locator('button.primary').click()
await p.locator('.vote-bar button.primary').click()

const myTurn = () =>
  p.waitForFunction(() => {
    const r = window.__room
    const g = r.roomState.value?.game
    return g && r.rules.currentPlayer(g) === r.myId.value && !g.blind
  }, { timeout: 60000 })
const clear = async () => {
  for (let i = 0; i < 12 && (await p.$('.reveal')); i++) {
    await p.click('.reveal')
    await wait(200)
  }
}
// Test-only: as host, replace part of the game state to set up a scene.
const rig = (patch) =>
  p.evaluate((patch) => {
    const r = window.__room
    const s = r.roomState.value
    r.roomState.value = { ...s, version: s.version + 1, game: { ...s.game, ...patch } }
  }, patch)
const frames = async (prefix, times) => {
  const t0 = Date.now()
  for (const at of times) {
    await wait(Math.max(0, at - (Date.now() - t0)))
    await p.screenshot({ path: `tools/out/fx-${prefix}-${at}.png` })
  }
}

await myTurn()
await clear()
await rig({ stats: { gd: 0, prog: 5, graf: 0, audio: 0 }, hand: ['programmatore#1', 'grafico#1', 'lore-drop#1', 'zip#1'], impDeck: ['merge-conflict'], imprevistoThisTurn: false, blind: false, toPlay: 1 })
await wait(1200)
// pick Programmatore (+3 Programmazione: 5 -> 8 crosses 7)
// Click it in the page (the fanned cards overlap, so a mouse click at its centre can land on a neighbour).
await p.evaluate(() => {
  const card = [...document.querySelectorAll('.hand .card')].find((c) => c.querySelector('.card-title')?.textContent?.includes('Programmatore'))
  card.click()
})
await wait(700)
await p.click('.choose-actions button.primary')
await frames('break', [1100, 2300, 3200, 4600])
await wait(1500)
console.log('before tap', await p.evaluate(() => [document.querySelectorAll('.reveal').length, document.querySelector('.reveal .rv-caption')?.textContent, document.querySelector('.bar .bar-v')?.textContent]))
await p.click('.reveal .rv-card')
await wait(100)
console.log('after tap', await p.evaluate(() => [document.querySelectorAll('.reveal').length, document.querySelector('.reveal .rv-caption')?.textContent, document.querySelector('.bar .bar-v')?.textContent]))
await frames('applied', [400, 1600])

await wait(3000)
await clear()
await myTurn()
await clear()
await rig({ blind: true, hand: ['caffe#1', 'grafico#1', 'zip#1', 'lore-drop#1'], toPlay: 1 })
await wait(1200)
await p.screenshot({ path: 'tools/out/fx-blind-0.png' })
const backs = await p.$$('.hand .card.back')
await backs[1].click()
await frames('blind', [350, 800, 1500])

await b.close()
await server.close()
process.exit(0)
