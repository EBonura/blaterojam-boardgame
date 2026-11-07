// What a CPU player does on its turn. Pure: (game) => move, for the current player.
//
// The CPU only uses what a player at the table would know: the board, the game
// sheet and its own hand. It never looks at the decks, so it can't see which
// Imprevisto comes next. Each legal option is scored by how much closer it brings
// the board to the sheet, with penalties for overshooting, the Buffer, Overflow
// and setting off an Imprevisto.
import {
  STATS, THRESHOLDS, BUFFER_MIN, OVERFLOW, LOSS_OVERFLOWS, PLAY_CARDS,
  playCard, isLegal, sheetOf, type GameState, type Move, type Stat,
} from './rules'

type Stats = Record<Stat, number>

/** Points of distance a stat costs above its target: going down again needs one of the few red cards. */
const OVERSHOOT = 2
/** Any stat in the Buffer locks the table to Base cards. */
const BUFFER = 3
/** Losing a fresh stat to Overflow; three of them lose the game. */
const NEW_OVERFLOW = 30
const LOSS = 1000
const WIN = 1000
/** An Imprevisto is usually bad news; this mostly decides between options that are otherwise as good. */
const IMPREVISTO = 0.5

export function chooseMove(g: GameState): Move {
  // Blackout: the cards are face down, so any of them is as good as another.
  if (g.blind) return { type: 'play', card: g.hand[Math.abs(g.seed) % g.hand.length] }

  let best: { move: Move; score: number } | null = null
  for (const card of g.hand) {
    if (!isLegal(g, card)) continue
    for (const move of options(card)) {
      const score = scoreMove(g, move)
      if (!best || score > best.score) best = { move, score }
    }
  }
  return best?.move ?? { type: 'pass' }
}

function options(card: string): Move[] {
  const e = playCard(card).effect
  if (e.type === 'choice') return STATS.map((stat) => ({ type: 'play', card, stat }))
  if (e.type === 'set') {
    const out: Move[] = []
    for (const stat of STATS) for (let value = e.min; value <= e.max; value++) out.push({ type: 'play', card, stat, value })
    return out
  }
  return [{ type: 'play', card }]
}

/** How much better the board is after this move (higher is better). */
export function scoreMove(g: GameState, m: Move): number {
  if (m.type !== 'play') return 0
  const target = sheetOf(g).target
  const e = playCard(m.card).effect
  const stats: Stats = { ...g.stats }
  const overflowed = new Set(g.overflowed)
  let crossed = false
  let fresh = 0

  const change = (s: Stat, d: number) => {
    if (!d) return
    const old = stats[s]
    if (d < 0) return void (stats[s] = Math.max(0, old + d))
    const reached = Math.min(old + d, OVERFLOW)
    if (THRESHOLDS.some((t) => old < t && t <= reached)) crossed = true
    if (reached >= OVERFLOW) {
      stats[s] = 0
      if (!overflowed.has(s)) (overflowed.add(s), fresh++)
    } else stats[s] = reached
  }
  if (e.type === 'add') for (const s of STATS) change(s, e.deltas[s] ?? 0)
  else if (e.type === 'choice') change(m.stat!, e.amount)
  else if (e.type === 'set') stats[m.stat!] = m.value!

  if (STATS.every((s) => stats[s] === target[s])) return WIN
  if (overflowed.size >= LOSS_OVERFLOWS) return -LOSS

  const left = reductionLeft(g)
  let score = cost(g.stats, new Set(g.overflowed), target, left) - cost(stats, overflowed, target, left) - fresh * NEW_OVERFLOW
  // The Jolly never sets off an Imprevisto, and only one can come out per turn.
  if (crossed && e.type !== 'set' && !g.imprevistoThisTurn) score -= IMPREVISTO
  return score
}

const REDUCERS = PLAY_CARDS.filter((c) => c.effect.type === 'choice' && c.effect.amount < 0)

/**
 * Points of reduction the team can still draw: every .zip/.rar card that isn't
 * in the discard pile (which is face up, so this is public knowledge).
 */
function reductionLeft(g: GameState): number {
  let n = 0
  for (const c of REDUCERS) {
    const used = g.discard.filter((d) => d.split('#')[0] === c.id).length
    if (c.effect.type === 'choice') n += (c.copies - used) * -c.effect.amount
  }
  return n
}

/**
 * Distance of the board from the sheet. A stat in the Buffer that the remaining
 * reducing cards can't bring back to 15 is trapped: the only way out is through
 * Overflow, so it costs what it will cost after overflowing. That makes the CPU
 * overflow it on purpose instead of locking the table to Base cards for good.
 */
function cost(stats: Stats, overflowed: Set<Stat>, target: Stats, left: number): number {
  const buffer = STATS.filter((s) => stats[s] >= BUFFER_MIN && stats[s] < OVERFLOW)
  const trapped = buffer.reduce((n, s) => n + stats[s] - (BUFFER_MIN - 1), 0) > left
  let c = buffer.length ? BUFFER : 0
  let extra = overflowed.size
  for (const s of STATS) {
    if (trapped && buffer.includes(s)) {
      c += target[s]
      if (!overflowed.has(s)) c += ++extra >= LOSS_OVERFLOWS ? LOSS : NEW_OVERFLOW
      continue
    }
    const d = target[s] - stats[s]
    c += d >= 0 ? d : -d * OVERSHOOT
  }
  return c
}
