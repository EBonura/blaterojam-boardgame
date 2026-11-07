import { useLayoutEffect, useRef } from 'preact/hooks'
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
  const inner = useRef<HTMLDivElement>(null)
  // A long funny line steps down in size until it fits the card (checked again once the font has loaded, and on resize).
  useLayoutEffect(() => {
    const el = inner.current
    if (!el || !c.quote) return
    // Too tall for the card, or a word too wide for the line (like a file name, which can't wrap).
    const q = el.querySelector<HTMLElement>('.card-quote')
    const over = () => el.scrollHeight > el.clientHeight + 1 || (!!q && q.scrollWidth > q.clientWidth + 1)
    const fit = () => {
      let s = 1
      el.style.setProperty('--qs', '1')
      while (over() && s > 0.5) el.style.setProperty('--qs', String((s -= 0.05)))
    }
    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [card, compact])
  return (
    <button
      type="button"
      class={`card f-${frame} ${compact ? 'compact' : ''} ${dim ? 'dim' : ''} ${selected ? 'sel' : ''}`}
      onClick={onClick}
      disabled={!onClick}
      aria-pressed={selected}
      aria-label={`${c.title}: ${c.text}`}
    >
      <div class="card-in" ref={inner}>
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
          {c.quote && <div class="card-quote">{c.quote.map((l) => <div>{l}</div>)}</div>}
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
