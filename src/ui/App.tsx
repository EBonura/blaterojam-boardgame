import { useState } from 'preact/hooks'
import { t } from '../text'
import { load, save } from '../storage'
import { roomState, status, connected, hostPresence, myId, amHost, createRoom, enterRoom, leaveRoom, dispatch } from '../net/session'
import { hostOf } from '../room/state'
import { MIN_PLAYERS, MAX_PLAYERS, currentPlayer } from '../game/rules'
import { KudaBadge } from './KudaBadge'

export function App() {
  const s = roomState.value
  return (
    <div class="app">
      <header class="topbar">
        <span class="brand">BLATERO JAM</span>
      </header>
      <main class="screen">
        {status.value === 'idle' ? <Home /> : !s ? <Searching /> : s.phase === 'lobby' ? <Lobby /> : <Game />}
      </main>
    </div>
  )
}

function Home() {
  const [name, setName] = useState(load<string>('name') ?? '')
  const [code, setCode] = useState(new URLSearchParams(location.search).get('room') ?? load<string>('lastRoom') ?? '')
  const ok = name.trim().length > 0
  const remember = () => save('name', name.trim())

  return (
    <section class="home">
      <KudaBadge large />
      <h1>{t('title')}</h1>
      <label class="field">
        <span>{t('yourName')}</span>
        <input value={name} maxLength={16} onInput={(e) => setName(e.currentTarget.value)} autocomplete="nickname" />
      </label>
      <button class="primary" disabled={!ok} onClick={() => (remember(), createRoom(name.trim()))}>
        {t('createRoom')}
      </button>
      <div class="join">
        <input
          class="code"
          value={code}
          maxLength={5}
          placeholder={t('roomCode')}
          aria-label={t('roomCode')}
          autocapitalize="characters"
          onInput={(e) => setCode(e.currentTarget.value.toUpperCase())}
        />
        <button disabled={!ok || code.trim().length < 5} onClick={() => (remember(), enterRoom(code, name.trim()))}>
          {t('joinRoom')}
        </button>
      </div>
    </section>
  )
}

function Searching() {
  return (
    <section class="center">
      <div class="spinner" aria-hidden="true" />
      <p>{t('connecting')}</p>
      <button onClick={leaveRoom}>{t('leave')}</button>
    </section>
  )
}

function PlayerList() {
  const s = roomState.value!
  const host = hostOf(s, connected.value)
  return (
    <ul class="players">
      {[...s.players].sort((a, b) => a.seat - b.seat).map((p) => {
        const online = connected.value.has(p.id)
        return (
          <li class={online ? '' : 'away'}>
            <span class="dot" />
            <span class="pname">{p.name}</span>
            {p.id === myId.value && <em>{t('you')}</em>}
            {p.id === host && <em>{t('host')}</em>}
            {!online && <em>{t('offline')}</em>}
          </li>
        )
      })}
    </ul>
  )
}

function RoomCode() {
  const s = roomState.value!
  return (
    <div class="roomcode">
      <span>{t('roomCode')}</span>
      <strong>{s.code}</strong>
    </div>
  )
}

/** Shown when this device has no seat: lets you take over a disconnected player's seat. */
function ClaimSeat() {
  const s = roomState.value!
  // Only offer seats the host sees as empty; until we hear from the host, offer none.
  const online = hostPresence.value
  const free = online ? s.players.filter((p) => !online.has(p.id)) : []
  return (
    <div class="claim">
      <p>{t('roomFull')}</p>
      {free.map((p) => (
        <button onClick={() => dispatch({ type: 'claimSeat', id: myId.value, seatOf: p.id })}>{t('takeSeat', { name: p.name })}</button>
      ))}
    </div>
  )
}

function Lobby() {
  const s = roomState.value!
  const seated = s.players.some((p) => p.id === myId.value)
  const enough = s.players.length >= MIN_PLAYERS && s.players.length <= MAX_PLAYERS
  return (
    <section class="lobby">
      <RoomCode />
      <p class="hint">{t('shareCode')}</p>
      <h2>
        {t('players')} {s.players.length}/{MAX_PLAYERS}
      </h2>
      <PlayerList />
      {!seated && <ClaimSeat />}
      {amHost.value ? (
        <>
          <button class="primary" disabled={!enough} onClick={() => dispatch({ type: 'start', id: myId.value })}>
            {t('start')}
          </button>
          {!enough && <p class="hint">{t('needPlayers', { min: MIN_PLAYERS, max: MAX_PLAYERS })}</p>}
        </>
      ) : (
        <p class="hint">{t('waitingHost')}</p>
      )}
      <button class="ghost" onClick={leaveRoom}>
        {t('leave')}
      </button>
    </section>
  )
}

// Placeholder game screen until the rules are in: proves turns sync across devices.
function Game() {
  const s = roomState.value!
  const g = s.game!
  const seated = s.players.some((p) => p.id === myId.value)
  const turnOf = currentPlayer(g)
  const turnName = s.players.find((p) => p.id === turnOf)?.name ?? '?'
  return (
    <section class="game">
      <RoomCode />
      <PlayerList />
      {!seated && <ClaimSeat />}
      <div class="turn">
        <span>{t('turn', { n: g.turn + 1 })}</span>
        <strong>{turnName}</strong>
      </div>
      {turnOf === myId.value && (
        <button class="primary" onClick={() => dispatch({ type: 'move', id: myId.value, move: { type: 'endTurn' } })}>
          {t('endTurn')}
        </button>
      )}
      <button class="ghost" onClick={leaveRoom}>
        {t('leave')}
      </button>
    </section>
  )
}
