// BLATERO rules, from KUDA Games' design document plus the decisions taken on
// 2026-11-07 (see docs/regole.md). Pure functions: (state, move) => new state.
// Only the host runs them; everyone else receives the resulting state.
import data from '../cards/cards.json'

export type Stat = 'gd' | 'prog' | 'graf' | 'audio'
/** Resolution order is fixed: Game Design, Programmazione, Grafica, Audio. */
export const STATS: Stat[] = ['gd', 'prog', 'graf', 'audio']
export const STAT_NAME: Record<Stat, string> = { gd: 'Game Design', prog: 'Programmazione', graf: 'Grafica', audio: 'Audio' }
/** Imprevisto thresholds (two since 7 Nov; 11 was dropped). */
export const THRESHOLDS = [7, 13]
export const BUFFER_MIN = 16
export const OVERFLOW = 20
export const MIN_PLAYERS = 4
export const MAX_PLAYERS = 6
/** The team loses once this many different stats have overflowed during the game. */
export const LOSS_OVERFLOWS = 3
/** The jam's deadline: the team has this many moves (turns, across all players) to finish the game. 48, like the 48 hours of a jam. */
export const MOVE_LIMIT = 48
export const JOLLY_MAX = 15
/** Seconds a person has for each move; when they run out, a random card from their hand is played for them. CPUs have no clock. */
export const TURN_SECONDS = 15

type Deltas = Partial<Record<Stat, number>>
export type Effect =
  | { type: 'add'; deltas: Deltas }
  | { type: 'choice'; amount: number }
  | { type: 'set'; min: number; max: number }
  | { type: 'reset'; stat: Stat }
  | { type: 'swap'; a: Stat; b: Stat }
  | { type: 'setAll'; value: number }
  | { type: 'undoLast' }
  | { type: 'nextBlind' }
  | { type: 'nextDrawTwo' }
  | { type: 'nextSkip' }
  | { type: 'nextPlayTwo' }

export type Level = 'base' | 'speciale' | 'jolly' | 'mentor'
export type Frame = 'verde' | 'rosso' | 'giallo' | 'arcobaleno' | 'argento' | 'bianco'
export type PlayCard = { id: string; title: string; copies: number; frame: Frame; level: Level; effect: Effect; text: string; quote?: string[] }
export type ImprevistoCard = { id: string; title: string; effect: Effect; text: string; quote?: string[] }
export type Sheet = { id: string; title: string; difficulty: string; target: Record<Stat, number>; quote?: string[] }

export const PLAY_CARDS = data.play as PlayCard[]
export const IMPREVISTI = data.imprevisti as ImprevistoCard[]
export const SHEETS = data.sheets as Sheet[]
const PLAY_BY_ID = new Map(PLAY_CARDS.map((c) => [c.id, c]))
const IMP_BY_ID = new Map(IMPREVISTI.map((c) => [c.id, c]))
export const SHEET_BY_ID = new Map(SHEETS.map((s) => [s.id, s]))

/** Card instances in the deck are "<id>#<copy>". */
export const playCard = (instance: string) => PLAY_BY_ID.get(instance.split('#')[0])!
export const imprevisto = (id: string) => IMP_BY_ID.get(id)!

export type GameEvent = {
  seq: number
  turn: number
  player: string
  kind: 'turn' | 'play' | 'illegal' | 'overflow' | 'imprevisto' | 'redraw' | 'pass' | 'skip' | 'won' | 'lost' | 'deadline'
  card?: string
  stat?: Stat
  value?: number
  /** On an Imprevisto: the thresholds that set it off, so the board can show them breaking. */
  hits?: { stat: Stat; t: number }[]
  /** On a play: the card was picked face down (Blackout). */
  blind?: boolean
  /** On a play or a pass: made for the player because their time ran out. */
  timeout?: boolean
  /** On an Imprevisto: the board after the card, before the Imprevisto changed it. */
  before?: Record<Stat, number>
}

export type GameState = {
  seed: number
  sheet: string
  stats: Record<Stat, number>
  /** Stats that have overflowed at least once this game. */
  overflowed: Stat[]
  deck: string[]
  discard: string[]
  impDeck: string[]
  impDiscard: string[]
  order: string[]
  turn: number
  /** Cards the current player holds (only shown to them). */
  hand: string[]
  toPlay: number
  blind: boolean
  imprevistoThisTurn: boolean
  /** Effects an Imprevisto left for the next player. */
  next: { skip?: boolean; drawTwo?: boolean; playTwo?: boolean; blind?: boolean }
  /** Board before the last played card, for "Crash improvviso". */
  undo: { stats: Record<Stat, number>; overflowed: Stat[] } | null
  /** Moves the team has before the jam ends (games saved before the limit existed have none). */
  limit?: number
  result: 'playing' | 'won' | 'lost'
  events: GameEvent[]
}

