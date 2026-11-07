// Peer-to-peer room session. No server of our own: Trystero finds peers through
// public signaling relays, then everything travels over WebRTC data channels.
//
// How a room survives phones dropping out:
// - Every peer keeps a full copy of the room state and saves it to localStorage.
// - The host is whoever is connected with the lowest seat (see hostOf). If the
//   host's phone locks, the next seat becomes host on its own.
// - When peers meet, each sends its copy; the highest `version` wins.
// - Your player id is saved per room code, so typing the same code again puts
//   you back in your seat. On a different device you can take over the seat of
//   a player who isn't connected.
import { joinRoom as joinNostr, type Room } from 'trystero'
import { signal, computed } from '@preact/signals'
import { reduce, hostOf, newRoom, type Action, type RoomState } from '../room/state'
import { load, save, deviceId } from '../storage'

const APP_ID = 'blaterojam-boardgame-taranto-2026-v1'
// Signaling goes through public Nostr relays by default. `?net=mqtt` switches to
// public MQTT brokers in case the Nostr relays misbehave on the day.
// The MQTT client is large, so it is only downloaded when asked for.
const joinRoom =
  new URLSearchParams(location.search).get('net') === 'mqtt' ? (await import('@trystero-p2p/mqtt')).joinRoom : joinNostr
const HEARTBEAT_MS = 4000
const STALE_MS = 13000

type Hello = { id: string; name: string; version: number }
type Envelope = { nonce: string; action: Action }
const RETRIES = 4

export type Status = 'idle' | 'searching' | 'online'

export const roomState = signal<RoomState | null>(null)
export const status = signal<Status>('idle')
/** Player ids currently reachable, including our own. */
export const connected = signal<Set<string>>(new Set())
export const myId = signal<string>('')
/** Who the host says is connected. The host's view is the one that decides seat claims. */
export const hostPresence = signal<Set<string> | null>(null)
export const amHost = computed(() => {
  const s = roomState.value
  return !!s && hostOf(s, connected.value) === myId.value
})

let room: Room | null = null
let code = ''
let myName = ''
const peerToPlayer = new Map<string, string>()
const lastSeen = new Map<string, number>()
let heartbeat: ReturnType<typeof setInterval> | undefined
let sendHello: (h: Hello, target?: string) => void = () => {}
let sendState: (s: RoomState, target?: string) => void = () => {}
let sendAct: (e: Envelope) => void = () => {}
let sendPresence: () => void = () => {}
/** Actions sent but not yet seen in the host's state; resent on every heartbeat. */
const pending = new Map<string, { env: Envelope; tries: number }>()

/** Player id for this device in this room. `?as=x` in the URL fakes a second device for local testing. */
function playerIdFor(roomCode: string): string {
  const as = new URLSearchParams(location.search).get('as')
  const key = `player:${roomCode}${as ? ':' + as : ''}`
  let id = load<string>(key)
  if (!id) {
    id = as ? `${deviceId()}-${as}` : deviceId()
    save(key, id)
  }
  return id
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O, 1/I
export function makeCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5))
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}
export function normaliseCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)
}

export function createRoom(name: string): string {
  const c = makeCode()
  const id = playerIdFor(c)
  adopt(newRoom(c, id, name))
  connect(c, name)
  return c
}

export function enterRoom(rawCode: string, name: string) {
  const c = normaliseCode(rawCode)
  // If we were in this room before, start from our saved copy. If everyone else
  // has gone, we can carry on from it and become host.
  const saved = load<RoomState>(`room:${c}`)
  if (saved && saved.code === c) roomState.value = saved
  connect(c, name)
}

export function leaveRoom() {
  if (myId.value) dispatch({ type: 'leave', id: myId.value })
  teardown()
  roomState.value = null
  status.value = 'idle'
}

/**
 * Apply an action if we are host, otherwise broadcast it: whoever is host applies
 * it. Broadcasting (rather than aiming at the host) means an action still lands
 * when this device has a stale idea of who the host is.
 */
export function dispatch(a: Action) {
  const s = roomState.value
  if (!s) return
  const env = { nonce: crypto.randomUUID(), action: a }
  if (amHost.value) apply(env)
  else {
    pending.set(env.nonce, { env, tries: 0 })
    sendAct(env)
  }
}

