// Balancing simulation: plays thousands of headless games with the real rules and writes stats.
// Run: npx vitest run --config tools/vitest.balance.config.ts   (writes tools/out/balance.json)
import { test } from 'vitest'
import fs from 'node:fs'
import {
  newGame, applyMove, currentPlayer, isLegal, needsStat, playCard, SHEETS, IMPREVISTI, STATS, JOLLY_MAX,
  type GameState, type Move, type Stat,
} from '../src/game/rules'
import { chooseMove } from '../src/game/cpu'

const PLAYERS = ['p1', 'p2', 'p3', 'p4']
const ALL = new Set(PLAYERS)
const MAX_TURNS = 400
const GAMES_PER_SHEET = Number(process.env.GAMES ?? 400)

type Result = { result: 'won' | 'lost' | 'stuck'; turns: number; imprevisti: number; overflows: number; passes: number; bufferTurns: number; deadline: boolean }

/** A player who plays a random legal card, with random choices. */
function randomMove(g: GameState, rnd: () => number): Move {
  if (g.blind) return { type: 'play', card: g.hand[Math.floor(rnd() * g.hand.length)] }
  const legal = g.hand.filter((c) => isLegal(g, c))
  if (!legal.length) return { type: 'pass' }
  const card = legal[Math.floor(rnd() * legal.length)]
  const e = playCard(card).effect
  return { type: 'play', card, stat: needsStat(card) ? STATS[Math.floor(rnd() * 4)] : undefined, value: e.type === 'set' ? Math.floor(rnd() * (JOLLY_MAX + 1)) : undefined }
}

function mulberry(seed: number) {
  return () => {
    let t = (seed = (seed + 0x6d2b79f5) | 0)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function playGame(seed: number, sheet: string, strategy: 'cpu' | 'random'): Result {
  let g = newGame(PLAYERS, seed, sheet)
  const rnd = mulberry(seed ^ 0x9e3779b9)
  let lastSeq = 0
  const r: Result = { result: 'stuck', turns: 0, imprevisti: 0, overflows: 0, passes: 0, bufferTurns: 0, deadline: false }
  for (let guard = 0; guard < MAX_TURNS * 3 && g.result === 'playing' && g.turn < MAX_TURNS; guard++) {
    const who = currentPlayer(g)
    const move = strategy === 'cpu' ? chooseMove(g) : randomMove(g, rnd)
    const n = applyMove(g, move, who, ALL) ?? applyMove(g, { type: 'pass' }, who, ALL) ?? applyMove(g, { type: 'skipAbsent' }, who, new Set())
    if (!n) break
    g = n
    for (const e of g.events) {
      if (e.seq <= lastSeq) continue
      if (e.kind === 'imprevisto') r.imprevisti++
      if (e.kind === 'overflow') r.overflows++
      if (e.kind === 'pass' || e.kind === 'redraw') r.passes++
      if (e.kind === 'deadline') r.deadline = true
    }
    lastSeq = g.events.at(-1)?.seq ?? lastSeq
  }
  r.turns = g.turn + 1
  r.result = g.result === 'playing' ? 'stuck' : g.result
  return r
}

function summarise(results: Result[]) {
  const n = results.length
  const won = results.filter((x) => x.result === 'won')
  const lost = results.filter((x) => x.result === 'lost')
  const stuck = results.filter((x) => x.result === 'stuck')
  const turns = won.map((x) => x.turns).sort((a, b) => a - b)
  const q = (p: number) => (turns.length ? turns[Math.min(turns.length - 1, Math.floor(p * turns.length))] : null)
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
  const allTurns = results.filter((x) => x.result !== 'stuck').map((x) => x.turns)
  return {
    games: n,
    winRate: won.length / n,
    lossRate: lost.length / n,
    stuckRate: stuck.length / n,
    deadlineRate: results.filter((x) => x.deadline).length / n,
    avgTurnsToWin: avg(turns),
    medianTurnsToWin: q(0.5),
    p10TurnsToWin: q(0.1),
    p90TurnsToWin: q(0.9),
    avgTurnsAll: avg(allTurns),
    avgTurnsToLose: avg(lost.map((x) => x.turns)),
    avgImprevisti: avg(results.map((x) => x.imprevisti)),
    avgOverflows: avg(results.map((x) => x.overflows)),
    avgPasses: avg(results.map((x) => x.passes)),
    winTurnHistogram: histogram(turns, 10),
  }
}

function histogram(xs: number[], bin: number) {
  const h: Record<number, number> = {}
  for (const x of xs) {
    const b = Math.floor(x / bin) * bin
    h[b] = (h[b] ?? 0) + 1
  }
  return h
}

/** The four stat Imprevisti as they were before 7 Nov (all back to 0), for comparison. */
function withOldImprevisti<T>(f: () => T): T {
  const ids = { 'troppi-poligoni': 'graf', 'audio-clipping': 'audio', 'solo-un-ritocco': 'gd' } as Record<string, Stat>
  const saved = new Map<string, unknown>()
  for (const c of IMPREVISTI) if (ids[c.id]) (saved.set(c.id, c.effect), ((c as { effect: unknown }).effect = { type: 'reset', stat: ids[c.id] }))
  try {
    return f()
  } finally {
    for (const c of IMPREVISTI) if (saved.has(c.id)) (c as { effect: unknown }).effect = saved.get(c.id)
  }
}

test('balance', { timeout: 3_600_000 }, () => {
  const t0 = Date.now()
  const run = (strategy: 'cpu' | 'random', games = GAMES_PER_SHEET) =>
    SHEETS.map((s, si) => {
      const results = Array.from({ length: games }, (_, i) => playGame(1000 + si * 100000 + i, s.id, strategy))
      return { sheet: s.id, title: s.title, difficulty: s.difficulty, target: s.target, total: Object.values(s.target).reduce((a, b) => a + b, 0), all: results, ...summarise(results) }
    })
  const cpu = run('cpu')
  const random = run('random', Math.round(GAMES_PER_SHEET / 2))
  const oldCpu = withOldImprevisti(() => run('cpu', Math.round(GAMES_PER_SHEET / 2)))
  const strip = (rows: ReturnType<typeof run>) => rows.map(({ all: _all, ...r }) => r)
  const overall = (rows: ReturnType<typeof run>) => summarise(rows.flatMap((r) => r.all))
  const out = {
    generatedAt: new Date().toISOString(),
    gamesPerSheet: GAMES_PER_SHEET,
    maxTurns: MAX_TURNS,
    seconds: (Date.now() - t0) / 1000,
    cpu: { overall: overall(cpu), sheets: strip(cpu) },
    random: { overall: overall(random), sheets: strip(random) },
    cpuOldImprevisti: { overall: overall(oldCpu), sheets: strip(oldCpu) },
  }
  fs.mkdirSync('tools/out', { recursive: true })
  fs.writeFileSync('tools/out/balance.json', JSON.stringify(out, null, 1))
  console.log(JSON.stringify({ seconds: out.seconds, cpu: out.cpu.overall, random: out.random.overall, old: out.cpuOldImprevisti.overall }, null, 1))
})
