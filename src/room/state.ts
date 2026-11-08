// The shared room state. Every peer holds a full copy; whoever is host applies
// actions and broadcasts the result. Nothing in here knows about networking.
import { newGame, applyMove, MIN_PLAYERS, MAX_PLAYERS, SHEET_BY_ID, SHEETS, type GameState, type Move } from '../game/rules'

/** `cpu` seats are played by whichever device is host (see src/net/cpuDriver.ts). */
export type Player = { id: string; name: string; seat: number; cpu?: boolean }

/** Names for CPU players: a random one of those not already at the table. */
export const CPU_NAMES = ['Turiddu', 'Rosalia', 'Totò', 'Concetta', 'Peppino', 'Ninetta', 'Saro', 'Mimì']

export type RoomState = {
  code: string
  /** Bumped on every applied action. The highest version wins when peers disagree. */
  version: number
  /** 'voting': before the game, the people at the table pick which videogame to make. */
  phase: 'lobby' | 'voting' | 'playing'
  players: Player[]
  /** While voting: each person's picks (up to MAX_VOTES game sheet ids), and who has confirmed. CPUs don't vote. */
  votes?: Record<string, string[]>
  ready?: string[]
  /** How the vote went, shown as the game opens: the top count, and the sheets tied on it (more than one means a draw). */
  chosen?: { sheet: string; votes: number; tied: string[] }
  game: GameState | null
  /** Ids of recently applied actions, so a resent action is never applied twice. */
  recent?: string[]
}

export type Action =
  | { type: 'join'; id: string; name: string }
  /** A player on a new device takes over the seat of someone who is not connected. */
  | { type: 'claimSeat'; id: string; seatOf: string }
  | { type: 'leave'; id: string }
  /** From the lobby to the vote. */
  | { type: 'start'; id: string }
  /** Replaces this person's picks; changing them takes back a confirmation. */
  | { type: 'vote'; id: string; sheets: string[] }
  | { type: 'ready'; id: string }
  /** Host only: once every connected person has confirmed, count the votes and start the game. */
  | { type: 'tally'; id: string }
  /**
   * `at` is the room version the move was worked out from; when set, the move is
   * dropped unless the room is still at that version. CPU moves always set it, so
   * a CPU decision can never land twice or on a later turn.
   */
  | { type: 'move'; id: string; move: Move; at?: number }
  /** Host only, in the lobby. */
  | { type: 'addCpu'; id: string }
  | { type: 'removeCpu'; id: string; cpu: string }
  /** Back to the lobby after a game has ended. */
  | { type: 'restart'; id: string }

/** How many videogames each person may vote for. */
export const MAX_VOTES = 3

export function newRoom(code: string, hostId: string, hostName: string): RoomState {
  return { code, version: 1, phase: 'lobby', players: [{ id: hostId, name: hostName, seat: 0 }], game: null }
}

