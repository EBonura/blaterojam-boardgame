// All UI text. The game is in Italian only.
const strings = {
  title: 'BLATERO, il gioco da tavolo della Blatero Game Jam',
  subtitle: 'Il gioco da tavolo della game jam',
  byStudios: 'Un gioco KUDA Games & Bonnie Studios',
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
  addCpu: 'Aggiungi CPU',
  removeCpu: 'Togli {name}',
  cpu: 'CPU',
  cpuThinking: '{name} ci sta pensando…',
  roomFull: 'La stanza è piena o la partita è già iniziata.',
  voteTitle: 'Che gioco facciamo?',
  voteHint: 'Scegli fino a {n} videogiochi. Si fa il più votato; in caso di pareggio decide la sorte.',
  voteConfirm: 'Conferma ({n}/{max})',
  voteAny: 'Per me va bene tutto',
  voteChange: 'Cambia la scelta',
  voteWaiting: 'Mancano: {names}',
  votes: '{n} voti',
  turn: 'Turno {n}',
  endTurn: 'Fine turno',
}

/** UI string; `{name}` placeholders are filled from `vars`. */
export function t(key: keyof typeof strings, vars?: Record<string, string | number>): string {
  let s = strings[key]
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}
