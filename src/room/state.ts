// The shared room state. Every peer holds a full copy; whoever is host applies
// actions and broadcasts the result. Nothing in here knows about networking.
import { newGame, applyMove, MIN_PLAYERS, MAX_PLAYERS, type GameState, type Move } from '../game/rules'

export type Player = { id: string; name: string; seat: number }

export type RoomState = {
  code: string
  /** Bumped on every applied action. The highest version wins when peers disagree. */
  version: number
  phase: 'lobby' | 'playing'
  players: Player[]
  game: GameState | null
  /** Ids of recently applied actions, so a resent action is never applied twice. */
  recent?: string[]
}

export type Action =
  | { type: 'join'; id: string; name: string }
  /** A player on a new device takes over the seat of someone who is not connected. */
  | { type: 'claimSeat'; id: string; seatOf: string }
  | { type: 'leave'; id: string }
  | { type: 'start'; id: string }
  | { type: 'move'; id: string; move: Move }
  /** Back to the lobby after a game has ended. */
  | { type: 'restart'; id: string }

export function newRoom(code: string, hostId: string, hostName: string): RoomState {
  return { code, version: 1, phase: 'lobby', players: [{ id: hostId, name: hostName, seat: 0 }], game: null }
}

/** Returns the next state, or null when the action is not allowed. */
export function reduce(s: RoomState, a: Action, connected: Set<string>): RoomState | null {
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
      if (!target || seated || connected.has(target.id)) return null
      return bump({
        players: s.players.map((p) => (p.id === target.id ? { ...p, id: a.id } : p)),
        game: s.game ? renamePlayer(s.game, target.id, a.id) : null,
      })
    }
    case 'leave': {
      // Leaving only frees a seat in the lobby. Mid-game the seat stays so the player can come back.
      if (!seated || s.phase !== 'lobby') return null
      return bump({ players: s.players.filter((p) => p.id !== a.id) })
    }
    case 'start': {
      if (s.phase !== 'lobby' || !seated) return null
      if (s.players.length < MIN_PLAYERS || s.players.length > MAX_PLAYERS) return null
      return bump({ phase: 'playing', game: newGame(s.players.map((p) => p.id)) })
    }
    case 'restart': {
      if (s.phase !== 'playing' || !seated || s.game?.result === 'playing') return null
      return bump({ phase: 'lobby', game: null })
    }
    case 'move': {
      if (s.phase !== 'playing' || !s.game || !seated) return null
      const game = applyMove(s.game, a.move, a.id, connected)
      return game ? bump({ game }) : null
    }
  }
}

/** The host is the connected player with the lowest seat, so hosting moves on by itself when someone drops. */
export function hostOf(s: RoomState, connected: Set<string>): string | null {
  const live = s.players.filter((p) => connected.has(p.id)).sort((a, b) => a.seat - b.seat)
  return live[0]?.id ?? null
}

function renamePlayer(game: GameState, from: string, to: string): GameState {
  // Player ids appear inside game state; swap them over by value.
  return JSON.parse(JSON.stringify(game).replaceAll(JSON.stringify(from), JSON.stringify(to)))
}
