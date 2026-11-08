# BLATERO: regole del gioco

Gioco da tavolo cooperativo di **KUDA Games** sulla realizzazione di un videogioco durante una game jam. Da 4 a 6 giocatori.

Questa è la versione usata dal gioco digitale: le regole del Game Design Document di KUDA Games, più le decisioni prese il 7 novembre 2026 (in fondo).

## Obiettivo

Prima di iniziare si sceglie la **Scheda Videogioco**: ogni giocatore vota fino a 3 videogiochi e si fa il più votato; in caso di pareggio si estrae a sorte tra i più votati (se nessuno vota, tra tutti). Le CPU non votano. La scheda ha quattro valori da raggiungere: Programmazione, Game Design, Grafica, Audio. Il team vince quando tutte e quattro le statistiche sono **esattamente** sui valori della scheda, nello stesso momento. Superare un obiettivo non vale.

## Plancia

Quattro barre, una per statistica, con valori interi da 0 a 20 (una tacca per punto). Si parte da 0.

| Regione | Valori | Effetto |
|---|---|---|
| Memoria libera | 0–15 | Progressione normale |
| Buffer | 16–19 | Finché almeno una barra è nel Buffer, si possono giocare solo carte **Base** |
| Overflow | 20 | La statistica torna subito a 0; i punti in più si perdono |

Le statistiche non scendono mai sotto 0.

## Turno

1. Il giocatore di turno pesca 4 carte dal Mazzo di Gioco. Le carte sono visibili solo a lui.
2. Ne gioca **una** (obbligatorio), rispettando il Buffer.
3. L'effetto si applica nell'ordine fisso Game Design, Programmazione, Grafica, Audio. Un Overflow azzera subito quella statistica e si passa alla successiva.
4. Si controlla la vittoria.
5. Se un aumento ha raggiunto una soglia critica (7 o 13) partendo da sotto, si rivela **un** Imprevisto.
6. La carta giocata va negli scarti; le altre tornano nel mazzo, che si rimescola. Quando il mazzo finisce, si rimescolano gli scarti.

Il primo giocatore è scelto a caso.

**Tempo:** ogni giocatore ha 48 secondi per mossa. Se il tempo scade, si gioca per lui una carta a caso tra quelle che può giocare (con scelte a caso, se la carta ne chiede); se non ne può giocare nessuna, passa. Il conto parte dopo che il tavolo ha visto l'ultima carta o l'ultimo Imprevisto. Le CPU non hanno tempo.

## Imprevisti

- Si attivano solo con gli **aumenti** che raggiungono una soglia (7 o 13) da sotto. Le diminuzioni non li attivano.
- Al massimo **un** Imprevisto per turno, anche se si attraversano più soglie o più statistiche.
- Una soglia si può riattivare: se la statistica scende sotto e poi la raggiunge di nuovo.
- Gli effetti degli Imprevisti non attivano altri Imprevisti.
- La vittoria si controlla **prima** dell'Imprevisto: se la carta completa il gioco, l'Imprevisto non si rivela.
- Se l'effetto di un Imprevisto porta tutte le statistiche sugli obiettivi, è vittoria (colpo di fortuna).

## Fine partita

- **Vittoria:** tutte e quattro le statistiche sono esattamente sui valori della scheda.
- **Sconfitta:** 3 statistiche diverse sono andate in Overflow durante la partita (anche in turni diversi; la stessa statistica conta una volta).
- **Sconfitta:** le mosse sono finite. La squadra ha un numero fisso di mosse (turni, contando tutti i giocatori) per completare il gioco: la scadenza della jam.

## Decisioni prese il 7 novembre 2026

