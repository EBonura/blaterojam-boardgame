import { playCard, imprevisto, type PlayCard, type ImprevistoCard } from '../game/rules'
import { effectRows } from '../cards/effects'

type Props = {
  /** A play card instance ("caffe#2") or an Imprevisto id. */
  card: string
  kind?: 'play' | 'imprevisto'
  dim?: boolean
  selected?: boolean
  onClick?: (e: MouseEvent) => void
  /** Small hand-size card: short stat names, numbers take the space. */
  compact?: boolean
}

/** HTML version of the printed card (same layout as tools/cards/build.mjs). */
export function Card({ card, kind = 'play', dim, selected, onClick, compact }: Props) {
  const p: PlayCard | null = kind === 'play' ? playCard(card) : null
  const c: PlayCard | ImprevistoCard = p ?? imprevisto(card)
  const frame = p ? p.frame : 'bianco'
  const rows = effectRows(c.effect)
  return (
    <button
      type="button"
      class={`card f-${frame} ${compact ? 'compact' : ''} ${dim ? 'dim' : ''} ${selected ? 'sel' : ''}`}
      onClick={onClick}
      disabled={!onClick}
      aria-pressed={selected}
      aria-label={`${c.title}: ${c.text}`}
    >
      <div class="card-in">
        <div class={`card-title ${c.title.length > 16 ? 'long' : ''}`}>{c.title}</div>
        <div class="card-screen"><img class="card-art" src={`./cards/art/${c.id}.svg`} alt="" draggable={false} /></div>
        <div class={`card-fx rows-${rows?.length ?? 0}`}>
          {rows ? (
            rows.map((r) => (
              <div class={`fx t-${r.tone}`}>
                <span class="fx-num">{r.num}</span>
                <span class="fx-label">{compact || rows.length > 1 ? r.short : r.label}</span>
              </div>
            ))
          ) : (
            <div class="fx-text">{c.text}</div>
          )}
          {!compact && p?.quote && <div class="card-quote">{p.quote.map((l) => <div>{l}</div>)}</div>}
        </div>
      </div>
    </button>
  )
}

export function CardBack({ onClick, label }: { onClick?: (e: MouseEvent) => void; label?: string }) {
  return (
    <button type="button" class="card back" onClick={onClick} disabled={!onClick} aria-label={label ?? 'Carta coperta'}>
      <div class="card-in">
        <span>BLATERO</span>
      </div>
    </button>
  )
}
