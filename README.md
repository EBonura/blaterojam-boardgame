# Blatero Game Jam: The Board Game

A cooperative board game about making a game at a game jam, for 4 to 6 players. Rules and the full card list: [docs/regole.md](docs/regole.md).

**Game design: [KUDA Games](#credits).** Digital version made at the Taranto game jam (theme: *anello*).

Playable on itch.io, mobile first, in Italian.

## How online play works

There's no game server. Players meet through public signaling relays (Nostr, via [Trystero](https://github.com/dmotz/trystero)) and then talk directly over WebRTC.

- Every device keeps a full copy of the game and saves it locally.
- The host is whoever is connected with the lowest seat. If the host's phone locks, the next player takes over.
- Typing the same room code again on the same device puts you back in your seat. On a different device you can take over the seat of a player who isn't connected.
- `?net=mqtt` switches signaling to public MQTT brokers, in case the Nostr relays misbehave.

## Develop

```bash
npm install
npm run dev
npm run test:rooms   # 3 simulated phones over the real relays: join, start, host drop, rejoin, seat takeover
npm run build        # builds dist/
npm run zip          # release/blatero-itch.zip, ready to upload to itch.io
node tools/test-zip.mjs  # serves the zip from a nested path like itch.io and runs the room test on it
butler push release/blatero-itch.zip bonnie-studios/blatero:html5   # publish to https://bonnie-studios.itch.io/blatero
```

The rules live in `src/game/rules.ts` as a pure `(state, move) => state` function, tested in `src/game/rules.test.ts` (`npm test`). Card data is `src/cards/cards.json`; card art is pixel art written as code in `tools/cards/art/` (see `tools/cards/ART-BRIEF.md`), and `npm run cards` builds the game art and print-ready SVGs (63x88 mm with 3 mm bleed) into `print/`. Room and network code are in `src/room` and `src/net`.

## Credits

- Game design, rules and cards: KUDA Games
- Digital version: Emanuele Bonura
