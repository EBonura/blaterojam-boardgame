// UI strings. Card and rules text live with the card data as { it, en }.
export const strings = {
  title: { it: 'Blatero Game Jam: il gioco da tavolo', en: 'Blatero Game Jam: The Board Game' },
  byKuda: { it: 'Un gioco di KUDA Games', en: 'A game by KUDA Games' },
  yourName: { it: 'Il tuo nome', en: 'Your name' },
  createRoom: { it: 'Crea una stanza', en: 'Create a room' },
  joinRoom: { it: 'Entra', en: 'Join' },
  roomCode: { it: 'Codice stanza', en: 'Room code' },
  shareCode: { it: 'Condividi questo codice con gli altri giocatori', en: 'Share this code with the other players' },
  connecting: { it: 'Connessione in corso…', en: 'Connecting…' },
  searchingRoom: { it: 'Cerco la stanza {code}…', en: 'Looking for room {code}…' },
  players: { it: 'Giocatori', en: 'Players' },
  you: { it: 'tu', en: 'you' },
  host: { it: 'host', en: 'host' },
  offline: { it: 'disconnesso', en: 'disconnected' },
  start: { it: 'Inizia la partita', en: 'Start the game' },
  needPlayers: { it: 'Servono da {min} a {max} giocatori', en: 'You need {min} to {max} players' },
  waitingHost: { it: 'In attesa che l’host inizi…', en: 'Waiting for the host to start…' },
  leave: { it: 'Esci', en: 'Leave' },
  takeSeat: { it: 'Prendi il posto di {name}', en: 'Take {name}’s seat' },
  roomFull: { it: 'La stanza è piena o la partita è già iniziata.', en: 'The room is full or the game has already started.' },
  reconnecting: { it: 'Riconnessione…', en: 'Reconnecting…' },
  credits: { it: 'Crediti', en: 'Credits' },
} as const

export type StringKey = keyof typeof strings
