import { describe, it, expect } from 'vitest'
import { diff, patch } from './patch'
import { newRoom, reduce, type RoomState } from '../room/state'
import { currentPlayer } from '../game/rules'
import { chooseMove } from '../game/cpu'

const roundTrip = (a: unknown, b: unknown) => expect(patch(a, diff(a, b))).toEqual(b)

describe('patches between room states', () => {
  it('round-trips simple values, keys coming and going, and arrays', () => {
    roundTrip({ a: 1, b: [1, 2, 3] }, { a: 2, b: [2, 3, 4, 5], c: 'x' })
    roundTrip({ a: 1, gone: true }, { a: 1 })
    roundTrip([1, 2, 3], [9, 8])
    roundTrip([], [1])
    roundTrip([1], [])
    expect(diff({ a: [1, 2] }, { a: [1, 2] })).toBeNull()
    expect(diff([1, 2, 3, 4], [3, 4, 5])).toEqual({ s: 2, t: [5] })
  })

  it('rebuilds every state of whole games from patches, and stays small', () => {
    const on = new Set(['h'])
    let sizes = 0, fulls = 0
    for (let seed = 1; seed <= 5; seed++) {
      let s: RoomState = newRoom('ABCDE', 'h', 'Anna')
      for (let i = 0; i < 3; i++) s = reduce(s, { type: 'addCpu', id: 'h' }, on)!
      s = reduce(s, { type: 'start', id: 'h' }, on)!
      s = reduce(s, { type: 'ready', id: 'h' }, on)!
      s = reduce(s, { type: 'tally', id: 'h' }, on)!
      let copy: RoomState = structuredClone(s)
      for (let n = 0; n < 60 && s.game!.result === 'playing'; n++) {
        const g = s.game!
        const next = reduce(s, { type: 'move', id: currentPlayer(g), move: chooseMove(g) }, new Set([...on, ...s.players.map((p) => p.id)]))!
        next.recent = [...(s.recent ?? []), `n${seed}-${n}`].slice(-32)
        const p = diff(s, next)
        copy = patch(copy, p)
        expect(copy).toEqual(next)
        sizes += JSON.stringify(p).length
        fulls += JSON.stringify(next).length
        s = next
      }
    }
    expect(sizes).toBeLessThan(fulls / 3)
  })
})
