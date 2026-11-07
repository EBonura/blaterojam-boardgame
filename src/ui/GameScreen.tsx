import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { roomState, connected, myId, dispatch, leaveRoom } from '../net/session'
import { t } from '../text'
import { DISPLAY_ORDER, STAT_SHORT } from '../cards/effects'
import {
  STAT_NAME, THRESHOLDS, BUFFER_MIN, OVERFLOW, LOSS_OVERFLOWS, JOLLY_MAX,
  currentPlayer, sheetOf, inBuffer, isLegal, needsStat, playCard, imprevisto, previewPlay,
  type GameState, type GameEvent, type Stat, type Move, type Preview,
} from '../game/rules'
import { present, isCpu } from '../room/state'
import { Card, CardBack } from './Card'
import './game.css'

const nameOf = (id: string) => roomState.value?.players.find((p) => p.id === id)?.name ?? '?'
const send = (move: Move) => dispatch({ type: 'move', id: myId.value, move })
/** Connected devices plus the CPU seats, which are always at the table. */
const here = () => present(roomState.value!, connected.value)
const cpu = (id: string) => isCpu(roomState.value!, id)
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** A card picked from the hand, with where it was on screen so it can fly from there. */
type Picked = { card: string; from: DOMRect }

export function GameScreen() {
  const g = roomState.value!.game!
  const [picked, setPicked] = useState<Picked | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  // A new hand (or a new turn) drops any card that was being looked at.
  const handKey = g.hand.join(',') + g.turn
  useEffect(() => (setPicked(null), setPreview(null)), [handKey])
  const close = () => (setPicked(null), setPreview(null))

  return (
    <section class="gs">
      <Players g={g} />
      <Tape g={g} />
      <Crt g={g} preview={preview} />
      <EventLog g={g} />
      <TurnBar g={g} />
      <Hand g={g} picked={picked?.card ?? null} onPick={setPicked} />
      {picked && <Stage key={picked.card} g={g} picked={picked} onPreview={setPreview} onClose={close} />}
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
      <span class="ps-code px">{s.code}</span>
      {g.order.map((id) => (
        <span class={`ps ${id === turn ? 'turn' : ''} ${here().has(id) ? '' : 'away'} ${id === myId.value ? 'me' : ''}`}>
          {nameOf(id)}
          {cpu(id) && <i class="ps-cpu">CPU</i>}
        </span>
      ))}
    </div>
  )
}

/** The game sheet as a cassette: the title on the label, targets beside the reels, the turn on the tape counter. */
function Tape({ g }: { g: GameState }) {
  const sh = sheetOf(g)
  const lastSeq = g.events.at(-1)?.seq ?? 0
  const [spin, setSpin] = useState(false)
  useEffect(() => {
    setSpin(true)
    const t = setTimeout(() => setSpin(false), 900)
    return () => clearTimeout(t)
  }, [lastSeq])
  const target = (st: Stat) => (
    <div class={`tt t-${st} ${g.stats[st] === sh.target[st] ? 'ok' : ''}`}>
      <span>{STAT_SHORT[st]}</span>
      <b>{sh.target[st]}</b>
    </div>
  )
  return (
    <div class="tape" role="group" aria-label={`Scheda videogioco: ${sh.title}, ${sh.difficulty}`}>
      <i class="screw s1" /><i class="screw s2" /><i class="screw s3" /><i class="screw s4" />
      <div class="label">
        <div class="stripes" />
        <div class="lt-top">
          <div class="lt-name">
            <div class="lt-title px">{sh.title}</div>
            <div class="lt-sub">Scheda videogioco · {sh.difficulty}</div>
          </div>
          <div class="counter">
            <span>Turno</span>
            <b key={g.turn} class="px">{String(g.turn + 1).padStart(3, '0')}</b>
          </div>
        </div>
        <div class="deck">
          {DISPLAY_ORDER.slice(0, 2).map(target)}
          <div class={`window ${spin ? 'spin' : ''}`}>
            <i class="reel" />
            <i class="band" />
            <i class="reel" />
          </div>
          {DISPLAY_ORDER.slice(2).map(target)}
        </div>
      </div>
    </div>
  )
}

/** Remembers the previous value of something across renders. */
function usePrevious<T>(v: T): T {
  const ref = useRef(v)
  const prev = ref.current
  ref.current = v
  return prev
}

