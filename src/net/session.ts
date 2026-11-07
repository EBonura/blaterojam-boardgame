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
import { joinRoom as joinNostr, getRelaySockets as nostrSockets, type Room } from 'trystero'
import { signal, computed } from '@preact/signals'
import { reduce, hostOf, newRoom, type Action, type RoomState } from '../room/state'
import { load, save, deviceId } from '../storage'

const APP_ID = 'blaterojam-boardgame-taranto-2026-v1'

// How phones find each other: public Nostr relays by default, or public MQTT
// brokers (switchable in the game, and every device in a room must use the same).
// The MQTT client is large, so it is only downloaded when chosen.
export type Net = 'nostr' | 'mqtt'
const urlNet = new URLSearchParams(location.search).get('net')
export const net = signal<Net>(urlNet === 'mqtt' || urlNet === 'nostr' ? urlNet : load<Net>('net') ?? 'nostr')
let mqtt: typeof import('@trystero-p2p/mqtt') | null = null
// Nostr relays measured as reliable for Palermo Drive (palermo-drive/src/p2p/relays.js),
// instead of Trystero picking from 29 volunteer relays, some of which rate-limit or go quiet.
const NOSTR_RELAYS = ['nos.lol', 'nostr.chaima.info', 'nostr.christiansass.de', 'nostr.stakey.net', 'relay.bitmacro.cloud'].map((h) => 'wss://' + h)

// Optional TURN relay, for networks where phones can't connect directly (mobile
// data, Wi-Fi that isolates devices). Set at build time, e.g. from a free
// Metered.ca app: VITE_TURN_URLS (comma separated), VITE_TURN_USER, VITE_TURN_PASS.
const env = import.meta.env
const TURN = env.VITE_TURN_URLS
  ? [{ urls: String(env.VITE_TURN_URLS).split(','), username: env.VITE_TURN_USER, credential: env.VITE_TURN_PASS }]
  : undefined
export const hasTurn = !!TURN

/** What the connection is doing, shown on screen so a stuck join can be diagnosed. */
export const netInfo = signal({ relays: 0, relaysTotal: 0, peers: 0, error: '' })

export function setNet(n: Net) {
  net.value = n
  save('net', n)
  if (code) connect(code, myName)
}
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
let diagTimer: ReturnType<typeof setInterval> | undefined
let hadPeers = false
let cutOffSince = 0
let lastJoinAt = 0
const REJOIN_AFTER_MS = 15000

/**
 * Rejoin the room when this device has been cut off for a while: either it never
 * got the room from anyone, or it had peers and now has no working link to any.
 * Only while the page is visible, so a backgrounded phone doesn't spin.
 */
function watchdog() {
  if (!code || document.visibilityState !== 'visible') return (cutOffSince = 0)
  const live = Object.keys(room?.getPeers() ?? {}).some(linkUp)
  const cutOff = status.value === 'searching' || (hadPeers && !live)
  if (!cutOff) return (cutOffSince = 0)
  cutOffSince ||= Date.now()
  if (Date.now() - cutOffSince > REJOIN_AFTER_MS && Date.now() - lastJoinAt > REJOIN_AFTER_MS) {
    cutOffSince = 0
    connect(code, myName)
  }
}

/** Leave and rejoin the room now (also used by the tests). */
export function reconnectNow() {
  if (code) connect(code, myName)
}
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
  hadPeers = false
  const c = makeCode()
  const id = playerIdFor(c)
  adopt(newRoom(c, id, name))
  connect(c, name)
  return c
}

