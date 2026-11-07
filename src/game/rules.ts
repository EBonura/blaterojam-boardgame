// Game rules. PLACEHOLDER until KUDA's handwritten rules are transcribed:
// a shared turn counter so the room and network layers can be tested end to end.
export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 6

export type GameState = {
  order: string[]
  turn: number
  log: { by: string; text: string }[]
}

export type Move = { type: 'endTurn' }

export function newGame(playerIds: string[]): GameState {
  return { order: [...playerIds], turn: 0, log: [] }
}

export function currentPlayer(g: GameState): string {
  return g.order[g.turn % g.order.length]
}

/** Returns the next game state, or null if the move is not legal. */
export function applyMove(g: GameState, m: Move, by: string): GameState | null {
  if (by !== currentPlayer(g)) return null
  switch (m.type) {
    case 'endTurn':
      return { ...g, turn: g.turn + 1, log: [...g.log, { by, text: 'endTurn' }] }
  }
}