- Giocatori: da 4 a 6. Barre a 0 all'inizio, primo giocatore a caso.
- Sconfitta: 3 statistiche diverse in Overflow nel corso della partita.
- Nel Buffer senza carte Base in mano: una ripescata automatica; se ancora niente, il turno passa.
- Da confermare (aggiunta nel gioco digitale): se al momento della ripescata nel mazzo non c'è più nessuna carta Base, prima si rimescolano gli scarti nel mazzo. Le carte in mano tornano sempre nel mazzo, quindi il mazzo non finisce quasi mai: senza questa regola, una volta giocate tutte le carte Base il tavolo resterebbe bloccato nel Buffer per sempre.
- Blackout: se la carta pescata alla cieca non si può giocare (Buffer), non ha effetto e va negli scarti. Se la carta chiede una scelta, la scelta è casuale.
- BLATERO (Jolly): valore da 0 a 15, e non attiva mai un Imprevisto.
- Vittoria anche dopo l'effetto di un Imprevisto.
- Crash improvviso: la plancia torna com'era prima dell'ultima carta giocata, Overflow compresi.
- Minimo 0, nessun underflow.
- Le carte in mano sono visibili solo al giocatore di turno.
- Tempo per mossa: 48 secondi, poi una carta giocabile a caso (aggiunta nel gioco digitale).
- Soglie degli Imprevisti: solo 7 e 13 (l'11 è stato tolto).
- Limite di mosse: la partita è persa quando finiscono le mosse.
- Imprevisti per statistica: Patch su patch porta Programmazione a 0; Troppi poligoni -10 Grafica; Solo un ritocco -7 Game Design; Audio clipping -5 Audio (prima tutti a 0).
- Nessuna carta cambia tutte e 4 le statistiche in modi diversi (8 novembre); +1 o -1 in ogni statistica va bene (Brainstorming, Refactoring). Spaghetti code, l'unica che lo faceva, non toglie più 1 Audio. Tre carte speciali nuove, una copia ciascuna (il mazzo passa a 63): Refactoring, Taglio di scope, Ottimizzazione.
- Ordine delle statistiche sulla plancia e sulla scheda: Programmazione, Game Design, Grafica, Audio (come nello schizzo della plancia). L'ordine di risoluzione resta Game Design, Programmazione, Grafica, Audio.

## Mazzo di Gioco (63 carte)

| Carta | Copie | Cornice | Livello | Effetto |
|---|---|---|---|---|
| Game Designer | 2 | Verde | Base | +3 Game Design |
| Programmatore | 2 | Verde | Base | +3 Programmazione |
| Grafico | 2 | Verde | Base | +3 Grafica |
| Compositore | 2 | Verde | Base | +3 Audio |
| Lore drop | 2 | Verde | Base | +2 Game Design |
| Diagramma di flusso | 2 | Verde | Base | +1 Game Design |
| Autocompletamento | 2 | Verde | Base | +2 Programmazione |
| Editor di codice | 2 | Verde | Base | +1 Programmazione |
| Pixel art | 2 | Verde | Base | +2 Grafica |
| Tavoletta grafica | 2 | Verde | Base | +1 Grafica |
| Audio stereo | 2 | Verde | Base | +2 Audio |
| Audio mono | 2 | Verde | Base | +1 Audio |
| Energy drink | 3 | Verde | Base | +2 in una statistica a scelta |
| Caffè | 5 | Verde | Base | +1 in una statistica a scelta |
| Compressione file .zip | 6 | Rosso | Base | -1 in una statistica a scelta |
| Compressione file .rar | 4 | Rosso | Base | -2 in una statistica a scelta |
| 60 FPS | 1 | Giallo | Speciale | +3 Programmazione, +1 Game Design, -2 Grafica |
| Generatore SFX | 1 | Giallo | Speciale | +3 Audio, -1 Grafica |
| Modello low-poly | 1 | Giallo | Speciale | +3 Grafica, +1 Audio, -2 Game Design |
| Engine 2D | 1 | Giallo | Speciale | +2 Programmazione, +1 Game Design, -1 Grafica |
| Grafica Placeholder | 1 | Giallo | Speciale | +3 Game Design, +1 Programmazione, -2 Grafica |
| Brainstorming | 5 | Giallo | Speciale | +1 in ogni statistica |
| Sprite 3D | 1 | Giallo | Speciale | +2 Grafica, -1 Game Design |
| Refactoring | 1 | Giallo | Speciale | -1 in ogni statistica |
| Taglio di scope | 1 | Giallo | Speciale | -2 Game Design, -1 Programmazione |
| Ottimizzazione | 1 | Giallo | Speciale | -1 Grafica, -1 Audio |
| BLATERO | 3 | Arcobaleno | Jolly | Porta una statistica a un valore a scelta (da 0 a 15) |
| PICO-8 | 1 | Argento | Mentor | +3 in una statistica a scelta |
| Spaghetti code | 1 | Argento | Mentor | +6 Programmazione, -1 Game Design, -1 Grafica |
| Animazione frame-by-frame | 1 | Argento | Mentor | +4 Grafica, +1 Game Design, -2 Programmazione |
| Grayboxing | 1 | Argento | Mentor | +4 Game Design, +2 Programmazione, -2 Grafica |

## Mazzo Imprevisti (15 carte, cornice bianca)

| Carta | Effetto |
|---|---|
| Troppi poligoni! | -10 Grafica |
| Audio clipping | -5 Audio |
| Patch su patch | Programmazione torna a 0 |
| Solo un ritocco | -7 Game Design |
| Blackout | Il giocatore successivo gioca una carta a caso senza vederla |
| Cambio idea | -5 Game Design, -3 Grafica |
| Build corrotta | -4 in tutte le statistiche |
| Memoria insufficiente | Il giocatore successivo pesca solo due carte |
| Merge conflict | -6 Programmazione |
| Notte in bianco | Il giocatore successivo salta il turno |
| Tempo quasi scaduto | Il giocatore successivo deve giocare 2 carte |
| Crash improvviso | Annulla l’effetto dell’ultima carta giocata |
| Divergenze creative | Scambia i valori di Game Design e Programmazione |
| Cambio di postazione | Scambia i valori di Grafica e Audio |
| Brainstorming infinito | Tutte le statistiche vanno a 16 |

## Schede Videogioco

| Videogioco | Programmazione | Game Design | Grafica | Audio | Totale | Difficoltà |
|---|---|---|---|---|---|---|
| Arcade Retrò | 8 | 6 | 5 | 5 | 24 | Facile |
| Quiz Game | 4 | 10 | 6 | 7 | 27 | Facile |
| Visual Novel | 4 | 11 | 10 | 7 | 32 | Medio |
| Puzzle Game | 11 | 12 | 7 | 4 | 34 | Medio |
| Roguelike | 12 | 11 | 8 | 6 | 37 | Medio |
| Platform 2D | 11 | 14 | 11 | 6 | 42 | Difficile |
| Gestionale | 13 | 13 | 9 | 6 | 41 | Difficile |
| Rhythm Game | 10 | 9 | 10 | 14 | 43 | Difficile |
| Racing Game | 12 | 9 | 11 | 10 | 42 | Difficile |
| Monster Collector | 13 | 14 | 12 | 8 | 47 | Molto difficile |
| Tower Defense | 13 | 13 | 12 | 9 | 47 | Molto difficile |
| FPS Multiplayer | 15 | 13 | 12 | 11 | 51 | Molto difficile |
| Survival Horror 3D | 13 | 12 | 14 | 15 | 54 | Molto difficile |
| MMORPG | 15 | 14 | 13 | 12 | 54 | Estremo |
| Open World RPG | 15 | 14 | 15 | 14 | 58 | Estremo |
