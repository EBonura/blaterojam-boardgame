import { describe, it, expect } from 'vitest'
import { newRoom, reduce, hostOf, type RoomState, type Action } from './state'
import { currentPlayer } from '../game/rules'
import { chooseMove } from '../game/cpu'

const on = (...ids: string[]) => new Set(ids)
const run = (s: RoomState, a: Action, connected = on('h')) => reduce(s, a, connected)

/** Host 'h' alone with three CPUs. */
function room(): RoomState {
  let s = newRoom('ABCDE', 'h', 'Anna')
  for (let i = 0; i < 3; i++) s = run(s, { type: 'addCpu', id: 'h' })!
  return s
}

describe('CPU seats', () => {
  it('lets only the host add CPUs, with names, up to the table size', () => {
    const s = room()
    expect(s.players.map((p) => !!p.cpu)).toEqual([false, true, true, true])
    expect(new Set(s.players.map((p) => p.name)).size).toBe(4)
    const withGuest = run(s, { type: 'join', id: 'g', name: 'Bruno' })!
    expect(run(withGuest, { type: 'addCpu', id: 'g' }, on('h', 'g'))).toBeNull()
    const five = run(withGuest, { type: 'addCpu', id: 'h' }, on('h', 'g'))!
    expect(five.players).toHaveLength(6)
    expect(run(five, { type: 'addCpu', id: 'h' }, on('h', 'g'))).toBeNull()
  })

  it('lets the host remove a CPU in the lobby only', () => {
    const s = room()
    const cpu = s.players[1].id
    expect(run(s, { type: 'removeCpu', id: 'h', cpu })!.players).toHaveLength(3)
    expect(run(s, { type: 'removeCpu', id: 'h', cpu: 'h' })).toBeNull()
    const playing = run(s, { type: 'start', id: 'h' })!
    expect(playing.phase).toBe('playing')
    expect(run(playing, { type: 'removeCpu', id: 'h', cpu })).toBeNull()
  })

  it('never makes a CPU host, and nobody can take over or skip a CPU seat', () => {
    let s = run(room(), { type: 'start', id: 'h' })!
    expect(hostOf(s, on('h', ...s.players.map((p) => p.id)))).toBe('h')
    expect(hostOf(s, on())).toBeNull()
    expect(run(s, { type: 'claimSeat', id: 'x', seatOf: s.players[1].id }, on('h', 'x'))).toBeNull()
    // Get to a CPU's turn.
    while (currentPlayer(s.game!) === 'h') s = run(s, { type: 'move', id: 'h', move: chooseMove(s.game!) })!
    expect(run(s, { type: 'move', id: 'h', move: { type: 'skipAbsent' } })).toBeNull()
  })

  it('applies a CPU move only at the version it was worked out for', () => {
    let s = run(room(), { type: 'start', id: 'h' })!
    while (currentPlayer(s.game!) === 'h') s = run(s, { type: 'move', id: 'h', move: chooseMove(s.game!) })!
    const cpu = currentPlayer(s.game!)
    const a: Action = { type: 'move', id: cpu, move: chooseMove(s.game!), at: s.version }
    const next = run(s, a)!
    expect(next).not.toBeNull()
    expect(run(next, a)).toBeNull()
  })
})
