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
    <div class="sheetbar parch">
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

// Board geometry (SVG user units): four columns 85 wide, value 0 at the top, 20 at the bottom.
const COL_W = 85
const Y0 = 22
const UNIT = 12.4
const yOf = (v: number) => Y0 + v * UNIT
const INK_TONE: Record<string, string> = { gd: '#b4560a', prog: '#1d5b9b', graf: '#a52a68', audio: '#2e7a2e' }

/** KUDA's board: four carved tracks on parchment, a gold ring that slides down, Overflow (20) at the bottom. */
function Board({ g }: { g: GameState }) {
  const target = sheetOf(g).target
  const H = yOf(OVERFLOW) + 16
  return (
    <div class="board parch">
      <div class="cols">
        {DISPLAY_ORDER.map((st) => (
          <div class={`col t-${st} ${g.stats[st] === target[st] ? 'ok' : ''}`}>
            <div class="col-name">{st === 'prog' ? 'Program\u00ADmazione' : STAT_LABEL[st]}</div>
            <div class="col-val">{g.stats[st]}</div>
          </div>
        ))}
      </div>
      <svg class="tracks" viewBox={`0 0 ${COL_W * 4} ${H}`} role="img"
        aria-label={DISPLAY_ORDER.map((st) => `${STAT_LABEL[st]} ${g.stats[st]} su ${target[st]}`).join(', ')}>
        <defs>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fff2b0" /><stop offset=".45" stop-color="#d9a426" /><stop offset=".7" stop-color="#8a5a10" /><stop offset="1" stop-color="#f3cf63" />
          </linearGradient>
          <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="5" height="5" fill="#c98a2a" /><rect width="2.2" height="5" fill="#8f2a12" />
          </pattern>
        </defs>
        {DISPLAY_ORDER.map((st, i) => {
          const cx = COL_W * i + COL_W / 2
          const v = g.stats[st]
          const t = target[st]
          const len = yOf(OVERFLOW) - Y0
          return (
            <g class={`trk t-${st}`}>
              {/* carved groove */}
              <rect x={cx - 8} y={Y0 - 9} width="16" height={len + 18} rx="8" fill="#7a5530" />
              <rect x={cx - 6} y={Y0 - 7} width="12" height={len + 14} rx="6" fill="#3d2714" />
              <rect x={cx + 3} y={Y0 - 4} width="1.5" height={len + 8} rx=".75" fill="#9b7448" opacity=".6" />
              {/* buffer 16-19 */}
              <rect x={cx - 6} y={yOf(BUFFER_MIN) - UNIT / 2} width="12" height={UNIT * 4} fill="url(#hatch)" opacity=".9" />
              {/* progress in the stat's ink */}
              <rect class="trk-fill" x={cx - 3.5} y={Y0} width="7" height={len} rx="3.5" fill={INK_TONE[st]}
                style={{ transform: `scaleY(${v / OVERFLOW})` }} />
              {/* minor ticks */}
              {Array.from({ length: OVERFLOW - 1 }, (_, k) => k + 1).map((k) => (
                <line x1={cx + 10} x2={cx + (k % 5 === 0 ? 16 : 13)} y1={yOf(k)} y2={yOf(k)} stroke="#3b2616" stroke-width="1" opacity=".45" />
              ))}
              {/* Imprevisto thresholds */}
              {THRESHOLDS.map((k) => (
                <g>
                  <rect x={cx - 15} y={yOf(k) - 3} width="6" height="6" transform={`rotate(45 ${cx - 12} ${yOf(k)})`} fill="#a3122a" />
                  <text x={cx - 18} y={yOf(k) + 3.5} class="trk-n red" text-anchor="end">{k}</text>
                </g>
              ))}
              {/* end of free memory */}
              <rect x={cx - 14} y={yOf(15) - 1.5} width="28" height="3" rx="1.5" fill="#3b2616" />
              <text x={cx - 17} y={yOf(15) + 4} class="trk-n bold" text-anchor="end">15</text>
              {/* target flag */}
              <g class="trk-target">
                <rect x={cx - 8} y={yOf(t) - 1} width="16" height="2" fill="url(#gold)" />
                <line x1={cx + 9} x2={cx + 9} y1={yOf(t) - 13} y2={yOf(t) + 1} stroke="#3b2616" stroke-width="1.6" />
                <path d={`M${cx + 9.8} ${yOf(t) - 13} H${cx + 32} L${cx + 28} ${yOf(t) - 7.5} L${cx + 32} ${yOf(t) - 2} H${cx + 9.8} Z`} fill="url(#gold)" stroke="#6b4a10" stroke-width=".8" />
                <text x={cx + 19.5} y={yOf(t) - 4.2} class="trk-flag" text-anchor="middle">{t}</text>
              </g>
              {/* overflow seal */}
              <g class={`seal ${g.overflowed.includes(st) ? 'used' : ''}`}>
                <circle cx={cx} cy={yOf(OVERFLOW)} r="10.5" fill="#7d1010" />
                <circle cx={cx} cy={yOf(OVERFLOW)} r="8" fill="#a3161a" stroke="#d64a3a" stroke-width=".8" stroke-dasharray="2 1.4" />
                <text x={cx} y={yOf(OVERFLOW) + 3.4} class="seal-n" text-anchor="middle">20</text>
              </g>
              {/* the ring (anello) */}
              <g class="ring" style={{ transform: `translate(${cx}px, ${yOf(v)}px)` }}>
                <ellipse cx="0" cy="2.2" rx="15" ry="6.2" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="4" />
                <ellipse cx="0" cy="0" rx="15" ry="6.2" fill="none" stroke="url(#gold)" stroke-width="4" />
                <ellipse cx="0" cy="0" rx="15" ry="6.2" fill="none" stroke="#5a3a08" stroke-width=".6" />
              </g>
            </g>
          )
        })}
      </svg>
      <div class="board-foot">
        <span>Overflow</span>
        {Array.from({ length: LOSS_OVERFLOWS }, (_, i) => <i class={`mini-seal ${i < g.overflowed.length ? 'used' : ''}`} />)}
        <span class="bf-hint">a {LOSS_OVERFLOWS} si perde</span>
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
        <div class="choose parch">
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
