// The rules, as an overlay over the start screen or the game. The text is docs/regole.md itself (one source),
// without the notes meant for us rather than the players (the decisions of 7 November and the line about them).
import { signal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import doc from '../../docs/regole.md?raw'

export const rulesOpen = signal(false)

/** **bold** and *italic*, the only inline marks the rules use. */
function inline(text: string): ComponentChildren[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part) =>
    part.startsWith('**') ? <b>{part.slice(2, -2)}</b> : part.startsWith('*') ? <i>{part.slice(1, -1)}</i> : part,
  )
}

type Block = { kind: 'h1' | 'h2' | 'p'; text: string } | { kind: 'ul' | 'ol'; items: string[] } | { kind: 'table'; head: string[]; rows: string[][] }

function parse(md: string): Block[] {
  const lines = md.split('\n')
  const out: Block[] = []
  let skip = false
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trimEnd()
    if (l.startsWith('## ')) skip = /^## Decisioni/.test(l)
    if (skip || !l.trim() || /^Questa è la versione usata/.test(l)) continue
    if (l.startsWith('# ')) out.push({ kind: 'h1', text: l.slice(2) })
    else if (l.startsWith('## ')) out.push({ kind: 'h2', text: l.slice(3) })
    else if (l.startsWith('|')) {
      const cells = (s: string) => s.split('|').slice(1, -1).map((c) => c.trim())
      let head = cells(l)
      let rows: string[][] = []
      i++ // the |---| line
      while (lines[i + 1]?.startsWith('|')) rows.push(cells(lines[++i]))
      // The frame colour is on the cards themselves: leave that column out so the table fits a phone.
      const drop = head.indexOf('Cornice')
      if (drop >= 0) (head = head.filter((_, k) => k !== drop)), (rows = rows.map((r) => r.filter((_, k) => k !== drop)))
      out.push({ kind: 'table', head, rows })
    } else if (/^(- |\d+\. )/.test(l)) {
      const kind = l.startsWith('- ') ? 'ul' : 'ol'
      const items = [l.replace(/^(- |\d+\. )/, '')]
      while (/^(- |\d+\. )/.test(lines[i + 1] ?? '')) items.push(lines[++i].replace(/^(- |\d+\. )/, ''))
      out.push({ kind, items })
    } else out.push({ kind: 'p', text: l })
  }
  return out
}
const BLOCKS = parse(doc)

function block(b: Block) {
  switch (b.kind) {
    case 'h1': return null
    case 'h2': return <h3 class="px">{b.text}</h3>
    case 'p': return <p>{inline(b.text)}</p>
    case 'ul': return <ul>{b.items.map((t) => <li>{inline(t)}</li>)}</ul>
    case 'ol': return <ol>{b.items.map((t) => <li>{inline(t)}</li>)}</ol>
    case 'table':
      // Wider tables don't fit a phone in this font: one entry per row instead, the name with the last column
      // (the effect, or the difficulty), and the rest small underneath.
      if (b.head.length > 3)
        return (
          <ul class="rules-rows">
            {b.rows.map((r) => (
              <li>
                <b>{r[0]}</b>: {inline(r[r.length - 1])}
                <small>{r.slice(1, -1).map((c, k) => `${b.head[k + 1]} ${c}`).join(' · ')}</small>
              </li>
            ))}
          </ul>
        )
      return (
        <div class="rules-table">
          <table>
            <thead><tr>{b.head.map((h) => <th>{h}</th>)}</tr></thead>
            <tbody>{b.rows.map((r) => <tr>{r.map((c) => <td>{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
  }
}

export function Rules() {
  const open = rulesOpen.value
  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && (rulesOpen.value = false)
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [open])
  if (!open) return null
  return (
    <div class="rules" role="dialog" aria-modal="true" aria-label="Regolamento" onClick={(e) => e.target === e.currentTarget && (rulesOpen.value = false)}>
      <div class="rules-sheet parch">
        <header>
          <h2 class="px">Regolamento</h2>
          <button type="button" class="rules-close" aria-label="Chiudi il regolamento" onClick={() => (rulesOpen.value = false)}>
            X
          </button>
        </header>
        <div class="rules-body">
          {BLOCKS.map(block)}
        </div>
      </div>
    </div>
  )
}
