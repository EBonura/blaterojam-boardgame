import { useEffect, useState } from 'preact/hooks'
import { t } from '../text'
import { load, save } from '../storage'
import { roomState, status, connected, hostPresence, myId, amHost, createRoom, enterRoom, leaveRoom, dispatch, netInfo, hasTurn } from '../net/session'
import { hostOf, present } from '../room/state'
import { MIN_PLAYERS, MAX_PLAYERS } from '../game/rules'
import { GameScreen } from './GameScreen'
import { Credits } from './Credits'
import { Vote } from './Vote'

export function App() {
  const s = roomState.value
  return (
    <div class="app">
      <main class="screen">
        {status.value === 'idle' ? <Home /> : !s ? <Searching /> : s.phase === 'lobby' ? <Lobby /> : s.phase === 'voting' ? <InVote /> : <InGame />}
      </main>
    </div>
  )
}

function Home() {
  const [name, setName] = useState(load<string>('name') ?? '')
  const [code, setCode] = useState(load<string>('lastRoom') ?? '')
  const ok = name.trim().length > 0
  const remember = () => save('name', name.trim())

  return (
    <section class="home">
      <div class="home-top">
        <Credits />
        <h1 aria-label={t('title')}>
          {'BLATERO'.split('').map((ch, i) => <span class={`c${(i % 4) + 1}`}>{ch}</span>)}
          <small>{t('subtitle')}</small>
        </h1>
      </div>
      <HeroCard />
      <div class="home-form">
        <input value={name} maxLength={16} placeholder={t('yourName')} aria-label={t('yourName')} onInput={(e) => setName(e.currentTarget.value)} autocomplete="nickname" />
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
      </div>
    </section>
  )
}

/** The BLATERO card on its own, art only: it floats, tilts under your finger, and spins when tapped. */
function HeroCard() {
  const [spin, setSpin] = useState(0)
  return (
    <div class="hero">
      <div class={`hero-card tilt card f-arcobaleno ${spin ? 'spinning' : ''}`} key={spin} role="img" aria-label="La carta BLATERO"
        onClick={() => setSpin((n) => n + 1)}>
        <div class="card-in">
          <img class="card-art" src="./cards/art/blatero.svg" alt="" draggable={false} />
        </div>
      </div>
    </div>
  )
}

function Searching() {
  return (
    <section class="center">
      <div class="spinner" aria-hidden="true" />
      <p>{t('connecting')}</p>
      <ConnectionHelp />
      <button onClick={leaveRoom}>{t('leave')}</button>
    </section>
  )
}

/** Says nothing while things work; explains what's wrong when a device stays stuck. */
function ConnectionHelp() {
  const i = netInfo.value
  const [age, setAge] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setAge((a) => a + 1), 1000)
    return () => clearInterval(t)
  }, [])
  let hint = ''
  if (age > 8 && i.relays === 0) hint = 'Nessun server di collegamento raggiungibile: controlla la connessione a internet.'
  else if (age > 12 && i.peers === 0 && i.error) hint = 'Un dispositivo è stato trovato ma il collegamento non parte. Riprovo da solo; se continua, provate una rete diversa.'
  else if (age > 12 && i.peers === 0) hint = 'Nessun altro dispositivo trovato: controlla il codice della stanza.'
  if (!hint) return null
  return (
    <div class="netstatus">
      <p class="ns-hint">{hint}</p>
      <div class="ns-diag">
        Server {i.relays}/{i.relaysTotal} · dispositivi {i.peers}{hasTurn ? ' · TURN' : ''}
      </div>
      {i.error && <code class="ns-err">{i.error}</code>}
    </div>
  )
}

function PlayerList() {
  const s = roomState.value!
  const host = hostOf(s, connected.value)
  const here = present(s, connected.value)
  return (
    <ul class="players">
      {[...s.players].sort((a, b) => a.seat - b.seat).map((p) => {
        const online = here.has(p.id)
        return (
          <li class={`parch ${online ? '' : 'away'} ${p.cpu ? 'cpu' : ''}`}>
            <span class="dot" />
            <span class="pname">{p.name}</span>
            {p.cpu && <span class="cpu-tag">{t('cpu')}</span>}
            {p.id === myId.value && <em>{t('you')}</em>}
            {p.id === host && <em>{t('host')}</em>}
            {!online && <em>{t('offline')}</em>}
            {p.cpu && amHost.value && s.phase === 'lobby' && (
              <button class="cpu-remove" aria-label={t('removeCpu', { name: p.name })} title={t('removeCpu', { name: p.name })}
                onClick={() => dispatch({ type: 'removeCpu', id: myId.value, cpu: p.id })}>
                X
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function RoomCode() {
  const s = roomState.value!
  return (
    <div class="roomcode parch">
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
  const free = online ? s.players.filter((p) => !p.cpu && !online.has(p.id)) : []
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
          {s.players.length < MAX_PLAYERS && (
            <button class="add-cpu" onClick={() => dispatch({ type: 'addCpu', id: myId.value })}>
              {t('addCpu')}
            </button>
          )}
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

function InVote() {
  const seated = roomState.value!.players.some((p) => p.id === myId.value)
  return (
    <>
      {!seated && <ClaimSeat />}
      <Vote />
    </>
  )
}

function InGame() {
  const s = roomState.value!
  const seated = s.players.some((p) => p.id === myId.value)
  return (
    <>
      {!seated && <ClaimSeat />}
      <GameScreen />
    </>
  )
}
