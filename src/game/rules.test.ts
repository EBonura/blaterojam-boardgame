import { describe, it, expect } from 'vitest'
import { newGame, applyMove, currentPlayer, inBuffer, type GameState, type Move } from './rules'

const P = ['a', 'b', 'c', 'd']
const ALL = new Set(P)

/** A game with a known board, hand and Imprevisto deck. The top of a deck is its last element. */
function game(over: Partial<GameState> = {}): GameState {
  const g = newGame(P, 42, 'gestionale') // targets gd 13, prog 13, graf 9, audio 6
  g.order = [...P]
  g.turn = 0
  Object.assign(g, over)
  return g
}
const play = (g: GameState, m: Move, by = currentPlayer(g)) => applyMove(g, m, by, ALL)
const kinds = (g: GameState) => g.events.map((e) => e.kind)
const after = (before: GameState, g: GameState) => g.events.filter((e) => e.seq > (before.events.at(-1)?.seq ?? 0))

describe('setup', () => {
  it('deals a 60-card deck, 15 Imprevisti and a 4-card hand', () => {
    const g = newGame(P, 1)
    expect(g.deck.length + g.hand.length).toBe(60)
    expect(g.impDeck).toHaveLength(15)
    expect(g.hand).toHaveLength(4)
    expect(g.stats).toEqual({ gd: 0, prog: 0, graf: 0, audio: 0 })
  })
})

describe('cards and overflow', () => {
  it('applies a card, discards it and passes the turn', () => {
    const g = game({ hand: ['programmatore#1', 'caffe#1'] })
    const n = play(g, { type: 'play', card: 'programmatore#1' })!
    expect(n.stats.prog).toBe(3)
    expect(n.discard).toContain('programmatore#1')
    expect(currentPlayer(n)).toBe('b')
    expect(n.hand).toHaveLength(4)
  })

  it('overflows at 20: back to 0, leftover points lost, other stats untouched', () => {
    const g = game({ stats: { gd: 5, prog: 18, graf: 2, audio: 1 }, hand: ['programmatore#1'] })
    const n = play(g, { type: 'play', card: 'programmatore#1' })!
    expect(n.stats).toEqual({ gd: 5, prog: 0, graf: 2, audio: 1 })
    expect(n.overflowed).toEqual(['prog'])
  })

  it('never goes below 0', () => {
    const g = game({ stats: { gd: 1, prog: 0, graf: 0, audio: 0 }, hand: ['rar#1'] })
    expect(play(g, { type: 'play', card: 'rar#1', stat: 'gd' })!.stats.gd).toBe(0)
  })

  it('needs a stat for cards "a scelta"', () => {
    const g = game({ hand: ['caffe#1'] })
    expect(play(g, { type: 'play', card: 'caffe#1' })).toBeNull()
    expect(play(g, { type: 'play', card: 'caffe#1', stat: 'audio' })!.stats.audio).toBe(1)
  })

  it('only lets the current player play cards from their hand', () => {
    const g = game({ hand: ['caffe#1'] })
    expect(play(g, { type: 'play', card: 'caffe#1', stat: 'gd' }, 'b')).toBeNull()
    expect(play(g, { type: 'play', card: 'caffe#2', stat: 'gd' })).toBeNull()
  })
})

describe('buffer', () => {
  it('allows only Base cards while any stat is 16 to 19', () => {
    const g = game({ stats: { gd: 0, prog: 0, graf: 17, audio: 0 }, hand: ['brainstorming#1', 'caffe#1'] })
    expect(inBuffer(g)).toBe(true)
    expect(play(g, { type: 'play', card: 'brainstorming#1' })).toBeNull()
    expect(play(g, { type: 'play', card: 'caffe#1', stat: 'gd' })).not.toBeNull()
  })

  it('redraws once automatically, then passes, when the hand has no Base card', () => {
    const special = ['brainstorming#1', 'brainstorming#2', 'brainstorming#3', 'brainstorming#4', 'brainstorming#5', '60-fps#1', 'engine-2d#1', 'sprite-3d#1']
    const g = game({ stats: { gd: 16, prog: 0, graf: 0, audio: 0 }, hand: [], deck: special, discard: [] })
    // 'a' isn't connected, so their turn is skipped and 'b' draws from a deck with no Base card.
    const n = applyMove(g, { type: 'skipAbsent' }, 'b', new Set(['b', 'c', 'd']))!
    const k = after(g, n).map((e) => e.kind)
    expect(k).toContain('redraw')
    expect(k).toContain('pass')
  })

  it('shuffles the discards back in when the deck has no Base card left', () => {
    const special = ['brainstorming#1', 'brainstorming#2', 'brainstorming#3', 'brainstorming#4', 'brainstorming#5', '60-fps#1', 'engine-2d#1', 'sprite-3d#1']
    const g = game({ stats: { gd: 16, prog: 0, graf: 0, audio: 0 }, hand: ['caffe#1'], deck: special, discard: ['zip#1', 'pico-8#1'] })
    const n = play(g, { type: 'play', card: 'caffe#1', stat: 'audio' })!
    expect(after(g, n).map((e) => e.kind)).toContain('redraw')
    expect(n.discard).toEqual([])
    expect([...n.deck, ...n.hand].sort()).toEqual([...special, 'caffe#1', 'zip#1', 'pico-8#1'].sort())
  })
})

