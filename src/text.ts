// All UI text. The game is in Italian only.
const strings = {
  title: 'Blatero Game Jam: il gioco da tavolo',
  byKuda: 'Un gioco di KUDA Games',
  yourName: 'Il tuo nome',
  createRoom: 'Crea una stanza',
  joinRoom: 'Entra',
  roomCode: 'Codice stanza',
  shareCode: 'Condividi questo codice con gli altri giocatori',
  connecting: 'Connessione in corso…',
  players: 'Giocatori',
  you: 'tu',
  host: 'host',
  offline: 'disconnesso',
  start: 'Inizia la partita',
  needPlayers: 'Servono da {min} a {max} giocatori',
  waitingHost: 'In attesa che l’host inizi…',
  leave: 'Esci',
  takeSeat: 'Prendi il posto di {name}',
  roomFull: 'La stanza è piena o la partita è già iniziata.',
  turn: 'Turno {n}',
  endTurn: 'Fine turno',
}

/** UI string; `{name}` placeholders are filled from `vars`. */
export function t(key: keyof typeof strings, vars?: Record<string, string | number>): string {
  let s = strings[key]
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}
