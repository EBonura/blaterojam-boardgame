// Deck variants compared by simulation (CPU players, the real rules): what changes if special cards touch fewer
// stats, and if some become negative cards. Writes tools/out/variants.json.
// Run: GAMES=1000 npx vitest run --config tools/vitest.variants.config.ts
import { test, vi } from 'vitest'
import fs from 'node:fs'

type Deltas = Partial<Record<'gd' | 'prog' | 'graf' | 'audio', number>>
type Card = { id: string; title: string; copies: number; frame: string; level: string; effect: { type: string; deltas?: Deltas; [k: string]: unknown }; text: string; quote?: string[] }
type Data = { play: Card[] }

const add = (deltas: Deltas) => ({ type: 'add', deltas })
const set = (d: Data, id: string, deltas: Deltas) => void (d.play.find((c) => c.id === id)!.effect = add(deltas))
const newCard = (id: string, title: string, copies: number, level: string, deltas: Deltas): Card => ({ id, title, copies, frame: level === 'base' ? 'rosso' : 'giallo', level, effect: add(deltas), text: '' })

/** B: no special or mentor touches more than 3 stats. */
function max3(d: Data) {
  set(d, 'brainstorming', { gd: 1, prog: 1, graf: 1 })
  set(d, 'spaghetti-code', { gd: -1, prog: 6, graf: -1 })
}
/** D: B, and 4 of the 5 Brainstorming copies become negative cards (level: speciale, or base for E). */
function convert(d: Data, level: string) {
  max3(d)
  d.play.find((c) => c.id === 'brainstorming')!.copies = 1
  d.play.push(newCard('refactoring', 'Refactoring', 2, level, { gd: -1, prog: -1, graf: -1, audio: -1 }))
  d.play.push(newCard('taglio-di-scope', 'Taglio di scope', 1, level, { gd: -2, prog: -1 }))
  d.play.push(newCard('ottimizzazione', 'Ottimizzazione', 1, level, { graf: -1, audio: -1 }))
}
const VARIANTS: { key: string; name: string; apply: (d: Data) => void }[] = [
  { key: 'A', name: 'Mazzo attuale', apply: () => {} },
  { key: 'B', name: 'Max 3 statistiche', apply: max3 },
  {
    key: 'C', name: 'Max 2 statistiche',
    apply: (d) => {
      set(d, '60-fps', { prog: 3, graf: -2 })
      set(d, 'modello-low-poly', { graf: 3, gd: -2 })
      set(d, 'engine-2d', { prog: 2, graf: -1 })
      set(d, 'grafica-placeholder', { gd: 3, graf: -2 })
      set(d, 'brainstorming', { gd: 1, prog: 1 })
      set(d, 'spaghetti-code', { prog: 6, gd: -1 })
      set(d, 'animazione-frame-by-frame', { graf: 4, prog: -2 })
      set(d, 'grayboxing', { gd: 4, graf: -2 })
    },
  },
  { key: 'D', name: 'Max 3 + carte negative (speciali)', apply: (d) => convert(d, 'speciale') },
  { key: 'E', name: 'Max 3 + carte negative (Base, giocabili nel Buffer)', apply: (d) => convert(d, 'base') },
]

const GAMES = Number(process.env.GAMES ?? 1000)
const PLAYERS = ['p1', 'p2', 'p3', 'p4']

test('variants', { timeout: 3_600_000 }, async () => {
  const out: Record<string, unknown>[] = []
  for (const v of VARIANTS) {
    // A fresh copy of the card data for each variant, changed before the rules read it.
    vi.resetModules()
    const data = (await import('../src/cards/cards.json')).default as unknown as Data
    v.apply(data)
    const rules = await import('../src/game/rules')
    const deck = rules.PLAY_CARDS.map((c) => `${c.id}x${c.copies}:${JSON.stringify(c.effect.type === "add" ? (c.effect as { deltas: object }).deltas : c.effect.type)}`).filter((s) => /brainstorming|refactoring|scope|ottimizz|spaghetti|60-fps/.test(s))
    const { chooseMove } = await import('../src/game/cpu')
    const all = new Set(PLAYERS)
    const per: Record<string, { n: number; won: number; deadline: number; overflowLoss: number; turns: number[] }> = {}
    let imprevisti = 0, overflows = 0, bufferTurns = 0, turnsTotal = 0, noPlay = 0, options = 0, optionTurns = 0, games = 0
    const winTurns: number[] = []
    rules.SHEETS.forEach((sheet, si) => {
      const b = (per[sheet.difficulty] ??= { n: 0, won: 0, deadline: 0, overflowLoss: 0, turns: [] })
      for (let i = 0; i < GAMES; i++) {
        let g = rules.newGame(PLAYERS, 5000 + si * 100000 + i, sheet.id)
        let seen = 0
        for (let guard = 0; guard < 400 && g.result === 'playing'; guard++) {
          const who = rules.currentPlayer(g)
          if (rules.inBuffer(g)) bufferTurns++
          const legal = g.blind ? g.hand.length : g.hand.filter((c) => rules.isLegal(g, c)).length
          if (!g.blind) (options += new Set(g.hand.filter((c) => rules.isLegal(g, c)).map((c) => c.split('#')[0])).size), optionTurns++
          if (!legal) noPlay++
          turnsTotal++
          const n = rules.applyMove(g, chooseMove(g), who, all) ?? rules.applyMove(g, { type: 'pass' }, who, all)
          if (!n) break
          g = n
          for (const e of g.events) if (e.seq > seen) (e.kind === 'imprevisto' && imprevisti++, e.kind === 'overflow' && overflows++)
          seen = g.events.at(-1)?.seq ?? seen
        }
        games++
        b.n++
        if (g.result === 'won') (b.won++, b.turns.push(g.turn + 1), winTurns.push(g.turn + 1))
        else if (g.events.some((e) => e.kind === 'deadline')) b.deadline++
        else b.overflowLoss++
      }
    })
    const pct = (xs: number[], p: number) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))] ?? null }
    const won = Object.values(per).reduce((a, b) => a + b.won, 0)
    const row = {
      key: v.key, variant: v.name, games,
      winRate: won / games,
      deadlineRate: Object.values(per).reduce((a, b) => a + b.deadline, 0) / games,
      overflowLossRate: Object.values(per).reduce((a, b) => a + b.overflowLoss, 0) / games,
      medianTurnsToWin: pct(winTurns, 0.5), p90TurnsToWin: pct(winTurns, 0.9),
      imprevistiPerGame: imprevisti / games, overflowsPerGame: overflows / games,
      bufferShare: bufferTurns / turnsTotal, noPlayShare: noPlay / turnsTotal,
      distinctOptionsPerTurn: options / optionTurns,
      byBand: Object.fromEntries(Object.entries(per).map(([band, b]) => [band, { win: b.won / b.n, deadline: b.deadline / b.n, overflowLoss: b.overflowLoss / b.n, median: pct(b.turns, 0.5) }])),
    }
    out.push({ ...row, deckCheck: deck })
    console.log(JSON.stringify({ key: row.key, win: row.winRate.toFixed(3), median: row.medianTurnsToWin, deadline: row.deadlineRate.toFixed(3) }))
  }
  fs.mkdirSync('tools/out', { recursive: true })
  fs.writeFileSync('tools/out/variants.json', JSON.stringify(out, null, 1))
})