/** The board: a CRT with one bar of 20 boxes per stat that light up as the stat grows. */
function Crt({ g, preview }: { g: GameState; preview: Preview | null }) {
  const target = sheetOf(g).target
  const prev = usePrevious(g.stats)
  const lastSeq = g.events.at(-1)?.seq ?? 0
  const prevSeq = usePrevious(lastSeq)
  // Rows that overflowed in the latest events flash red.
  const flashed = new Set(g.events.filter((e) => e.seq > prevSeq && e.kind === 'overflow').map((e) => e.stat))
  return (
    <div class={`crt ${inBuffer(g) ? 'buffer' : ''} ${preview ? 'previewing' : ''}`}>
      <div class="glass">
        {DISPLAY_ORDER.map((st) => (
          <Bar key={st} st={st} v={g.stats[st]} from={prev[st]} t={target[st]} lost={g.overflowed.includes(st)} flash={flashed.has(st)}
            next={preview ? preview.stats[st] : g.stats[st]} boom={!!preview?.overflow.includes(st)} />
        ))}
        <div class="scale px" aria-hidden="true">
          {[0, 7, 11, 13, 15, 20].map((n) => (
            <span style={{ gridColumn: Math.max(1, n) }} class={n === 0 ? 'zero' : ''}>{n}</span>
          ))}
        </div>
      </div>
      <div class="bezel">
        <span class="px brand">BLATERO</span>
        <span class="of-count">
          Overflow
          {Array.from({ length: LOSS_OVERFLOWS }, (_, i) => <i class={i < g.overflowed.length ? 'used' : ''} />)}
        </span>
      </div>
    </div>
  )
}

/** One stat. `next`/`boom` preview the card on centre stage: ghost boxes it would fill, boxes it would empty, an overflow. */
function Bar({ st, v, from, t, lost, flash, next, boom }: { st: Stat; v: number; from: number; t: number; lost: boolean; flash: boolean; next: number; boom: boolean }) {
  // Remount the boxes when the value changes, so the fill and drain animations replay.
  const [gen, setGen] = useState(0)
  const [last, setLast] = useState({ from: v, to: v })
  useEffect(() => {
    if (from !== v) (setLast({ from, to: v }), setGen((n) => n + 1))
  }, [v])
  return (
    <div class={`bar t-${st} ${v === t ? 'ok' : ''} ${flash ? 'flash' : ''} ${boom ? 'boom' : ''} ${next !== v && !boom && next === t ? 'will-ok' : ''}`}
      aria-label={`${STAT_NAME[st]} ${v}${next !== v ? `, diventerebbe ${next}` : ''}, obiettivo ${t}`}>
      <span class="bar-name">
        {STAT_NAME[st]}
        {lost && <i class="lost" title="Già andata in overflow">X</i>}
      </span>
      <div class="boxes" key={`boxes-${gen}`}>
        {Array.from({ length: OVERFLOW }, (_, i) => {
          const k = i + 1
          const on = k <= v
          const filling = on && k > last.from && last.to > last.from
          const draining = !on && k <= last.from && k > last.to
          const step = filling ? k - last.from - 1 : draining ? last.from - k : 0
          return (
            <i
              class={[
                'box',
                on && 'on',
                THRESHOLDS.includes(k) && 'th',
                k >= BUFFER_MIN && k < OVERFLOW && 'buf',
                k === OVERFLOW && 'of',
                k === t && 'tg',
                k === v && 'cur',
                filling && 'fill',
                draining && 'drain',
                !boom && next > v && k > v && k <= next && 'ghost',
                ((!boom && next < v && k > next && k <= v) || (boom && on)) && 'lose',
                boom && k === OVERFLOW && 'blast',
              ].filter(Boolean).join(' ')}
              style={step ? { animationDelay: `${step * 45}ms` } : undefined}
            />
          )
        })}
      </div>
      {next !== v || boom ? (
        <b class="bar-v pv">
          <s>{v}</s>
          {boom ? '!' : next}
        </b>
      ) : (
        <b class="bar-v" key={`v-${v}`}>{v}</b>
      )}
    </div>
  )
}

