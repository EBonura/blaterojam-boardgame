// Who made what: the game, the digital version, the sounds (each with its licence) and the font.
import { signal } from '@preact/signals'
import { Sheet } from './Sheet'

export const creditsOpen = signal(false)

const A = ({ href, children }: { href: string; children: string }) => (
  <a href={href} target="_blank" rel="noopener">{children}</a>
)

/** The sounds in public/sfx, by author: source page and licence. */
const SOUNDS: { who: string; what: string; url: string; licence: string }[] = [
  { who: 'Kenney', what: 'Casino Audio, Interface Sounds, Digital Audio', url: 'https://opengameart.org/content/54-casino-sound-effects-cards-dice-chips', licence: 'CC0' },
  { who: 'HaelDB', what: 'Card Game sounds', url: 'https://opengameart.org/content/card-game-sounds', licence: 'CC0' },
  { who: 'Robin Lamb', what: 'UI Sound Effects', url: 'https://opengameart.org/content/ui-sound-effects-button-clicks-user-feedback-notifications', licence: 'CC0' },
  { who: 'qubodup', what: '6 user interface ding clicks', url: 'https://opengameart.org/content/6-user-interface-ding-clicks', licence: 'CC0' },
  { who: 'wobbleboxx', what: 'Level up, power up, Coin get', url: 'https://opengameart.org/content/level-up-power-up-coin-get-13-sounds', licence: 'CC0' },
  { who: 'bart', what: 'Ticking Clock', url: 'https://opengameart.org/content/ticking-clock', licence: 'CC0' },
  { who: 'Fupi', what: 'Win Jingle', url: 'https://opengameart.org/content/win-jingle', licence: 'CC0' },
  { who: 'Oiboo', what: 'Game Over - Bad chest SFX', url: 'https://opengameart.org/content/game-over-bad-chest-sfx', licence: 'CC0' },
  { who: 'ViRiX', what: 'UI Failed or Error', url: 'https://opengameart.org/content/ui-failed-or-error', licence: 'CC BY 3.0' },
]

export function Crediti() {
  return (
    <Sheet open={creditsOpen} title="Crediti">
      <h3 class="px">Gioco da tavolo</h3>
      <p>
        Ideato da <b>KUDA Games</b>: <A href="https://kudagames.com/">kudagames.com</A> · <A href="https://www.instagram.com/kuda.games/">Instagram @kuda.games</A>
      </p>
      <h3 class="px">Versione digitale</h3>
      <p>
        <b>Bonnie Studios</b>, per la <A href="https://www.blaterostudio.com/gamejam/">Blatero Game Jam</A>, Taranto 2026.
        Codice: <A href="https://github.com/EBonura/blaterojam-boardgame">github.com/EBonura/blaterojam-boardgame</A>
      </p>
      <h3 class="px">Suoni</h3>
      <p>Da OpenGameArt.</p>
      <ul class="rules-rows">
        {SOUNDS.map((s) => (
          <li>
            <b>{s.who}</b>: <A href={s.url}>{s.what}</A>
            <small>Licenza {s.licence}</small>
          </li>
        ))}
      </ul>
      <h3 class="px">Carattere</h3>
      <p>
        Silkscreen, di The Silkscreen Project Authors, licenza SIL Open Font License 1.1.
      </p>
    </Sheet>
  )
}