/** Returns the next state, or null when the action is not allowed. */
export function reduce(s: RoomState, a: Action, connectedNow: Set<string>): RoomState | null {
  const connected = present(s, connectedNow)
  const bump = (patch: Partial<RoomState>): RoomState => ({ ...s, ...patch, version: s.version + 1 })
  const seated = s.players.find((p) => p.id === a.id)

  switch (a.type) {
    case 'join': {
      if (seated) return seated.name === a.name ? null : bump({ players: s.players.map((p) => (p.id === a.id ? { ...p, name: a.name } : p)) })
      if (s.phase !== 'lobby' || s.players.length >= MAX_PLAYERS) return null
      const seat = Math.max(-1, ...s.players.map((p) => p.seat)) + 1
      return bump({ players: [...s.players, { id: a.id, name: a.name, seat }] })
    }
    case 'claimSeat': {
      const target = s.players.find((p) => p.id === a.seatOf)
      if (!target || target.cpu || seated || connected.has(target.id)) return null
      return bump({
        players: s.players.map((p) => (p.id === target.id ? { ...p, id: a.id } : p)),
        game: s.game ? renamePlayer(s.game, target.id, a.id) : null,
        ...(s.votes && { votes: renamePlayer(s.votes, target.id, a.id), ready: renamePlayer(s.ready ?? [], target.id, a.id) }),
      })
    }
    case 'leave': {
      // Leaving only frees a seat in the lobby. Mid-game the seat stays so the player can come back.
      if (!seated || seated.cpu || s.phase !== 'lobby') return null
      return bump({ players: s.players.filter((p) => p.id !== a.id) })
    }
    case 'addCpu': {
      if (s.phase !== 'lobby' || s.players.length >= MAX_PLAYERS || hostOf(s, connectedNow) !== a.id) return null
      const seat = Math.max(-1, ...s.players.map((p) => p.seat)) + 1
      const taken = new Set(s.players.map((p) => p.name))
      const free = CPU_NAMES.filter((n) => !taken.has(n))
      const name = free[Math.floor(Math.random() * free.length)] ?? `CPU ${seat + 1}`
      return bump({ players: [...s.players, { id: `cpu-${s.version}-${seat}`, name, seat, cpu: true }] })
    }
    case 'removeCpu': {
      const cpu = s.players.find((p) => p.id === a.cpu)
      if (s.phase !== 'lobby' || !cpu?.cpu || hostOf(s, connectedNow) !== a.id) return null
      return bump({ players: s.players.filter((p) => p.id !== a.cpu) })
    }
    case 'start': {
      if (s.phase !== 'lobby' || !seated || seated.cpu) return null
      if (s.players.length < MIN_PLAYERS || s.players.length > MAX_PLAYERS) return null
      return bump({ phase: 'voting', votes: {}, ready: [] })
    }
    case 'vote': {
      if (s.phase !== 'voting' || !seated || seated.cpu) return null
      const sheets = [...new Set(a.sheets)]
      if (sheets.length > MAX_VOTES || !sheets.every((id) => SHEET_BY_ID.has(id))) return null
      return bump({ votes: { ...s.votes, [a.id]: sheets }, ready: (s.ready ?? []).filter((id) => id !== a.id) })
    }
    case 'ready': {
      if (s.phase !== 'voting' || !seated || seated.cpu || s.ready?.includes(a.id)) return null
      return bump({ ready: [...(s.ready ?? []), a.id] })
    }
    case 'tally': {
      if (s.phase !== 'voting' || hostOf(s, connectedNow) !== a.id || !voteClosed(s, connectedNow)) return null
      const tied = topVoted(s)
      const sheet = tied[Math.floor(Math.random() * tied.length)]
      const votes = Math.max(0, ...tally(s).values())
      return bump({ phase: 'playing', game: newGame(s.players.map((p) => p.id), undefined, sheet), votes: undefined, ready: undefined, chosen: { sheet, votes, tied } })
    }
    case 'restart': {
      if (s.phase !== 'playing' || !seated || seated.cpu || s.game?.result === 'playing') return null
      return bump({ phase: 'lobby', game: null, votes: undefined, ready: undefined, chosen: undefined })
    }
    case 'move': {
      if (s.phase !== 'playing' || !s.game || !seated) return null
      if (a.at !== undefined && a.at !== s.version) return null
      const game = applyMove(s.game, a.move, a.id, connected)
      return game ? bump({ game }) : null
    }
  }
}

/** The vote is over when every connected person has confirmed. */
export function voteClosed(s: RoomState, connected: Set<string>): boolean {
  const people = s.players.filter((p) => !p.cpu && connected.has(p.id))
  return people.length > 0 && people.every((p) => s.ready?.includes(p.id))
}

/** Votes per game sheet, counting only the people who confirmed. */
export function tally(s: RoomState): Map<string, number> {
  const n = new Map<string, number>()
  for (const [id, picks] of Object.entries(s.votes ?? {})) if (s.ready?.includes(id)) for (const sh of picks) n.set(sh, (n.get(sh) ?? 0) + 1)
  return n
}

/** The most voted game sheets (one is drawn from them); every sheet when nobody picked any. */
export function topVoted(s: RoomState): string[] {
  const n = tally(s)
  const most = Math.max(0, ...n.values())
  return most ? [...n].filter(([, v]) => v === most).map(([id]) => id) : SHEETS.map((x) => x.id)
}

/** The host is the connected human with the lowest seat, so hosting moves on by itself when someone drops. */
export function hostOf(s: RoomState, connected: Set<string>): string | null {
  const live = s.players.filter((p) => !p.cpu && connected.has(p.id)).sort((a, b) => a.seat - b.seat)
  return live[0]?.id ?? null
}

/** Who is at the table right now: the connected devices plus every CPU, which never goes away. */
export function present(s: RoomState, connected: Set<string>): Set<string> {
  const cpus = s.players.filter((p) => p.cpu)
  return cpus.length ? new Set([...connected, ...cpus.map((p) => p.id)]) : connected
}

export const isCpu = (s: RoomState, id: string) => !!s.players.find((p) => p.id === id)?.cpu

function renamePlayer<T>(value: T, from: string, to: string): T {
  // Player ids appear inside game state and votes; swap them over by value.
  return JSON.parse(JSON.stringify(value).replaceAll(JSON.stringify(from), JSON.stringify(to)))
}
