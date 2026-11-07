// Tuning: the move limit and each game sheet's targets, by simulation with the real rules and the CPU player.
//   TUNE=limits                       win rate and game length for several move limits
//   TUNE=tune LIMIT=48 IDS=a,b OUT=f  search each sheet's targets for its band's win rate; writes OUT (JSON)
// Run: TUNE=... npx vitest run --config tools/vitest.tune.config.ts
import { test } from 'vitest'
import fs from 'node:fs'
import { newGame, applyMove, currentPlayer, SHEETS, STATS, type GameState, type Stat } from '../src/game/rules'
import { chooseMove } from '../src/game/cpu'

const PLAYERS = ['p1', 'p2', 'p3', 'p4']
const ALL = new Set(PLAYERS)

/** The win rate each difficulty band should land on. */
export const BAND: Record<string, number> = { Facile: 0.9, Medio: 0.75, Difficile: 0.6, 'Molto difficile': 0.45, Estremo: 0.3 }

function play(seed: number, sheet: string, limit: number) {
  let g: GameState = newGame(PLAYERS, seed, sheet)
  g.limit = limit
  for (let guard = 0; guard < 2000 && g.result === 'playing'; guard++) {
    const who = currentPlayer(g)
    const n = applyMove(g, chooseMove(g), who, ALL) ?? applyMove(g, { type: 'pass' }, who, ALL)
    if (!n) break
    g = n
  }
  return { won: g.result === 'won', turns: g.turn + 1 }
}

/** Win rate and turns for one sheet with the given targets; the same seeds every time, so candidates compare fairly. */
function measure(sheet: string, target: Record<Stat, number>, limit: number, games: number, seed0 = 7000) {
  const s = SHEETS.find((x) => x.id === sheet)!
  const saved = s.target
  s.target = target
  try {
    const rs = Array.from({ length: games }, (_, i) => play(seed0 + i, sheet, limit))
    const wins = rs.filter((r) => r.won).map((r) => r.turns).sort((a, b) => a - b)
    return { win: wins.length / games, median: wins[Math.floor(wins.length / 2)] ?? null, avg: wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : null }
  } finally {
    s.target = saved
  }
}

/** Keeps the genre's profile: a stat that was higher stays higher; equal ones stay within 1. */
function keepsProfile(orig: Record<Stat, number>, t: Record<Stat, number>) {
  for (const a of STATS) for (const b of STATS) {
    if (orig[a] > orig[b] && !(t[a] > t[b])) return false
    if (orig[a] === orig[b] && Math.abs(t[a] - t[b]) > 1) return false
  }
  return STATS.every((s) => t[s] >= 1 && t[s] <= 15)
}

test('tune', { timeout: 7_200_000 }, () => {
  const mode = process.env.TUNE ?? 'limits'
  if (mode === 'limits') {
    const out: Record<string, unknown>[] = []
    for (const limit of [24, 32, 40, 48, 56, 64, 80, 9999]) {
      const per = SHEETS.map((s) => ({ band: s.difficulty, ...measure(s.id, s.target, limit, 300) }))
      const win = per.reduce((a, b) => a + b.win, 0) / per.length
      const byBand = Object.fromEntries(Object.keys(BAND).map((b) => [b, +(per.filter((p) => p.band === b).reduce((a, x) => a + x.win, 0) / per.filter((p) => p.band === b).length).toFixed(3)]))
      out.push({ limit, win: +win.toFixed(3), byBand })
      console.log(JSON.stringify(out.at(-1)))
    }
    fs.writeFileSync('tools/out/limits.json', JSON.stringify(out, null, 1))
    return
  }
  const limit = Number(process.env.LIMIT)
  const ids = (process.env.IDS ?? '').split(',').filter(Boolean)
  const games = Number(process.env.GAMES ?? 300)
  const results: Record<string, unknown>[] = []
  for (const id of ids) {
    const s = SHEETS.find((x) => x.id === id)!
    const goal = BAND[s.difficulty]
    const orig = { ...s.target }
    let cur = { ...orig }
    let m = measure(id, cur, limit, games)
    const path = [{ target: cur, win: m.win }]
    for (let step = 0; step < 14 && Math.abs(m.win - goal) > 0.025; step++) {
      let best: { t: Record<Stat, number>; m: ReturnType<typeof measure> } | null = null
      for (const st of STATS) for (const d of [-1, 1]) {
        const t = { ...cur, [st]: cur[st] + d }
        if (!keepsProfile(orig, t)) continue
        const mm = measure(id, t, limit, games)
        if (!best || Math.abs(mm.win - goal) < Math.abs(best.m.win - goal)) best = { t, m: mm }
      }
      if (!best || Math.abs(best.m.win - goal) >= Math.abs(m.win - goal)) break
      cur = best.t
      m = best.m
      path.push({ target: cur, win: m.win })
    }
    results.push({ id, title: s.title, band: s.difficulty, goal, from: orig, to: cur, win: m.win, median: m.median, path })
    console.log(JSON.stringify(results.at(-1)))
  }
  fs.writeFileSync(process.env.OUT ?? 'tools/out/tune.json', JSON.stringify(results, null, 1))
})