function TurnBar({ g }: { g: GameState }) {
  const who = currentPlayer(g)
  const mine = who === myId.value
  const away = !here().has(who)
  const notes: string[] = []
  if (inBuffer(g)) notes.push('Buffer: solo carte Base')
  if (g.blind) notes.push('Blackout: carta coperta')
  if (g.toPlay > 1) notes.push(`Tempo quasi scaduto: ancora ${g.toPlay} carte`)
  const noLegal = mine && !g.blind && !g.hand.some((c) => isLegal(g, c))
  return (
    <div class={`turnbar ${mine ? 'mine' : ''}`} key={`${g.turn}-${who}`}>
      <div class="tb-who px">{mine ? 'Tocca a te!' : `Tocca a ${nameOf(who)}`}</div>
      {cpu(who) && g.result === 'playing' && (
        <div class="tb-note thinking">
          {t('cpuThinking', { name: nameOf(who) })}
          <i />
          <i />
          <i />
        </div>
      )}
      {notes.length > 0 && <div class="tb-note">{notes.join(' · ')}</div>}
      {noLegal && (
        <button class="primary small" onClick={() => send({ type: 'pass' })}>
          Nessuna carta giocabile: passa
        </button>
      )}
      {away && !mine && g.result === 'playing' && (
        <button class="ghost" onClick={() => send({ type: 'skipAbsent' })}>
          {nameOf(who)} è disconnesso: salta il turno
        </button>
      )}
    </div>
  )
}