describe('imprevisti', () => {
  it('reveals one when an increase reaches a threshold', () => {
    const g = game({ stats: { gd: 0, prog: 5, graf: 0, audio: 0 }, hand: ['programmatore#1'], impDeck: ['merge-conflict'] })
    const n = play(g, { type: 'play', card: 'programmatore#1' })!
    expect(kinds(n)).toContain('imprevisto')
    expect(n.stats.prog).toBe(2) // 5 + 3 = 8, then Merge conflict -6
  })

  it('reveals only one per turn even across several thresholds and stats', () => {
    const g = game({ stats: { gd: 6, prog: 5, graf: 6, audio: 6 }, hand: ['spaghetti-code#1'], impDeck: ['merge-conflict', 'cambio-idea'] })
    const n = play(g, { type: 'play', card: 'spaghetti-code#1' })! // prog 5 -> 11 crosses 7 and 11
    expect(after(g, n).filter((e) => e.kind === 'imprevisto')).toHaveLength(1)
  })

  it('does not trigger on decreases', () => {
    const g = game({ stats: { gd: 9, prog: 0, graf: 0, audio: 0 }, hand: ['zip#1'], impDeck: ['merge-conflict'] })
    expect(kinds(play(g, { type: 'play', card: 'zip#1', stat: 'gd' })!)).not.toContain('imprevisto')
  })

  it('triggers again when a threshold is reached again later', () => {
    let g = game({ stats: { gd: 0, prog: 0, graf: 6, audio: 0 }, hand: ['tavoletta-grafica#1'], impDeck: ['divergenze-creative', 'divergenze-creative'] })
    g = play(g, { type: 'play', card: 'tavoletta-grafica#1' })! // graf 6 -> 7
    expect(g.events.filter((e) => e.kind === 'imprevisto')).toHaveLength(1)
    g.stats.graf = 5
    g.hand = ['pixel-art#1']
    g = play(g, { type: 'play', card: 'pixel-art#1' })! // graf 5 -> 7
    expect(g.events.filter((e) => e.kind === 'imprevisto')).toHaveLength(2)
  })

  it('never chains: an Imprevisto that crosses a threshold reveals nothing more', () => {
    const g = game({ stats: { gd: 0, prog: 5, graf: 0, audio: 0 }, hand: ['programmatore#1'], impDeck: ['merge-conflict', 'brainstorming-infinito'] })
    const n = play(g, { type: 'play', card: 'programmatore#1' })!
    expect(after(g, n).filter((e) => e.kind === 'imprevisto')).toHaveLength(1)
    expect(n.stats).toEqual({ gd: 16, prog: 16, graf: 16, audio: 16 })
  })

  it('Crash improvviso undoes the card that was just played', () => {
    const g = game({ stats: { gd: 0, prog: 5, graf: 0, audio: 0 }, hand: ['programmatore#1'], impDeck: ['crash-improvviso'] })
    expect(play(g, { type: 'play', card: 'programmatore#1' })!.stats.prog).toBe(5)
  })

  it('Notte in bianco skips the next player', () => {
    const g = game({ stats: { gd: 0, prog: 5, graf: 0, audio: 0 }, hand: ['programmatore#1'], impDeck: ['notte-in-bianco'] })
    expect(currentPlayer(play(g, { type: 'play', card: 'programmatore#1' })!)).toBe('c')
  })

  it('Memoria insufficiente: the next player draws only 2', () => {
    const g = game({ stats: { gd: 0, prog: 5, graf: 0, audio: 0 }, hand: ['programmatore#1'], impDeck: ['memoria-insufficiente'] })
    expect(play(g, { type: 'play', card: 'programmatore#1' })!.hand).toHaveLength(2)
  })

  it('Tempo quasi scaduto: the next player plays 2 cards', () => {
    const g = game({ stats: { gd: 0, prog: 5, graf: 0, audio: 0 }, hand: ['programmatore#1'], impDeck: ['tempo-quasi-scaduto'] })
    let n = play(g, { type: 'play', card: 'programmatore#1' })!
    expect(n.toPlay).toBe(2)
    expect(currentPlayer(n)).toBe('b')
    n.hand = ['caffe#1', 'caffe#2', 'zip#1', 'zip#2']
    n = play(n, { type: 'play', card: 'caffe#1', stat: 'audio' })!
    expect(currentPlayer(n)).toBe('b')
    n = play(n, { type: 'play', card: 'caffe#2', stat: 'audio' })!
    expect(currentPlayer(n)).toBe('c')
  })

  it('Blackout: an illegal blind card is discarded with no effect', () => {
    const g = game({ stats: { gd: 0, prog: 5, graf: 0, audio: 0 }, hand: ['programmatore#1'], impDeck: ['blackout'] })
    let n = play(g, { type: 'play', card: 'programmatore#1' })!
    expect(n.blind).toBe(true)
    n.stats.audio = 17 // buffer: only Base cards are legal
    n.hand = ['brainstorming#1', 'brainstorming#2']
    const before = { ...n.stats }
    n = play(n, { type: 'play', card: 'brainstorming#1' })!
    expect(n.stats).toEqual(before)
    expect(kinds(n)).toContain('illegal')
    expect(n.discard).toContain('brainstorming#1')
  })
})

