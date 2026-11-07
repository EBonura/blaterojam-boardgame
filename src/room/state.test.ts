import { describe, it, expect } from 'vitest'
import { newRoom, reduce, hostOf, topVoted, type RoomState, type Action } from './state'
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

/** Start, everyone in `who` confirms (no picks), and the host counts the votes. */
function play(s: RoomState, who = ['h']): RoomState {
  s = run(s, { type: 'start', id: 'h' }, on(...who))!
  for (const id of who) s = run(s, { type: 'ready', id }, on(...who))!
  return run(s, { type: 'tally', id: 'h' }, on(...who))!
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
    const playing = play(s)
    expect(playing.phase).toBe('playing')
    expect(run(playing, { type: 'removeCpu', id: 'h', cpu })).toBeNull()
  })

  it('never makes a CPU host, and nobody can take over or skip a CPU seat', () => {
    let s = play(room())
    expect(hostOf(s, on('h', ...s.players.map((p) => p.id)))).toBe('h')
    expect(hostOf(s, on())).toBeNull()
    expect(run(s, { type: 'claimSeat', id: 'x', seatOf: s.players[1].id }, on('h', 'x'))).toBeNull()
    // Get to a CPU's turn.
    while (currentPlayer(s.game!) === 'h') s = run(s, { type: 'move', id: 'h', move: chooseMove(s.game!) })!
    expect(run(s, { type: 'move', id: 'h', move: { type: 'skipAbsent' } })).toBeNull()
  })

  it('applies a CPU move only at the version it was worked out for', () => {
    let s = play(room())
    while (currentPlayer(s.game!) === 'h') s = run(s, { type: 'move', id: 'h', move: chooseMove(s.game!) })!
    const cpu = currentPlayer(s.game!)
    const a: Action = { type: 'move', id: cpu, move: chooseMove(s.game!), at: s.version }
    const next = run(s, a)!
    expect(next).not.toBeNull()
    expect(run(next, a)).toBeNull()
  })
})

describe('choosing the videogame', () => {
  const two = () => run(room(), { type: 'join', id: 'g', name: 'Bruno' })!
  const both = on('h', 'g')

  it('goes from the lobby to the vote, and only people vote, up to three real game sheets', () => {
    let s = run(two(), { type: 'start', id: 'h' }, both)!
    expect(s.phase).toBe('voting')
    expect(run(s, { type: 'vote', id: 'h', sheets: ['arcade-retro', 'quiz-game', 'puzzle-game', 'roguelike'] }, both)).toBeNull()
    expect(run(s, { type: 'vote', id: 'h', sheets: ['nope'] }, both)).toBeNull()
    expect(run(s, { type: 'vote', id: s.players[1].id, sheets: ['quiz-game'] }, both)).toBeNull()
    s = run(s, { type: 'vote', id: 'h', sheets: ['quiz-game', 'puzzle-game'] }, both)!
    expect(s.votes!.h).toEqual(['quiz-game', 'puzzle-game'])
  })

  it('counts once every connected person has confirmed, and the most voted sheet is made', () => {
    let s = run(two(), { type: 'start', id: 'h' }, both)!
    s = run(s, { type: 'vote', id: 'h', sheets: ['quiz-game', 'puzzle-game'] }, both)!
    s = run(s, { type: 'vote', id: 'g', sheets: ['puzzle-game', 'roguelike'] }, both)!
    s = run(s, { type: 'ready', id: 'h' }, both)!
    expect(run(s, { type: 'tally', id: 'h' }, both)).toBeNull()
    s = run(s, { type: 'ready', id: 'g' }, both)!
    expect(run(s, { type: 'tally', id: 'g' }, both)).toBeNull()
    const game = run(s, { type: 'tally', id: 'h' }, both)!
    expect(game.phase).toBe('playing')
    expect(game.game!.sheet).toBe('puzzle-game')
    expect(game.votes).toBeUndefined()
  })

  it('draws among the tied sheets, and from all of them when nobody picked any', () => {
    let s = run(two(), { type: 'start', id: 'h' }, both)!
    s = run(s, { type: 'vote', id: 'h', sheets: ['quiz-game'] }, both)!
    s = run(s, { type: 'vote', id: 'g', sheets: ['puzzle-game'] }, both)!
    s = run(run(s, { type: 'ready', id: 'h' }, both)!, { type: 'ready', id: 'g' }, both)!
    expect(topVoted(s).sort()).toEqual(['puzzle-game', 'quiz-game'])
    const seen = new Set(Array.from({ length: 40 }, () => run(s, { type: 'tally', id: 'h' }, both)!.game!.sheet))
    expect([...seen].sort()).toEqual(['puzzle-game', 'quiz-game'])
    expect(topVoted(run(room(), { type: 'start', id: 'h' })!)).toHaveLength(15)
  })

  it('changing your picks takes back your confirmation; someone who dropped out is not waited for', () => {
    let s = run(two(), { type: 'start', id: 'h' }, both)!
    s = run(s, { type: 'ready', id: 'g' }, both)!
    s = run(s, { type: 'vote', id: 'g', sheets: ['quiz-game'] }, both)!
    expect(s.ready).toEqual([])
    s = run(s, { type: 'ready', id: 'h' }, both)!
    expect(run(s, { type: 'tally', id: 'h' }, both)).toBeNull()
    expect(run(s, { type: 'tally', id: 'h' }, on('h'))!.phase).toBe('playing')
  })
})
