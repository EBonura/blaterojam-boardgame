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
import { joinRoom, getRelaySockets, type Room } from 'trystero'
import { signal, computed } from '@preact/signals'
import { reduce, hostOf, newRoom, type Action, type RoomState } from '../room/state'
import { diff, patch, fingerprint, type Patch } from './patch'
import { load, save, deviceId } from '../storage'

const APP_ID = 'blaterojam-boardgame-taranto-2026-v1'

// Phones find each other through Nostr relays: these five were measured as reliable
// for Palermo Drive (palermo-drive/src/p2p/relays.js), measured as reliable for Palermo Drive (palermo-drive/src/p2p/relays.js),
// instead of Trystero picking from 29 volunteer relays, some of which rate-limit or go quiet.
const NOSTR_RELAYS = ['nos.lol', 'nostr.chaima.info', 'nostr.christiansass.de', 'relay.grigic.org', 'relay.bitmacro.cloud'].map((h) => 'wss://' + h)

// Optional TURN relay, for networks where phones can't connect directly (mobile
// data, Wi-Fi that isolates devices). Set at build time, e.g. from a free
// Metered.ca app: VITE_TURN_URLS (comma separated), VITE_TURN_USER, VITE_TURN_PASS.
const env = import.meta.env
// All three must be set: a TURN entry with an empty username or password makes the browser refuse every connection.
const TURN = env.VITE_TURN_URLS && env.VITE_TURN_USER && env.VITE_TURN_PASS
  ? [{ urls: String(env.VITE_TURN_URLS).split(','), username: env.VITE_TURN_USER, credential: env.VITE_TURN_PASS }]
  : undefined
export const hasTurn = !!TURN

/** What the connection is doing, shown on screen so a stuck join can be diagnosed. */
export const netInfo = signal({ relays: 0, relaysTotal: 0, peers: 0, error: '' })

const HEARTBEAT_MS = 4000
const STALE_MS = 13000

/** `p`: the protocol this device speaks. 2 sends patches instead of whole room states; a device without it gets whole states. */
/** `ask`: reply with your hello. `full`: send me your whole confirmed state (my copy doesn't match yours). */
type Hello = { id: string; name: string; version: number; p?: number; ask?: boolean; full?: boolean }
type Envelope = { nonce: string; action: Action }
/** What changed from room version `from` to `to` (see ./patch). */
/** `f`: fingerprint of the state it was made from, so a patch is never applied to a copy that only shares its version number. */
type StatePatch = { from: number; to: number; f: string; p: Patch | null }
const PROTO = 2
const RETRIES = 4
/** Actions remembered in the room state, so a resent one is never applied twice. */
const RECENT = 32
/** A move shown before the host confirms it is taken back if no confirmation comes in this time. */
const PREDICTION_MS = 4000

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
let sendPatch: (p: StatePatch) => void = () => {}
let sendAct: (e: Envelope) => void = () => {}
let sendPresence: () => void = () => {}
/** The last room state the host made (ours, when we are host). `roomState` can run ahead of it with a predicted move. */
let confirmed: RoomState | null = null
let predictionTimer: ReturnType<typeof setTimeout> | undefined
/** Protocol each peer speaks (from its hello). */
const peerProto = new Map<string, number>()
let lastPresence = ''
/** The peer we asked for its whole state because our copy didn't match its patch: its answer is taken even at our version. */
let resyncFrom: string | null = null
let beats = 0
/** Actions sent but not yet seen in the host's state; resent on every heartbeat. */
const pending = new Map<string, { env: Envelope; tries: number }>()

/** Player id for this device in this room. */
function playerIdFor(roomCode: string): string {
  const key = `player:${roomCode}`
  let id = load<string>(key)
  if (!id) {
    id = deviceId()
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
  if (saved && saved.code === c) roomState.value = confirmed = saved
  connect(c, name)
}

export function leaveRoom() {
  if (myId.value) dispatch({ type: 'leave', id: myId.value })
  teardown()
  roomState.value = confirmed = null
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
  const env = { nonce: nonce(), action: a }
  if (amHost.value) apply(env)
  else {
    pending.set(env.nonce, { env, tries: 0 })
    sendAct(env)
    predict(env)
  }
}

/** A short random id for an action (nine base-36 characters). */
function nonce(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(9)), (b) => (b % 36).toString(36)).join('')
}

/**
 * Show a move before the host confirms it: a play, a pass or a vote gives the same result on every
 * device (the game's randomness is seeded in its state), so the device that made it, and every device
 * that hears it, applies it straight away instead of waiting for the host's round trip. The host's
 * state always wins: it replaces the prediction when it comes, and a prediction it never confirms is
 * taken back.
 */
function predict({ nonce: n, action: a }: Envelope) {
  const s = roomState.value
  if (!s || amHost.value || s.recent?.includes(n)) return
  const ok = (a.type === 'move' && a.at === undefined && (a.move.type === 'play' || a.move.type === 'pass')) || a.type === 'vote' || a.type === 'ready'
  if (!ok) return
  const next = reduce(s, a, connected.value)
  if (!next) return
  next.recent = [...(s.recent ?? []), n].slice(-RECENT)
  roomState.value = next
  clearTimeout(predictionTimer)
  predictionTimer = setTimeout(() => confirmed && roomState.value !== confirmed && (roomState.value = confirmed), PREDICTION_MS)
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
  left.then(() => {
    if (seq === joinSeq) openRoom(c)
  })
}

