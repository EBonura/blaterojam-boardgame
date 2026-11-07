// The 15-second clock on each person's move. Every device runs the same clock, so the
// countdown on screen matches; only the host acts on it, playing a random card for a
// player whose time has run out (as it plays the CPU seats).
//
// The clock starts when a move lands, after a grace for what that move set off (a card
// shown to the table, an Imprevisto, the chosen game at the start). The grace depends only
// on the game state, so all devices count the same 15 seconds even though only some of
// them show a given reveal.
import { effect, signal } from '@preact/signals'
import { roomState, amHost, dispatch } from './session'
import { isCpu } from '../room/state'
import { currentPlayer, timeoutMove, TURN_SECONDS, type GameState } from '../game/rules'
import { INTRO_MS, PLAY_GRACE_MS, IMPREVISTO_GRACE_MS } from '../ui/pace'

/** When the current person's clock starts and runs out (ms, this device's clock); null when nobody is on the clock. */
export const turnClock = signal<{ start: number; end: number } | null>(null)

let timer: ReturnType<typeof setTimeout> | undefined
let plannedFor = -1
let seenSeq = Infinity

/** Grace for what the newest events will show the table. */
function grace(g: GameState, since: number): number {
  const fresh = g.events.filter((e) => e.seq > since)
  if (fresh.some((e) => e.kind === 'imprevisto')) return IMPREVISTO_GRACE_MS
  if (fresh.some((e) => e.kind === 'play' || e.kind === 'illegal')) return PLAY_GRACE_MS
  if (g.turn === 0 && !g.events.some((e) => e.kind === 'play')) return INTRO_MS
  return 0
}

export function startTurnTimer() {
  effect(() => {
    const s = roomState.value
    const g = s?.game
    const lastSeq = g?.events.at(-1)?.seq ?? 0
    const due = !!s && s.phase === 'playing' && !!g && g.result === 'playing' && !isCpu(s, currentPlayer(g))
    if (!due) {
      clearTimeout(timer)
      turnClock.value = null
      plannedFor = -1
      seenSeq = lastSeq
      return
    }
    if (plannedFor === s.version) return
    clearTimeout(timer)
    plannedFor = s.version
    const start = Date.now() + grace(g, seenSeq === Infinity ? lastSeq : seenSeq)
    seenSeq = lastSeq
    const end = start + TURN_SECONDS * 1000
    turnClock.value = { start, end }
    const version = s.version
    timer = setTimeout(() => expire(version), end - Date.now())
  })
}

function expire(version: number) {
  const s = roomState.value
  const g = s?.game
  if (!s || !g || s.version !== version || !amHost.value || g.result !== 'playing' || isCpu(s, currentPlayer(g))) return
  dispatch({ type: 'move', id: currentPlayer(g), move: timeoutMove(g), at: version })
}
