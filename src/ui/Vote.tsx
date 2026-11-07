// Before the game: everyone at the table picks up to three videogames to make.
// The most voted one is made; a tie is drawn at random. CPUs don't vote.
import { useState } from 'preact/hooks'
import { roomState, connected, myId, dispatch, leaveRoom } from '../net/session'
import { MAX_VOTES } from '../room/state'
import { SHEETS, STATS, STAT_NAME } from '../game/rules'
import { t } from '../text'

const LEVEL: Record<string, number> = { Facile: 1, Medio: 2, Difficile: 3, 'Molto difficile': 4, Estremo: 5 }

export function Vote() {
  const s = roomState.value!
  const me = s.players.find((p) => p.id === myId.value)
  const voter = !!me && !me.cpu
  const [mine, setMine] = useState<string[]>(() => s.votes?.[myId.value] ?? [])
  const ready = !!s.ready?.includes(myId.value)
  const people = s.players.filter((p) => !p.cpu)
  // The live tally: everyone's current picks, confirmed or not (your own straight from this screen).
  const picks = (id: string) => (id === myId.value && voter ? mine : (s.votes?.[id] ?? []))
  const count = (sheet: string) => people.filter((p) => picks(p.id).includes(sheet)).length
  const waiting = people.filter((p) => p.id !== myId.value && connected.value.has(p.id) && !s.ready?.includes(p.id))

  const toggle = (sheet: string) => {
    if (!voter) return
    const next = mine.includes(sheet) ? mine.filter((x) => x !== sheet) : mine.length < MAX_VOTES ? [...mine, sheet] : mine
    if (next === mine) return
    setMine(next)
    dispatch({ type: 'vote', id: myId.value, sheets: next })
  }

  return (
    <section class="vote">
      <header>
        <h2 class="px">{t('voteTitle')}</h2>
        <p class="hint">{t('voteHint', { n: MAX_VOTES })}</p>
        <p class="sh-legend">{STATS.map((st) => <span><i class={`st-${st}`} />{STAT_NAME[st]}</span>)}</p>
      </header>
      <ul class="sheets">
        {SHEETS.map((sh) => {
          const n = count(sh.id)
          const on = mine.includes(sh.id)
          return (
            <li>
              <button class={`sheet ${on ? 'on' : ''} ${n ? 'voted' : ''}`} aria-pressed={on} disabled={!voter}
                onClick={() => toggle(sh.id)}>
                <span class="sh-title">{sh.title}</span>
                <span class="sh-diff" aria-label={sh.difficulty} title={sh.difficulty}>
                  {[1, 2, 3, 4, 5].map((k) => <i class={k <= LEVEL[sh.difficulty] ? 'lit' : ''} />)}
                  <small>{sh.difficulty}</small>
                </span>
                <span class="sh-target" aria-hidden="true">
                  {STATS.map((st) => <b class={`st-${st}`}>{sh.target[st]}</b>)}
                </span>
                <span class="sh-votes" aria-label={t('votes', { n })}>
                  {people.map((p) => picks(p.id).includes(sh.id) && <i title={p.name}>{p.name[0]}</i>)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <footer class="vote-bar">
        {voter && !ready && (
          <button class="primary" onClick={() => dispatch({ type: 'ready', id: myId.value })}>
            {mine.length ? t('voteConfirm', { n: mine.length, max: MAX_VOTES }) : t('voteAny')}
          </button>
        )}
        {voter && ready && (
          <button onClick={() => dispatch({ type: 'vote', id: myId.value, sheets: mine })}>{t('voteChange')}</button>
        )}
        {waiting.length > 0 && <p class="hint">{t('voteWaiting', { names: waiting.map((p) => p.name).join(', ') })}</p>}
        <button class="ghost" onClick={leaveRoom}>{t('leave')}</button>
      </footer>
    </section>
  )
}
