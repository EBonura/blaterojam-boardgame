// Plays the CPU seats. Only the device that is host does it, so when hosting moves
// to another phone mid-game that phone carries on with the CPU turns by itself.
//
// Each CPU move carries the room version it was worked out from (`at`), and the
// host drops it if the room has moved on. So a CPU move lands at most once, even
// if two devices briefly both think they are host.
import { effect } from '@preact/signals'
import { roomState, amHost, dispatch } from './session'
import { isCpu } from '../room/state'
import { chooseMove } from '../game/cpu'
import { currentPlayer, isLegal, type Move } from '../game/rules'
import { revealBusy, CPU_DELAY_MS } from '../ui/pace'

let timer: ReturnType<typeof setTimeout> | undefined
let plannedFor = -1

export function startCpuDriver() {
  effect(() => {
    const s = roomState.value
    const host = amHost.value
    const g = s?.game
    const due = !!s && host && s.phase === 'playing' && !!g && g.result === 'playing' && isCpu(s, currentPlayer(g))
    if (!due) {
      clearTimeout(timer)
      plannedFor = -1
      return
    }
    if (plannedFor === s.version) return
    clearTimeout(timer)
    plannedFor = s.version
    const version = s.version
    timer = setTimeout(() => play(version), CPU_DELAY_MS)
  })
}

function play(version: number) {
  const s = roomState.value
  const g = s?.game
  if (!s || !g || s.version !== version || !amHost.value || g.result !== 'playing') return
  const cpu = currentPlayer(g)
  if (!isCpu(s, cpu)) return
  // Something is still being shown to the table (a card, an Imprevisto): wait for it.
  if (revealBusy.value) return void (timer = setTimeout(() => play(version), 300))
  // The host applies its own actions straight away, so a refused move shows up as an
  // unchanged version. That should never happen; if it does, fall back to the
  // simplest legal move rather than leave the table waiting for a CPU.
  const first = g.hand.find((c) => g.blind || isLegal(g, c))
  const moves: Move[] = [chooseMove(g), ...(first ? [{ type: 'play', card: first, stat: 'gd', value: 0 } as Move] : []), { type: 'pass' }]
  for (const move of moves) {
    dispatch({ type: 'move', id: cpu, move, at: version })
    if (roomState.value?.version !== version) return
    console.warn('CPU move refused', cpu, move)
  }
}
