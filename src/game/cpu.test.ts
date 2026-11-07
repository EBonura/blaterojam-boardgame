import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chooseMove } from './cpu'
import { SHEET_BY_ID, newGame, applyMove, currentPlayer, isLegal, inBuffer, type GameState, type Move } from './rules'

// These tests check the rules, not the balance: pin Gestionale's targets so retuning the
// game sheets (src/cards/cards.json) doesn't change what the tests expect.
const PINNED = { gd: 13, prog: 13, graf: 9, audio: 6 }
let realTargets: typeof PINNED
beforeAll(() => {
  const s = SHEET_BY_ID.get('gestionale')!
  realTargets = s.target
  s.target = PINNED
})
afterAll(() => void (SHEET_BY_ID.get('gestionale')!.target = realTargets))

const P = ['a', 'b', 'c', 'd']
const ALL = new Set(P)

/** Gestionale: targets gd 13, prog 13, graf 9, audio 6. */
function game(over: Partial<GameState> = {}): GameState {
  const g = newGame(P, 42, 'gestionale')
  g.order = [...P]
  g.turn = 0
  Object.assign(g, over)
  return g
}
const card = (m: Move) => (m.type === 'play' ? m.card : null)

describe('CPU strategy', () => {
  it('only picks a legal card, and passes when there is none', () => {
    // Buffer: prog is 17, so only Base cards. The Jolly and Brainstorming are out.
    const g = game({ stats: { gd: 13, prog: 17, graf: 0, audio: 0 }, hand: ['blatero#1', 'brainstorming#1', 'tavoletta-grafica#1'] })
    expect(inBuffer(g)).toBe(true)
    const m = chooseMove(g)
    expect(card(m)).toBe('tavoletta-grafica#1')
    expect(applyMove(g, m, 'a', ALL)).not.toBeNull()

    expect(chooseMove(game({ stats: { gd: 13, prog: 17, graf: 0, audio: 0 }, hand: ['blatero#1', 'pico-8#1'] }))).toEqual({ type: 'pass' })
  })

  it('prefers a card that hits the target exactly over one that overshoots', () => {
    const g = game({ stats: { gd: 13, prog: 11, graf: 9, audio: 6 }, hand: ['programmatore#1', 'autocompletamento#1', 'editor-di-codice#1'] })
    const m = chooseMove(g)
    expect(m).toEqual({ type: 'play', card: 'autocompletamento#1' })
    expect(applyMove(g, m, 'a', ALL)!.result).toBe('won')
  })

  it('puts a card "a scelta" on the stat with the biggest gap', () => {
    const m = chooseMove(game({ stats: { gd: 12, prog: 4, graf: 8, audio: 5 }, hand: ['energy-drink#1'] }))
    expect(m).toEqual({ type: 'play', card: 'energy-drink#1', stat: 'prog' })
  })

  it('uses a reducing card on a stat above its target', () => {
    const m = chooseMove(game({ stats: { gd: 5, prog: 5, graf: 11, audio: 2 }, hand: ['rar#1'] }))
    expect(m).toEqual({ type: 'play', card: 'rar#1', stat: 'graf' })
  })

  it('dumps a reducing card where it does no harm when nothing is above target', () => {
    const m = chooseMove(game({ stats: { gd: 5, prog: 0, graf: 3, audio: 2 }, hand: ['zip#1'] }))
    expect(m).toEqual({ type: 'play', card: 'zip#1', stat: 'prog' })
  })

  it('sets the stat with the biggest gap exactly to its target with the BLATERO Jolly', () => {
    const m = chooseMove(game({ stats: { gd: 10, prog: 1, graf: 7, audio: 6 }, hand: ['blatero#1', 'caffe#1'] }))
    expect(m).toEqual({ type: 'play', card: 'blatero#1', stat: 'prog', value: 13 })
  })

  it('avoids an Imprevisto threshold when an equally good card does not cross one', () => {
    // gd 5 -> 7 crosses 7; audio 2 -> 4 crosses nothing. Both close the gap by 2.
    const g = game({ stats: { gd: 5, prog: 13, graf: 9, audio: 2 }, hand: ['lore-drop#1', 'audio-stereo#1'] })
    expect(card(chooseMove(g))).toBe('audio-stereo#1')
    // Once an Imprevisto has come out this turn there is nothing to avoid; the first card wins the tie.
    expect(card(chooseMove({ ...g, imprevistoThisTurn: true }))).toBe('lore-drop#1')
  })

  it('never overflows a stat when it has another choice', () => {
    const m = chooseMove(game({ stats: { gd: 18, prog: 0, graf: 0, audio: 0 }, hand: ['game-designer#1', 'audio-mono#1'] }))
    expect(card(m)).toBe('audio-mono#1')
  })

  it('picks a face-down card during a Blackout', () => {
    const g = game({ blind: true, hand: ['blatero#1', 'caffe#1', 'zip#1', 'grafico#1'] })
    const m = chooseMove(g)
    expect(m.type).toBe('play')
    expect(g.hand).toContain(card(m))
    expect(m).not.toHaveProperty('stat')
    expect(applyMove(g, m, 'a', ALL)).not.toBeNull()
  })

  it('plays both cards under "Tempo quasi scaduto"', () => {
    const g = game({ toPlay: 2, hand: ['programmatore#1', 'grafico#1', 'caffe#1'] })
    const once = applyMove(g, chooseMove(g), 'a', ALL)!
    expect(currentPlayer(once)).toBe('a')
    const twice = applyMove(once, chooseMove(once), 'a', ALL)!
    expect(currentPlayer(twice)).toBe('b')
  })

  it('plays whole games to a win or a loss with only legal moves', () => {
    const results = { won: 0, lost: 0 }
    for (let seed = 1; seed <= 200; seed++) {
      let g = newGame(P, seed)
      for (let n = 0; g.result === 'playing'; n++) {
        expect(n).toBeLessThan(2000)
        const m = chooseMove(g)
        if (m.type === 'play' && !g.blind) expect(isLegal(g, m.card)).toBe(true)
        const next = applyMove(g, m, currentPlayer(g), ALL)
        expect(next, `seed ${seed}, move ${JSON.stringify(m)}`).not.toBeNull()
        g = next!
      }
      results[g.result]++
    }
    expect(results.won + results.lost).toBe(200)
    // A team of CPUs should win more often than not.
    expect(results.won).toBeGreaterThan(results.lost)
  })
})