export function enterRoom(rawCode: string, name: string) {
  hadPeers = false
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

let joinSeq = 0

function connect(c: string, name: string) {
  const left = teardown()
  code = c
  myName = name
  myId.value = playerIdFor(c)
  save('lastRoom', c)
  status.value = roomState.value ? 'online' : 'searching'
  refreshConnected()
  netInfo.value = { relays: 0, relaysTotal: 0, peers: 0, error: '' }
  lastJoinAt = Date.now()
  // Trystero's leave() finishes asynchronously and then destroys the old room's
  // links, which are shared with a new join of the same room. Joining before it
  // has finished gets the new connection killed, so wait for it.
  const seq = ++joinSeq
  const ready = net.value === 'mqtt' && !mqtt ? import('@trystero-p2p/mqtt').then((m) => void (mqtt = m)) : Promise.resolve()
  Promise.all([left, ready]).then(() => {
    if (seq === joinSeq) openRoom(c)
  })
}

function openRoom(c: string) {
  const join = net.value === 'mqtt' ? mqtt!.joinRoom : joinNostr
  const sockets = net.value === 'mqtt' ? mqtt!.getRelaySockets : nostrSockets
  const config = {
    appId: APP_ID,
    password: `blatero-${c}`,
    ...(net.value === 'nostr' ? { relayConfig: { urls: NOSTR_RELAYS } } : {}),
    ...(TURN ? { turnConfig: TURN } : {}),
  }
  room = join(config, `room-${c}`, {
    // Peers found each other but WebRTC could not link them: usually a network that needs TURN.
    onJoinError: (d: { error?: unknown }) => (netInfo.value = { ...netInfo.value, error: String(d.error ?? 'errore') }),
  }) as Room
  const diag = () => {
    watchdog()
    const socks = Object.values((sockets?.() ?? {}) as Record<string, { readyState?: number; connected?: boolean }>)
    netInfo.value = {
      ...netInfo.value,
      relays: socks.filter((x) => x.readyState === 1 || x.connected === true).length,
      relaysTotal: socks.length,
      peers: Object.keys(room?.getPeers() ?? {}).length,
      // A failed link to a device we are now connected to anyway is not worth showing.
      error: Object.keys(room?.getPeers() ?? {}).some(linkUp) ? '' : netInfo.value.error,
    }
  }
  diagTimer = setInterval(diag, 1000)
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
    hadPeers = true
    netInfo.value = { ...netInfo.value, error: '' }
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

function teardown(): Promise<unknown> {
  clearInterval(heartbeat)
  clearInterval(diagTimer)
  const left = room ? room.leave().catch(() => {}) : Promise.resolve()
  room = null
  peerToPlayer.clear()
  lastSeen.clear()
  pending.clear()
  hostPresence.value = null
  return left
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

/** True while the WebRTC link to this peer is actually up (browsers slow down our heartbeat in background tabs, the link itself doesn't). */
function linkUp(peerId: string): boolean {
  const pc = room?.getPeers()[peerId] as RTCPeerConnection | undefined
  return !!pc && (pc.connectionState === 'connected' || pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed')
}

function refreshConnected() {
  const now = Date.now()
  const ids = new Set<string>([myId.value])
  for (const [peer, pid] of peerToPlayer) {
    if (linkUp(peer) || now - (lastSeen.get(peer) ?? 0) < STALE_MS) ids.add(pid)
  }
  const prev = connected.value
  if (ids.size !== prev.size || [...ids].some((i) => !prev.has(i))) connected.value = ids
}

// Phones kill WebRTC connections when the screen locks or the app is switched.
// When we come back, rejoin the room from scratch; our saved state and id do the rest.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && code && room) {
    const alive = Object.keys(room.getPeers()).some(linkUp)
    if (!alive && (hadPeers || status.value === 'searching')) connect(code, myName)
  }
})

/** Connection snapshot for debugging and the tests. */
export function debugInfo() {
  const peers = room?.getPeers() ?? {}
  return {
    status: status.value,
    version: roomState.value?.version,
    peers: Object.entries(peers).map(([id, pc]) => ({ id: id.slice(0, 6), conn: (pc as RTCPeerConnection).connectionState, ice: (pc as RTCPeerConnection).iceConnectionState, player: peerToPlayer.get(id)?.slice(0, 6) })),
    known: [...peerToPlayer].map(([p, pid]) => `${p.slice(0, 6)}>${pid.slice(0, 6)} ${Math.round((Date.now() - (lastSeen.get(p) ?? 0)) / 1000)}s`),
    connected: [...connected.value].map((x) => x.slice(0, 6)),
  }
}