export type Move =
  /** `timeout`: played for the player because their time ran out. */
  | { type: 'play'; card: string; stat?: Stat; value?: number; timeout?: boolean }
  /** Pass the turn of a player who isn't connected, so the table isn't stuck. */
  | { type: 'skipAbsent' }
  /** Only allowed when no card in hand can be played. */
  | { type: 'pass'; timeout?: boolean }

// ---------- randomness (seeded, so a state fully determines what happens next)

function rand(g: GameState): number {
  // mulberry32
  let t = (g.seed = (g.seed + 0x6d2b79f5) | 0)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
function shuffle<T>(g: GameState, a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand(g) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------- queries

export const currentPlayer = (g: GameState) => g.order[g.turn % g.order.length]
export const sheetOf = (g: GameState) => SHEET_BY_ID.get(g.sheet)!
/** Buffer: while any stat is 16 to 19, only Base cards can be played. */
export const inBuffer = (g: GameState) => STATS.some((s) => g.stats[s] >= BUFFER_MIN && g.stats[s] < OVERFLOW)
export const isLegal = (g: GameState, instance: string) => !inBuffer(g) || playCard(instance).level === 'base'
export const needsStat = (instance: string) => ['choice', 'set'].includes(playCard(instance).effect.type)
const hasLegal = (g: GameState) => g.hand.some((c) => isLegal(g, c))
const isWin = (g: GameState) => STATS.every((s) => g.stats[s] === sheetOf(g).target[s])

// ---------- setup

export function newGame(playerIds: string[], seed = (Math.random() * 2 ** 32) | 0, sheetId?: string): GameState {
  const g: GameState = {
    seed,
    sheet: '',
    stats: { gd: 0, prog: 0, graf: 0, audio: 0 },
    overflowed: [],
    deck: [],
    discard: [],
    impDeck: [],
    impDiscard: [],
    order: [...playerIds],
    turn: 0,
    hand: [],
    toPlay: 1,
    blind: false,
    imprevistoThisTurn: false,
    next: {},
    undo: null,
    limit: MOVE_LIMIT,
    result: 'playing',
    events: [],
  }
  g.sheet = sheetId ?? SHEETS[Math.floor(rand(g) * SHEETS.length)].id
  // Random first player: rotate the seating order.
  const first = Math.floor(rand(g) * g.order.length)
  g.order = [...g.order.slice(first), ...g.order.slice(0, first)]
  g.deck = shuffle(g, PLAY_CARDS.flatMap((c) => Array.from({ length: c.copies }, (_, i) => `${c.id}#${i + 1}`)))
  g.impDeck = shuffle(g, IMPREVISTI.map((c) => c.id))
  startTurn(g)
  return g
}

// ---------- moves

/** Returns the next game state, or null if the move is not allowed. */
export function applyMove(prev: GameState, m: Move, by: string, connected: Set<string>): GameState | null {
  if (prev.result !== 'playing') return null
  const g: GameState = structuredClone(prev)
  const me = currentPlayer(g)

  if (m.type === 'skipAbsent') {
    if (connected.has(me) || !g.order.includes(by)) return null
    log(g, 'skip')
    endTurn(g)
    return g
  }

  if (m.type === 'pass') {
    if (by !== me || g.blind || hasLegal(g)) return null
    log(g, 'pass', m.timeout ? { timeout: true } : {})
    endTurn(g)
    return g
  }

  if (by !== me || !g.hand.includes(m.card)) return null
  const card = playCard(m.card)
  g.hand = g.hand.filter((c) => c !== m.card)
  g.discard.push(m.card)
  let { stat, value } = m

  const blind = g.blind
  if (g.blind) {
    // Blackout: the card was picked face down. An illegal card does nothing.
    g.blind = false
    if (!isLegal(g, m.card)) {
      log(g, 'illegal', { card: m.card, blind: true, ...(m.timeout ? { timeout: true } : {}) })
      return afterPlay(g)
    }
    // Choices on a blind card are random too.
    if (card.effect.type === 'choice' || card.effect.type === 'set') {
      stat = STATS[Math.floor(rand(g) * 4)]
      if (card.effect.type === 'set') value = Math.floor(rand(g) * (JOLLY_MAX + 1))
    }
  } else if (!isLegal(prev, m.card)) return null

  const e = card.effect
  if (e.type === 'choice' && !STATS.includes(stat!)) return null
  if (e.type === 'set' && (!STATS.includes(stat!) || !Number.isInteger(value) || value! < e.min || value! > e.max)) return null

  g.undo = { stats: { ...g.stats }, overflowed: [...g.overflowed] }
  log(g, 'play', { card: m.card, stat, value, ...(blind ? { blind } : {}), ...(m.timeout ? { timeout: true } : {}) })

  const hits: { stat: Stat; t: number }[] = []
  if (e.type === 'add') for (const s of STATS) change(g, s, e.deltas[s] ?? 0, hits)
  if (e.type === 'choice') change(g, stat!, e.amount, hits)
  if (e.type === 'set') g.stats[stat!] = value! // the Jolly never triggers an Imprevisto

  if (checkEnd(g)) return g
  if (hits.length && !g.imprevistoThisTurn) {
    g.imprevistoThisTurn = true
    resolveImprevisto(g, hits)
    if (checkEnd(g)) return g
  }
  return afterPlay(g)
}

/** The move made for a player whose time ran out: a random card from the hand (one that can be played), with random choices; a pass when none can. */
export function timeoutMove(g: GameState, rnd: () => number = Math.random): Move {
  const pick = <T>(xs: T[]) => xs[Math.floor(rnd() * xs.length)]
  const cards = g.blind ? g.hand : g.hand.filter((c) => isLegal(g, c))
  if (!cards.length) return { type: 'pass', timeout: true }
  const card = pick(cards)
  const e = playCard(card).effect
  if (g.blind || (e.type !== 'choice' && e.type !== 'set')) return { type: 'play', card, timeout: true }
  return { type: 'play', card, stat: pick([...STATS]), ...(e.type === 'set' ? { value: e.min + Math.floor(rnd() * (e.max - e.min + 1)) } : {}), timeout: true }
}

/** What a card would do to the board, before playing it (the card's own effect only, no Imprevisto). */
export type Preview = { stats: Record<Stat, number>; overflow: Stat[]; imprevisto: boolean; wins: boolean }

/** Null when the card still needs a stat (or a value) to be chosen. */
export function previewPlay(g: GameState, instance: string, stat?: Stat, value?: number): Preview | null {
  const e = playCard(instance).effect
  if ((e.type === 'choice' || e.type === 'set') && !stat) return null
  const sim: GameState = { ...g, stats: { ...g.stats }, overflowed: [...g.overflowed], events: [] }
  const hits: { stat: Stat; t: number }[] = []
  if (e.type === 'add') for (const s of STATS) change(sim, s, e.deltas[s] ?? 0, hits)
  if (e.type === 'choice') change(sim, stat!, e.amount, hits)
  if (e.type === 'set') sim.stats[stat!] = value ?? 0
  const overflow = sim.events.filter((x) => x.kind === 'overflow').map((x) => x.stat!)
  return { stats: sim.stats, overflow, imprevisto: hits.length > 0 && !g.imprevistoThisTurn, wins: isWin(sim) }
}

// ---------- internals

/**
 * Applies `d` to one stat. Increases can overflow (20 -> back to 0, leftover
 * points lost); decreases stop at 0. Critical thresholds (7, 13) that an
 * increase reaches from below are added to `hits`; pass none for effects that
 * can't set off an Imprevisto.
 */
function change(g: GameState, s: Stat, d: number, hits?: { stat: Stat; t: number }[]) {
  if (!d) return
  const old = g.stats[s]
  if (d < 0) {
    g.stats[s] = Math.max(0, old + d)
    return
  }
  const reached = Math.min(old + d, OVERFLOW)
  if (hits) for (const t of THRESHOLDS) if (old < t && t <= reached) hits.push({ stat: s, t })
  if (reached >= OVERFLOW) {
    g.stats[s] = 0
    if (!g.overflowed.includes(s)) g.overflowed.push(s)
    log(g, 'overflow', { stat: s })
  } else g.stats[s] = reached
}

function resolveImprevisto(g: GameState, hits: { stat: Stat; t: number }[]) {
  if (!g.impDeck.length) (g.impDeck = shuffle(g, g.impDiscard)), (g.impDiscard = [])
  const id = g.impDeck.pop()
  if (!id) return
  g.impDiscard.push(id)
  log(g, 'imprevisto', { card: id, hits, before: { ...g.stats } })
  const e = imprevisto(id).effect
  switch (e.type) {
    case 'reset':
      g.stats[e.stat] = 0
      break
    case 'add':
      // Imprevisto effects never set off another Imprevisto.
      for (const s of STATS) change(g, s, e.deltas[s] ?? 0)
      break
    case 'swap':
      ;[g.stats[e.a], g.stats[e.b]] = [g.stats[e.b], g.stats[e.a]]
      break
    case 'setAll':
      for (const s of STATS) g.stats[s] = e.value
      break
    case 'undoLast':
      if (g.undo) (g.stats = { ...g.undo.stats }), (g.overflowed = [...g.undo.overflowed])
      break
    case 'nextBlind':
      g.next.blind = true
      break
    case 'nextDrawTwo':
      g.next.drawTwo = true
      break
    case 'nextSkip':
      g.next.skip = true
      break
    case 'nextPlayTwo':
      g.next.playTwo = true
      break
  }
}

/** Win is checked before loss and before any Imprevisto. Returns true if the game ended. */
function checkEnd(g: GameState): boolean {
  if (isWin(g)) {
    g.result = 'won'
    log(g, 'won')
    return true
  }
  if (g.overflowed.length >= LOSS_OVERFLOWS) {
    g.result = 'lost'
    log(g, 'lost')
    return true
  }
  return false
}

function afterPlay(g: GameState): GameState {
  g.toPlay--
  // "Tempo quasi scaduto": play a second card if there's a legal one left.
  if (g.toPlay > 0 && g.hand.length && hasLegal(g)) return g
  endTurn(g)
  return g
}

function draw(g: GameState, n: number) {
  for (let i = 0; i < n; i++) {
    if (!g.deck.length) (g.deck = shuffle(g, g.discard)), (g.discard = [])
    const c = g.deck.pop()
    if (!c) break
    g.hand.push(c)
  }
}

function returnHand(g: GameState) {
  g.deck.push(...g.hand)
  g.hand = []
  shuffle(g, g.deck)
}

function endTurn(g: GameState) {
  returnHand(g)
  g.turn++
  startTurn(g)
}

function startTurn(g: GameState) {
  // Passing turns can chain (skip, then a pass); bound it so a stuck table can't loop forever.
  for (let guard = 0; guard < g.order.length * 3; guard++) {
    // Out of moves: the jam is over and the game wasn't finished.
    if (g.limit && g.turn >= g.limit) {
      g.result = 'lost'
      log(g, 'deadline')
      return
    }
    g.imprevistoThisTurn = false
    g.blind = false
    g.toPlay = 1
    const next = g.next
    g.next = {}
    log(g, 'turn')
    if (next.skip) {
      log(g, 'skip')
      g.turn++
      continue
    }
    g.toPlay = next.playTwo ? 2 : 1
    g.blind = !!next.blind
    draw(g, next.drawTwo ? 2 : 4)
    if (g.blind || hasLegal(g)) return
    // Buffer and no Base card: one automatic redraw, then the turn passes.
    log(g, 'redraw')
    returnHand(g)
    // Hands go back into the deck, so it rarely runs out and the discards rarely come
    // back. Once every Base card has been played the Buffer would lock the table for
    // good, so the discards are shuffled back in before the redraw.
    if (!g.deck.some((c) => isLegal(g, c))) (g.deck = shuffle(g, [...g.deck, ...g.discard])), (g.discard = [])
    draw(g, next.drawTwo ? 2 : 4)
    if (hasLegal(g)) return
    log(g, 'pass')
    returnHand(g)
    g.turn++
  }
  // Nobody could play (can't happen with the real deck): deal anyway; the player can pass.
  draw(g, 4)
}

function log(g: GameState, kind: GameEvent['kind'], extra: Partial<GameEvent> = {}) {
  const seq = (g.events.at(-1)?.seq ?? 0) + 1
  g.events.push({ seq, turn: g.turn, player: currentPlayer(g), kind, ...extra })
  // A few turns of history is all the screens use; the log travels with every full room state.
  if (g.events.length > 24) g.events.splice(0, g.events.length - 24)
}
