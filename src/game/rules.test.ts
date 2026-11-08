import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { SHEET_BY_ID, PLAY_CARDS, newGame, applyMove, currentPlayer, inBuffer, timeoutMove, isLegal, BUFFER_MIN, playCard, type GameState, type Move } from './rules'

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
  it('deals the whole deck, 15 Imprevisti and a 4-card hand', () => {
    const g = newGame(P, 1)
    expect(g.deck.length + g.hand.length).toBe(PLAY_CARDS.reduce((n, c) => n + c.copies, 0))
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
    const g = game({ stats: { gd: 6, prog: 0, graf: 12, audio: 0 }, hand: ['brainstorming#1'], impDeck: ['merge-conflict', 'cambio-idea'] })
    const n = play(g, { type: 'play', card: 'brainstorming#1' })! // gd 6 -> 7 and graf 12 -> 13: two thresholds
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
    const g = game({ stats: { gd: 6, prog: 0, graf: 12, audio: 0 }, hand: ['brainstorming#1'], impDeck: ['divergenze-creative'] })
    const n = play(g, { type: 'play', card: 'brainstorming#1' })! // gd 6 -> 7, graf 12 -> 13
    expect(n.events.find((e) => e.kind === 'imprevisto')?.hits).toEqual([{ stat: 'gd', t: 7 }, { stat: 'graf', t: 13 }])
  })
  it('marks a face-down play', () => {
    const g = game({ blind: true, hand: ['caffe#1'] })
    const n = play(g, { type: 'play', card: 'caffe#1' })!
    expect(n.events.find((e) => e.kind === 'play')?.blind).toBe(true)
  })
})

describe('only going up sets off an Imprevisto', () => {
  it('a decrease landing on a threshold does not', () => {
    const g = game({ stats: { gd: 9, prog: 0, graf: 0, audio: 0 }, hand: ['rar#1'], impDeck: ['merge-conflict'] })
    const n = play(g, { type: 'play', card: 'rar#1', stat: 'gd' })! // 9 -> 7
    expect(n.stats.gd).toBe(7)
    expect(kinds(n)).not.toContain('imprevisto')
  })
  it('a mixed card only counts the stats that go up', () => {
    // Sprite 3D: +2 Grafica, -1 Game Design. gd 14 -> 13 lands on a threshold going down; graf 2 -> 4 crosses nothing.
    const g = game({ stats: { gd: 14, prog: 0, graf: 2, audio: 0 }, hand: ['sprite-3d#1'], impDeck: ['merge-conflict'] })
    const n = play(g, { type: 'play', card: 'sprite-3d#1' })!
    expect(n.stats).toMatchObject({ gd: 13, graf: 4 })
    expect(kinds(n)).not.toContain('imprevisto')
  })
  it('the Jolly moving a stat onto a threshold does not', () => {
    const g = game({ stats: { gd: 3, prog: 0, graf: 0, audio: 0 }, hand: ['blatero#1'], impDeck: ['merge-conflict'] })
    expect(kinds(play(g, { type: 'play', card: 'blatero#1', stat: 'gd', value: 13 })!)).not.toContain('imprevisto')
  })
})

describe('imprevisto event', () => {
  it('records the board before the Imprevisto changed it', () => {
    const g = game({ stats: { gd: 0, prog: 5, graf: 0, audio: 0 }, hand: ['programmatore#1'], impDeck: ['merge-conflict'] })
    const n = play(g, { type: 'play', card: 'programmatore#1' })!
    expect(n.events.find((e) => e.kind === 'imprevisto')?.before).toMatchObject({ prog: 8 })
    expect(n.stats.prog).toBe(2)
  })
})

describe('move limit', () => {
  it('the team loses when the moves run out', () => {
    const g = game({ limit: 2, hand: ['caffe#1'] })
    let n = play(g, { type: 'play', card: 'caffe#1', stat: 'audio' })!
    expect(n.result).toBe('playing')
    n.hand = ['caffe#2']
    n = play(n, { type: 'play', card: 'caffe#2', stat: 'audio' })!
    expect(n.result).toBe('lost')
    expect(kinds(n)).toContain('deadline')
  })
  it('a win on the last move still counts', () => {
    const g = game({ limit: 1, stats: { gd: 13, prog: 11, graf: 9, audio: 6 }, hand: ['autocompletamento#1'] })
    expect(play(g, { type: 'play', card: 'autocompletamento#1' })!.result).toBe('won')
  })
})

describe('time running out', () => {
  it('plays a random card the rules accept, marked as a timeout, for many games and turns', () => {
    for (let seed = 1; seed <= 40; seed++) {
      let g = newGame(['a', 'b', 'c', 'd'], seed)
      for (let i = 0; i < 30 && g.result === 'playing'; i++) {
        const who = currentPlayer(g)
        const m = timeoutMove(g)
        expect(m.type === 'play' || m.type === 'pass').toBe(true)
        const next = applyMove(g, m, who, new Set(['a', 'b', 'c', 'd']))
        expect(next).not.toBeNull()
        expect(next!.events.some((e) => e.timeout)).toBe(true)
        g = next!
      }
    }
  })

  it('passes when no card in hand can be played', () => {
    const g = newGame(['a', 'b', 'c', 'd'], 3)
    g.stats = { gd: BUFFER_MIN, prog: 0, graf: 0, audio: 0 } // in the Buffer: Base cards only
    g.hand = g.deck.concat(g.hand).filter((c) => !['base', 'jolly'].includes(playCard(c).level)).slice(0, 4)
    expect(g.hand.length).toBe(4)
    expect(g.hand.some((c) => isLegal(g, c))).toBe(false)
    expect(timeoutMove(g)).toEqual({ type: 'pass', timeout: true })
  })
})

describe('the Buffer', () => {
  it('allows Base cards and the BLATERO Jolly, not special or Mentor cards', () => {
    const g = newGame(['a', 'b', 'c', 'd'], 9)
    g.stats = { gd: BUFFER_MIN, prog: 0, graf: 0, audio: 0 }
    const one = (level: string) => g.deck.concat(g.hand).find((c) => playCard(c).level === level)!
    expect(isLegal(g, one('base'))).toBe(true)
    expect(isLegal(g, one('jolly'))).toBe(true)
    expect(isLegal(g, one('speciale'))).toBe(false)
    expect(isLegal(g, one('mentor'))).toBe(false)
  })
})