function openRoom(c: string) {
  const config = {
    appId: APP_ID,
    password: `blatero-${c}`,
    relayConfig: { urls: NOSTR_RELAYS },
    ...(TURN ? { turnConfig: TURN } : {}),
  }
  room = joinRoom(config, `room-${c}`, {
    // Peers found each other but WebRTC could not link them: usually a network that needs TURN.
    onJoinError: (d: { error?: unknown }) => (netInfo.value = { ...netInfo.value, error: String(d.error ?? 'errore') }),
  }) as Room
  const diag = () => {
    watchdog()
    const socks = Object.values((getRelaySockets() ?? {}) as Record<string, { readyState?: number; connected?: boolean }>)
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
  // A patch is JSON like the rest; its values are typed loosely (see ./patch), so tell Trystero's types.
  const delta = room.makeAction<{ from: number; to: number; p: never }>('patch') as unknown as {
    send: (d: StatePatch) => Promise<void[]>
    onMessage: (d: StatePatch, m: { peerId: string }) => void
  }
  const act = room.makeAction<Envelope>('act')
  const ping = room.makeAction<number>('ping')
  const presence = room.makeAction<string[]>('presence')
  sendPresence = () => presence.send([...connected.value])
  presence.onMessage = (ids, { peerId }) => {
    heard(peerId)
    const s = roomState.value
    if (s && hostOf(s, connected.value) === peerToPlayer.get(peerId)) hostPresence.value = new Set(ids)
  }

  sendHello = (h, target) => hello.send(h, target ? { target } : undefined)
  sendState = (s, target) => state.send(s, target ? { target } : undefined)
  sendPatch = (p) => delta.send(p)
  sendAct = (e) => act.send(e)

  room.onPeerJoin = (peerId) => {
    lastSeen.set(peerId, Date.now())
    hadPeers = true
    netInfo.value = { ...netInfo.value, error: '' }
    sendHello(myHello(), peerId)
    // Only what the host confirmed: a move this device is still predicting must not become a newcomer's starting point.
    if (confirmed) sendState(confirmed, peerId)
  }
  room.onPeerLeave = (peerId) => {
    peerToPlayer.delete(peerId)
    peerProto.delete(peerId)
    lastSeen.delete(peerId)
    refreshConnected()
  }
  hello.onMessage = (h, { peerId }) => {
    lastSeen.set(peerId, Date.now())
    if (h.ask) sendHello(myHello(), peerId)
    if (h.full && confirmed) sendState(confirmed, peerId)
    peerToPlayer.set(peerId, h.id)
    peerProto.set(peerId, h.p ?? 1)
    refreshConnected()
    ensureSeated()
    // They are behind: bring them up to date.
    if (confirmed && confirmed.version > h.version) sendState(confirmed, peerId)
  }
  state.onMessage = (s, { peerId }) => {
    heard(peerId)
    if (s.code !== code) return
    const asked = peerId === resyncFrom && !!confirmed && s.version >= confirmed.version
    if (!confirmed || s.version > confirmed.version || asked) {
      if (asked) resyncFrom = null
      adopt(s)
      status.value = 'online'
      ensureSeated()
    }
  }
  delta.onMessage = (d, { peerId }) => {
    heard(peerId)
    if (!confirmed || d.to <= confirmed.version) return
    // Only on top of the exact state it was made from; otherwise ask that peer for its whole state.
    if (d.from !== confirmed.version || d.f !== fingerprint(confirmed)) return (resyncFrom = peerId), sendHello({ ...myHello(), full: true }, peerId)
    adopt(patch(confirmed, d.p))
    status.value = 'online'
    ensureSeated()
  }
  act.onMessage = (env, { peerId }) => {
    heard(peerId)
    if (amHost.value) apply(env)
    else predict(env)
  }
  ping.onMessage = (_, { peerId }) => heard(peerId)

  heartbeat = setInterval(() => {
    ping.send(0)
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
      // Who's connected, when it changes (and every third beat, for anyone who missed it).
      const now = [...connected.value].sort().join()
      if (now !== lastPresence || ++beats % 3 === 0) (sendPresence(), (lastPresence = now))
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
  peerProto.clear()
  lastSeen.clear()
  pending.clear()
  lastPresence = ''
  hostPresence.value = null
  return left
}

/**
 * Any message from a peer means it's here. A peer we can't place (its hello was lost while the link
 * was opening) gets ours, with a request for its own, so both sides know who is who.
 */
function heard(peerId: string) {
  lastSeen.set(peerId, Date.now())
  if (!peerToPlayer.has(peerId)) sendHello({ ...myHello(), ask: true }, peerId)
}

function myHello(): Hello {
  return { id: myId.value, name: myName, version: confirmed?.version ?? 0, p: PROTO }
}

/** Ask to be seated if we aren't yet (or update our name). */
function ensureSeated() {
  const s = roomState.value
  if (!s) return
  const me = s.players.find((p) => p.id === myId.value)
  if (me ? me.name !== myName : s.phase === 'lobby') dispatch({ type: 'join', id: myId.value, name: myName })
}

function apply({ nonce, action }: Envelope) {
  // The host never predicts, so what it shows is its confirmed state (the scene-setting test scripts change what it shows).
  const s = roomState.value
  if (!s || s.recent?.includes(nonce)) return
  const next = reduce(s, action, connected.value)
  if (!next) return
  next.recent = [...(s.recent ?? []), nonce].slice(-RECENT)
  adopt(next)
  // Everyone gets what changed; a device on the old protocol gets the whole state.
  sendPatch({ from: s.version, to: next.version, f: fingerprint(s), p: diff(s, next) })
  for (const [peer, p] of peerProto) if (p < 2) sendState(next, peer)
}

/** Take a state from the host (or made as host): it replaces any predicted move. */
function adopt(s: RoomState) {
  confirmed = s
  clearTimeout(predictionTimer)
  roomState.value = s
  for (const n of s.recent ?? []) pending.delete(n)
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
