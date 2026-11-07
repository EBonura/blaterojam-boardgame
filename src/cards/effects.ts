// How a card's effect is shown: big numbers first. Shared by the game (Card.tsx)
// and the print build (tools/cards/build.mjs), so it has no imports.

export type StatId = 'gd' | 'prog' | 'graf' | 'audio'
/** Display order on the board and on cards (KUDA's board sketch). Resolution order is in rules.ts. */
export const DISPLAY_ORDER: StatId[] = ['prog', 'gd', 'graf', 'audio']
export const STAT_LABEL: Record<StatId, string> = { gd: 'Game Design', prog: 'Programmazione', graf: 'Grafica', audio: 'Audio' }
export const STAT_SHORT: Record<StatId, string> = { gd: 'GD', prog: 'PROG', graf: 'GRAF', audio: 'AUDIO' }

export type Tone = StatId | 'neg' | 'any'
export type Row = { num: string; label: string; short: string; tone: Tone }

type AnyEffect = { type: string; deltas?: Partial<Record<StatId, number>>; amount?: number; min?: number; max?: number; stat?: StatId; a?: StatId; b?: StatId; value?: number }

const sign = (n: number) => (n > 0 ? `+${n}` : `−${-n}`)

/** Big-number rows for an effect, or null when it's a rule best said in words. */
export function effectRows(e: AnyEffect): Row[] | null {
  switch (e.type) {
    case 'add': {
      const d = e.deltas ?? {}
      const ids = DISPLAY_ORDER.filter((s) => d[s])
      const vals = ids.map((s) => d[s]!)
      if (ids.length === 4 && vals.every((v) => v === vals[0]))
        return [{ num: sign(vals[0]), label: 'ogni statistica', short: 'TUTTE', tone: vals[0] < 0 ? 'neg' : 'any' }]
      return ids.map((s) => ({ num: sign(d[s]!), label: STAT_LABEL[s], short: STAT_SHORT[s], tone: d[s]! < 0 ? 'neg' : s }))
    }
    case 'choice':
      return [{ num: sign(e.amount!), label: 'a scelta', short: 'A SCELTA', tone: e.amount! < 0 ? 'neg' : 'any' }]
    case 'set':
      return [{ num: `${e.min}–${e.max}`, label: 'una statistica a scelta', short: 'A SCELTA', tone: 'any' }]
    case 'reset':
      return [{ num: '0', label: STAT_LABEL[e.stat!], short: STAT_SHORT[e.stat!], tone: 'neg' }]
    case 'setAll':
      return [{ num: String(e.value), label: 'ogni statistica', short: 'TUTTE', tone: 'neg' }]
    case 'swap':
      return [{ num: '⇄', label: `${STAT_LABEL[e.a!]} e ${STAT_LABEL[e.b!]}`, short: `${STAT_SHORT[e.a!]}/${STAT_SHORT[e.b!]}`, tone: 'neg' }]
    default:
      return null
  }
}