function connect(c: string, name: string) {
  teardown()
  code = c
  myName = name
  myId.value = playerIdFor(c)
  save('lastRoom', c)
  status.value = roomState.value ? 'online' : 'searching'
  refreshConnected()

  room = joinRoom({ appId: APP_ID, password: `blatero-${c}` }, `room-${c}`) as Room
  const hello = room.makeAction<Hello>('hello')
  const state = room.makeAction<RoomState>('state')
  const act = room.makeAction<Envelope>('act')
  const ping = room.makeAction<number>('ping')
  const presence = room.makeAction<string[]>('presence')
  sendPresence = () => presence.send([...connected.value])
  presence.onMessage = (ids, { peerId }) => {
    lastSeen.set(peerId, Date.now())
    const s = roomState.value
    if (s && hostOf(s, connected.value) === peerToPlayer.get(peerId)) hostPresence.value = new Set(ids)
  }

  sendHello = (h, target) => hello.send(h, target ? { target } : undefined)
  sendState = (s, target) => state.send(s, target ? { target } : undefined)
  sendAct = (e) => act.send(e)

  room.onPeerJoin = (peerId) => {
    lastSeen.set(peerId, Date.now())
    sendHello(myHello(), peerId)
    if (roomState.value) sendState(roomState.value, peerId)
  }
  room.onPeerLeave = (peerId) => {
    peerToPlayer.delete(peerId)
    lastSeen.delete(peerId)
    refreshConnected()
  }
  hello.onMessage = (h, { peerId }) => {
    lastSeen.set(peerId, Date.now())
    peerToPlayer.set(peerId, h.id)
    refreshConnected()
    ensureSeated()
    // They are behind: bring them up to date.
    if (roomState.value && roomState.value.version > h.version) sendState(roomState.value, peerId)
  }
  state.onMessage = (s, { peerId }) => {
    lastSeen.set(peerId, Date.now())
    if (s.code !== code) return
    const mine = roomState.value
    if (!mine || s.version > mine.version) {
      adopt(s)
      for (const n of s.recent ?? []) pending.delete(n)
      status.value = 'online'
      ensureSeated()
    }
  }
  act.onMessage = (env, { peerId }) => {
    lastSeen.set(peerId, Date.now())
    if (amHost.value) apply(env)
  }
  ping.onMessage = (_, { peerId }) => {
    lastSeen.set(peerId, Date.now())
    if (!peerToPlayer.has(peerId)) sendHello(myHello(), peerId)
  }

  heartbeat = setInterval(() => {
    ping.send(Date.now())
    refreshConnected()
    // Resend anything the host hasn't acknowledged (it may have been sent
    // before we were connected to the host, or while hosting changed hands).
    for (const [n, p] of pending) {
      if (++p.tries > RETRIES) pending.delete(n)
      else if (amHost.value) (pending.delete(n), apply(p.env))
      else sendAct(p.env)
    }
    // Keep asking for a seat until the host's state shows we have one.
    ensureSeated()
    if (amHost.value) {
      sendPresence()
      hostPresence.value = connected.value
    }
  }, HEARTBEAT_MS)

  ensureSeated()
}

function teardown() {
  clearInterval(heartbeat)
  room?.leave()
  room = null
  peerToPlayer.clear()
  lastSeen.clear()
  pending.clear()
  hostPresence.value = null
}

function myHello(): Hello {
  return { id: myId.value, name: myName, version: roomState.value?.version ?? 0 }
}

/** Ask to be seated if we aren't yet (or update our name). */
function ensureSeated() {
  const s = roomState.value
  if (!s) return
  const me = s.players.find((p) => p.id === myId.value)
  if (me ? me.name !== myName : s.phase === 'lobby') dispatch({ type: 'join', id: myId.value, name: myName })
}

function apply({ nonce, action }: Envelope) {
  const s = roomState.value
  if (!s || s.recent?.includes(nonce)) return
  const next = reduce(s, action, connected.value)
  if (!next) return
  next.recent = [...(s.recent ?? []), nonce].slice(-64)
  adopt(next)
  sendState(next)
}

function adopt(s: RoomState) {
  roomState.value = s
  save(`room:${s.code}`, s)
}

function refreshConnected() {
  const now = Date.now()
  const ids = new Set<string>([myId.value])
  for (const [peer, pid] of peerToPlayer) {
    if (now - (lastSeen.get(peer) ?? 0) < STALE_MS) ids.add(pid)
  }
  const prev = connected.value
  if (ids.size !== prev.size || [...ids].some((i) => !prev.has(i))) connected.value = ids
}

// Phones kill WebRTC connections when the screen locks or the app is switched.
// When we come back, rejoin the room from scratch; our saved state and id do the rest.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && code && room) {
    const alive = [...lastSeen.values()].some((t) => Date.now() - t < STALE_MS)
    if (!alive) connect(code, myName)
  }
})
