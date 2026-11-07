import { useEffect, useState } from 'preact/hooks'
import { roomState, connected, myId, dispatch, leaveRoom } from '../net/session'
import { DISPLAY_ORDER, STAT_LABEL, STAT_SHORT } from '../cards/effects'
import {
  STAT_NAME, THRESHOLDS, BUFFER_MIN, OVERFLOW, LOSS_OVERFLOWS, JOLLY_MAX,
  currentPlayer, sheetOf, inBuffer, isLegal, needsStat, playCard, imprevisto,
  type GameState, type GameEvent, type Stat, type Move,
} from '../game/rules'
import { Card, CardBack } from './Card'
import './game.css'

const nameOf = (id: string) => roomState.value?.players.find((p) => p.id === id)?.name ?? '?'
const send = (move: Move) => dispatch({ type: 'move', id: myId.value, move })

export function GameScreen() {
  const g = roomState.value!.game!
  return (
    <section class="gs">
      <Players g={g} />
      <SheetBar g={g} />
      <Board g={g} />
      <TurnBar g={g} />
      <Hand g={g} />
      <EventLog g={g} />
      <Reveal g={g} />
      {g.result !== 'playing' && <EndScreen g={g} />}
    </section>
  )
}

function Players({ g }: { g: GameState }) {
  const s = roomState.value!
  const turn = currentPlayer(g)
  return (
    <div class="pstrip">
      <span class="ps-code">{s.code}</span>
      {g.order.map((id) => (
        <span class={`ps ${id === turn ? 'turn' : ''} ${connected.value.has(id) ? '' : 'away'} ${id === myId.value ? 'me' : ''}`}>
          {nameOf(id)}
        </span>
      ))}
    </div>
  )
}