describe('jolly', () => {
  it('sets a stat to 0..15 without triggering an Imprevisto', () => {
    const g = game({ hand: ['blatero#1'], impDeck: ['merge-conflict'] })
    expect(play(g, { type: 'play', card: 'blatero#1', stat: 'prog', value: 16 })).toBeNull()
    const n = play(g, { type: 'play', card: 'blatero#1', stat: 'prog', value: 12 })!
    expect(n.stats.prog).toBe(12)
    expect(kinds(n)).not.toContain('imprevisto')
  })
})

describe('end of game', () => {
  it('wins on exact targets, before any Imprevisto', () => {
    const g = game({ stats: { gd: 13, prog: 11, graf: 9, audio: 6 }, hand: ['autocompletamento#1'], impDeck: ['merge-conflict'] })
    const n = play(g, { type: 'play', card: 'autocompletamento#1' })! // prog 11 -> 13, also a threshold
    expect(n.result).toBe('won')
    expect(kinds(n)).not.toContain('imprevisto')
  })

  it('wins when an Imprevisto lands every stat on target', () => {
    // prog 12 -> 13 reaches a threshold; Cambio idea then takes gd 18 -> 13 and graf 12 -> 9: all on target.
    const g = game({ stats: { gd: 18, prog: 12, graf: 12, audio: 6 }, hand: ['editor-di-codice#1'], impDeck: ['cambio-idea'] })
    const n = play(g, { type: 'play', card: 'editor-di-codice#1' })!
    expect(kinds(n)).toContain('imprevisto')
    expect(n.result).toBe('won')
  })

  it('loses once 3 different stats have overflowed', () => {
    const g = game({ stats: { gd: 0, prog: 0, graf: 18, audio: 0 }, overflowed: ['gd', 'prog'], hand: ['grafico#1'] })
    expect(play(g, { type: 'play', card: 'grafico#1' })!.result).toBe('lost')
  })

  it('the same stat overflowing twice still counts once', () => {
    const g = game({ stats: { gd: 0, prog: 18, graf: 0, audio: 0 }, overflowed: ['gd', 'prog'], hand: ['programmatore#1'] })
    expect(play(g, { type: 'play', card: 'programmatore#1' })!.result).toBe('playing')
  })
})

describe('absent players', () => {
  it('lets the table skip the turn of a disconnected player only', () => {
    const g = game()
    expect(applyMove(g, { type: 'skipAbsent' }, 'b', ALL)).toBeNull()
    const n = applyMove(g, { type: 'skipAbsent' }, 'b', new Set(['b', 'c', 'd']))!
    expect(currentPlayer(n)).toBe('b')
  })
})

describe('preview', () => {
  it('shows what a card would do without changing the game', async () => {
    const { previewPlay } = await import('./rules')
    const g = game({ stats: { gd: 0, prog: 5, graf: 18, audio: 0 } })
    expect(previewPlay(g, 'caffe#1')).toBeNull() // needs a stat first
    expect(previewPlay(g, 'programmatore#1')).toMatchObject({ stats: { prog: 8 }, imprevisto: true, overflow: [] })
    expect(previewPlay(g, 'grafico#1')).toMatchObject({ stats: { graf: 0 }, overflow: ['graf'] })
    expect(previewPlay(g, 'blatero#1', 'audio', 6)).toMatchObject({ stats: { audio: 6 }, imprevisto: false })
    expect(g.stats).toEqual({ gd: 0, prog: 5, graf: 18, audio: 0 })
  })
  it('says when the card would complete the game', async () => {
    const { previewPlay } = await import('./rules')
    const g = game({ stats: { gd: 13, prog: 11, graf: 9, audio: 6 } })
    expect(previewPlay(g, 'autocompletamento#1')?.wins).toBe(true)
  })
})

describe('events for the board animations', () => {
  it('records which thresholds set off the Imprevisto', () => {
    const g = game({ stats: { gd: 0, prog: 5, graf: 0, audio: 0 }, hand: ['spaghetti-code#1'], impDeck: ['divergenze-creative'] })
    const n = play(g, { type: 'play', card: 'spaghetti-code#1' })! // prog 5 -> 11 crosses 7 and 11
    expect(n.events.find((e) => e.kind === 'imprevisto')?.hits).toEqual([{ stat: 'prog', t: 7 }, { stat: 'prog', t: 11 }])
  })
  it('marks a face-down play', () => {
    const g = game({ blind: true, hand: ['caffe#1'] })
    const n = play(g, { type: 'play', card: 'caffe#1' })!
    expect(n.events.find((e) => e.kind === 'play')?.blind).toBe(true)
  })
})