/** The hand as a fan. Only the player whose turn it is sees the faces. */
function Hand({ g, picked, onPick }: { g: GameState; picked: string | null; onPick: (p: Picked) => void }) {
  const mine = currentPlayer(g) === myId.value && g.result === 'playing'
  const n = g.hand.length
  const fan = (i: number) => ({ '--o': i - (n - 1) / 2, '--d': `${i * 90}ms` }) as Record<string, string | number>
  const key = g.hand.join(',') + g.turn

  if (!mine || g.blind) {
    return (
      <div class={`hand ${mine ? 'blind' : 'others'}`}>
        {mine && <p class="hint">Blackout! Scegli una carta coperta: verrà giocata senza vederla.</p>}
        <div class="cards" key={key}>
          {g.hand.map((c, i) => (
            <div class="slot" style={fan(i)}>
              <CardBack label={mine ? `Carta coperta ${i + 1}` : undefined} onClick={mine ? () => send({ type: 'play', card: c }) : undefined} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div class="hand">
      <div class="cards" key={key}>
        {g.hand.map((c, i) => {
          const legal = isLegal(g, c)
          return (
            <div class={`slot ${picked === c ? 'gone' : ''}`} style={fan(i)}>
              <Card
                compact
                card={c}
                dim={!legal}
                onClick={legal ? (e?: MouseEvent) => onPick({ card: c, from: (e?.currentTarget as HTMLElement).getBoundingClientRect() }) : undefined}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** The picked card in the middle of the screen: choose the stat if needed, then Gioca sends it into the CRT. */
function Stage({ g, picked, onPreview, onClose }: { g: GameState; picked: Picked; onPreview: (p: Preview | null) => void; onClose: () => void }) {
  const card = playCard(picked.card)
  const [stat, setStat] = useState<Stat | null>(null)
  const [value, setValue] = useState(10)
  const [leaving, setLeaving] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const ready = !needsStat(picked.card) || !!stat
  const p = previewPlay(g, picked.card, stat ?? undefined, card.effect.type === 'set' ? value : undefined)
  useEffect(() => onPreview(p), [stat, value])

  // Fly in from where the card sat in the fan.
  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el || calm()) return
    const to = el.getBoundingClientRect()
    const f = picked.from
    const dx = f.left + f.width / 2 - (to.left + to.width / 2)
    const dy = f.top + f.height / 2 - (to.top + to.height / 2)
    el.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${f.width / to.width}) rotate(-6deg)` }, { transform: 'translate(0,0) scale(1.06) rotate(1deg)', offset: 0.75 }, { transform: 'none' }],
      { duration: 460, easing: 'cubic-bezier(.2,.9,.3,1)' },
    )
  }, [])

  const play = () => {
    onPreview(null)
    const move: Move = { type: 'play', card: picked.card, stat: stat ?? undefined, value: card.effect.type === 'set' ? value : undefined }
    const el = cardRef.current
    const crt = document.querySelector('.crt')?.getBoundingClientRect()
    if (!el || !crt || calm()) return send(move)
    setLeaving(true)
    const from = el.getBoundingClientRect()
    const dx = crt.left + crt.width / 2 - (from.left + from.width / 2)
    const dy = crt.top + crt.height / 2 - (from.top + from.height / 2)
    const a = el.animate(
      [{ transform: 'none' }, { transform: 'translateY(12px) scale(1.04)', offset: 0.18 }, { transform: `translate(${dx}px, ${dy}px) scale(.18) rotate(18deg)`, opacity: 0.2 }],
      { duration: 520, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' },
    )
    a.onfinish = () => send(move)
  }

  return (
    <div class={`stage ${leaving ? 'leaving' : ''}`} onClick={(e) => e.target === e.currentTarget && !leaving && onClose()}>
      <div class={`stage-row ${needsStat(picked.card) || (p && (p.wins || p.imprevisto || p.overflow.length > 0)) ? '' : 'solo'}`}>
        <div class="stage-card" ref={cardRef}>
          <Card card={picked.card} />
        </div>
        <div class="choose">
          {needsStat(picked.card) && (
            <>
              <div class="hint">{card.effect.type === 'set' ? 'Quale statistica vuoi impostare?' : 'Su quale statistica?'}</div>
              <div class="stats">
                {DISPLAY_ORDER.map((s) => (
                  <button class={`t-${s} ${stat === s ? 'on' : ''}`} onClick={() => setStat(s)}>
                    {STAT_NAME[s]} <b>{g.stats[s]}</b>
                  </button>
                ))}
              </div>
            </>
          )}
          {card.effect.type === 'set' && stat && (
            <div class="stepper">
              <button onClick={() => setValue(Math.max(0, value - 1))} aria-label="Meno">-</button>
              <b class="px">{value}</b>
              <button onClick={() => setValue(Math.min(JOLLY_MAX, value + 1))} aria-label="Più">+</button>
            </div>
          )}
          {p && (p.wins || p.imprevisto || p.overflow.length > 0) && (
            <div class={`verdict ${p.wins ? 'win' : 'warn'}`}>
              {p.wins
                ? 'Con questa carta completate il gioco!'
                : p.overflow.length
                  ? `Overflow su ${p.overflow.map((x) => STAT_NAME[x]).join(' e ')}: torna a 0`
                  : 'Supera una soglia: scatta un Imprevisto'}
            </div>
          )}
        </div>
      </div>
      <div class="choose-actions">
        <button class="primary px" disabled={!ready || leaving} onClick={play}>
          Gioca
        </button>
        <button class="ghost" onClick={onClose} disabled={leaving}>Annulla</button>
      </div>
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
  const lines = g.events.map((e) => [e.seq, describe(e)] as const).filter(([, t]) => t).slice(-2).reverse()
  return (
    <ol class="log">
      {lines.map(([seq, t]) => <li key={seq}>{t}</li>)}
    </ol>
  )
}

/** Shows each played card and Imprevisto big for a moment, to everyone (your own plays you have just seen). */
function Reveal({ g }: { g: GameState }) {
  const [seen, setSeen] = useState(() => g.events.at(-1)?.seq ?? 0)
  const [queue, setQueue] = useState<GameEvent[]>([])
  useEffect(() => {
    const fresh = g.events.filter(
      (e) => e.seq > seen && (e.kind === 'imprevisto' || e.kind === 'illegal' || (e.kind === 'play' && e.player !== myId.value)),
    )
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
    <div class={`reveal ${cur.kind}`} key={cur.seq} onClick={() => setQueue((q) => q.slice(1))}>
      {cur.kind === 'imprevisto' && <div class="burst px">IMPREVISTO!</div>}
      <div class="rv-caption">{describe(cur)}</div>
      <div class="rv-card">
        <Card card={cur.card!} kind={cur.kind === 'imprevisto' ? 'imprevisto' : 'play'} />
      </div>
      <div class="hint">Tocca per continuare</div>
    </div>
  )
}

const CONFETTI = ['#7fe0b0', '#ffec27', '#ff77a8', '#29adff', '#ffa300']

function EndScreen({ g }: { g: GameState }) {
  const won = g.result === 'won'
  return (
    <div class={`endscreen ${won ? 'won' : 'lost'}`}>
      {won && (
        <div class="confetti" aria-hidden="true">
          {Array.from({ length: 48 }, (_, i) => (
            <i style={{ left: `${(i * 37) % 100}%`, background: CONFETTI[i % 5], animationDelay: `${(i % 12) * 90}ms`, animationDuration: `${1600 + (i % 7) * 180}ms` }} />
          ))}
        </div>
      )}
      <h2 class="px">{won ? 'Gioco completato!' : 'Game over'}</h2>
      <p>{won ? `${sheetOf(g).title} è pronto per la consegna.` : `${LOSS_OVERFLOWS} statistiche sono andate in overflow.`}</p>
      <button class="primary" onClick={() => dispatch({ type: 'restart', id: myId.value })}>Nuova partita</button>
      <button class="ghost" onClick={leaveRoom}>Torna al menu</button>
    </div>
  )
}