function SheetBar({ g }: { g: GameState }) {
  const sh = sheetOf(g)
  return (
    <div class="sheetbar">
      <div class="sb-top">
        <img src={`./cards/art/${sh.id}.svg`} alt="" />
        <div class="sb-name">
          <div class="sb-label">Scheda videogioco · {sh.difficulty}</div>
          <div class="sb-title">{sh.title}</div>
        </div>
        <div class="sb-turn">
          <span>Turno</span>
          <b>{g.turn + 1}</b>
        </div>
      </div>
      <div class="sb-targets">
        {DISPLAY_ORDER.map((st) => (
          <div class={`sb-t t-${st} ${g.stats[st] === sh.target[st] ? 'ok' : ''}`}>
            <span>{STAT_SHORT[st]}</span>
            <b>{sh.target[st]}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

const pct = (v: number) => `${(v / OVERFLOW) * 100}%`

/** KUDA's board: four vertical sliders, 0 at the top, Overflow (20) at the bottom. */
function Board({ g }: { g: GameState }) {
  const target = sheetOf(g).target
  return (
    <div class="board">
      <div class="cols">
        {DISPLAY_ORDER.map((st) => {
          const v = g.stats[st]
          return (
            <div class={`col t-${st} ${v === target[st] ? 'ok' : ''}`}>
              <div class="col-name">{st === 'prog' ? 'Program\u00ADmazione' : STAT_LABEL[st]}</div>
              <div class="col-val">{v}</div>
              <div class="vtrack" role="img" aria-label={`${STAT_LABEL[st]} ${v}, obiettivo ${target[st]}`}>
                <div class="vt-buffer" style={{ top: pct(BUFFER_MIN), height: `calc(${pct(OVERFLOW - BUFFER_MIN)} - 2px)` }} />
                <div class="vt-spine" />
                <div class="vt-fill" style={{ height: pct(v) }} />
                {[...THRESHOLDS, 15].map((t) => (
                  <div class={`vt-tick ${t === 15 ? 'free' : ''}`} style={{ top: pct(t) }}>
                    <span>{t}</span>
                  </div>
                ))}
                <div class="vt-target" style={{ top: pct(target[st]) }} title={`Obiettivo ${target[st]}`} />
                <div class="vt-of" />
                <svg class="vt-ring" style={{ top: pct(v) }} viewBox="0 0 40 20" aria-hidden="true">
                  <ellipse cx="20" cy="10" rx="17" ry="7" />
                </svg>
              </div>
              {g.overflowed.includes(st) && <div class="col-of">OVERFLOW</div>}
            </div>
          )
        })}
      </div>
      <div class="board-foot">
        <span>OVERFLOW (20)</span>
        <span>
          {g.overflowed.length}/{LOSS_OVERFLOWS}
        </span>
      </div>
    </div>
  )
}

function TurnBar({ g }: { g: GameState }) {
  const who = currentPlayer(g)
  const mine = who === myId.value
  const away = !connected.value.has(who)
  const notes: string[] = []
  if (inBuffer(g)) notes.push('Buffer attivo: solo carte Base')
  if (g.blind) notes.push('Blackout: carta a caso, coperta')
  if (g.toPlay > 1) notes.push(`Tempo quasi scaduto: ancora ${g.toPlay} carte`)
  return (
    <div class={`turnbar ${mine ? 'mine' : ''}`}>
      <div class="tb-who">{mine ? 'Tocca a te!' : `Tocca a ${nameOf(who)}`}</div>
      {notes.map((n) => <div class="tb-note">{n}</div>)}
      {away && !mine && g.result === 'playing' && (
        <button class="ghost" onClick={() => send({ type: 'skipAbsent' })}>
          {nameOf(who)} è disconnesso: salta il turno
        </button>
      )}
    </div>
  )
}

function Hand({ g }: { g: GameState }) {
  const mine = currentPlayer(g) === myId.value && g.result === 'playing'
  const [sel, setSel] = useState<string | null>(null)
  const [stat, setStat] = useState<Stat | null>(null)
  const [value, setValue] = useState(10)

  // Reset the selection whenever the hand changes.
  const handKey = g.hand.join(',') + g.turn
  useEffect(() => (setSel(null), setStat(null)), [handKey])

  if (!mine) {
    return (
      <div class="hand others">
        {g.hand.map(() => <CardBack />)}
      </div>
    )
  }

  if (g.blind) {
    return (
      <div class="hand">
        <p class="hint">Blackout! Scegli una carta coperta: verrà giocata senza vederla.</p>
        <div class="cards">
          {g.hand.map((c, i) => <CardBack label={`Carta coperta ${i + 1}`} onClick={() => send({ type: 'play', card: c })} />)}
        </div>
      </div>
    )
  }

  const anyLegal = g.hand.some((c) => isLegal(g, c))
  const card = sel ? playCard(sel) : null
  const ready = sel && (!needsStat(sel) || stat)
  return (
    <div class="hand">
      <div class="cards">
        {g.hand.map((c) => (
          <Card compact card={c} dim={!isLegal(g, c)} selected={sel === c} onClick={isLegal(g, c) ? () => (setSel(c), setStat(null)) : undefined} />
        ))}
      </div>
      {!anyLegal && (
        <button class="primary" onClick={() => send({ type: 'pass' })}>
          Nessuna carta giocabile: passa
        </button>
      )}
      {card && (
        <div class="choose">
          <div class="choose-card"><Card card={sel!} /></div>
          {needsStat(sel!) && (
            <>
              <div class="hint">{card.effect.type === 'set' ? 'Quale statistica vuoi impostare?' : 'Su quale statistica?'}</div>
              <div class="stats">
                {DISPLAY_ORDER.map((s) => (
                  <button class={stat === s ? 'on' : ''} onClick={() => setStat(s)}>
                    {STAT_NAME[s]}
                  </button>
                ))}
              </div>
            </>
          )}
          {card.effect.type === 'set' && stat && (
            <div class="stepper">
              <button onClick={() => setValue(Math.max(0, value - 1))} aria-label="Meno">−</button>
              <b>{value}</b>
              <button onClick={() => setValue(Math.min(JOLLY_MAX, value + 1))} aria-label="Più">+</button>
            </div>
          )}
          <button
            class="primary"
            disabled={!ready}
            onClick={() => send({ type: 'play', card: sel!, stat: stat ?? undefined, value: card.effect.type === 'set' ? value : undefined })}
          >
            Gioca {card.title}
          </button>
        </div>
      )}
    </div>
  )
}

function describe(e: GameEvent): string | null {
  const who = nameOf(e.player)
  switch (e.kind) {
    case 'play': {
      const c = playCard(e.card!)
      if (c.effect.type === 'set') return `${who} gioca ${c.title}: ${STAT_NAME[e.stat!]} a ${e.value}`
      return `${who} gioca ${c.title}${e.stat ? ` su ${STAT_NAME[e.stat]}` : ''}`
    }
    case 'illegal': return `${playCard(e.card!).title} non si può giocare nel Buffer: scartata`
    case 'overflow': return `Overflow su ${STAT_NAME[e.stat!]}! Torna a 0`
    case 'imprevisto': return `Imprevisto: ${imprevisto(e.card!).title}`
    case 'redraw': return `${who} non ha carte Base: ripesca`
    case 'pass': return `${who} passa il turno`
    case 'skip': return `${who} salta il turno`
    case 'won': return 'Gioco completato!'
    case 'lost': return 'Troppi overflow: il gioco è perso'
    default: return null
  }
}

function EventLog({ g }: { g: GameState }) {
  const lines = g.events.map((e) => [e.seq, describe(e)] as const).filter(([, t]) => t).slice(-6).reverse()
  return (
    <ol class="log">
      {lines.map(([seq, t]) => <li key={seq}>{t}</li>)}
    </ol>
  )
}

/** Shows each played card and Imprevisto big for a moment, to everyone. */
function Reveal({ g }: { g: GameState }) {
  const [seen, setSeen] = useState(() => g.events.at(-1)?.seq ?? 0)
  const [queue, setQueue] = useState<GameEvent[]>([])
  useEffect(() => {
    const fresh = g.events.filter((e) => e.seq > seen && (e.kind === 'play' || e.kind === 'imprevisto' || e.kind === 'illegal'))
    if (fresh.length) setQueue((q) => [...q, ...fresh])
    const last = g.events.at(-1)?.seq
    if (last && last > seen) setSeen(last)
  }, [g.events.at(-1)?.seq])
  const cur = queue[0]
  useEffect(() => {
    if (!cur) return
    const t = setTimeout(() => setQueue((q) => q.slice(1)), cur.kind === 'imprevisto' ? 3200 : 2200)
    return () => clearTimeout(t)
  }, [cur?.seq])
  if (!cur) return null
  return (
    <div class={`reveal ${cur.kind}`} onClick={() => setQueue((q) => q.slice(1))}>
      <div class="rv-caption">{describe(cur)}</div>
      <div class="rv-card">
        <Card card={cur.card!} kind={cur.kind === 'imprevisto' ? 'imprevisto' : 'play'} />
      </div>
      <div class="hint">Tocca per continuare</div>
    </div>
  )
}

function EndScreen({ g }: { g: GameState }) {
  const won = g.result === 'won'
  return (
    <div class={`endscreen ${won ? 'won' : 'lost'}`}>
      <h2>{won ? 'Gioco completato!' : 'Game over'}</h2>
      <p>{won ? `${sheetOf(g).title} è pronto per la consegna.` : `${LOSS_OVERFLOWS} statistiche sono andate in overflow.`}</p>
      <button class="primary" onClick={() => dispatch({ type: 'restart', id: myId.value })}>Nuova partita</button>
      <button class="ghost" onClick={leaveRoom}>Torna al menu</button>
    </div>
  )
}
