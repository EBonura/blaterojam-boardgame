// The menu in the top right corner (in a room): the rules, the credits, the room code, and the way back to the start screen.
// On the start screen there is no menu, just the rules.
import { useEffect, useState } from 'preact/hooks'
import { roomState, leaveRoom } from '../net/session'
import { rulesOpen } from './Rules'
import { creditsOpen } from './Crediti'
import { play } from './sound'

/** Three bars (like Palermo Drive's menu), drawn on the pixel grid. */
const MenuIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges" aria-hidden="true">
    <path d="M2 3h12v2H2zM2 7h12v2H2zM2 11h12v2H2z" fill="currentColor" />
  </svg>
)
/** An open book. */
const RulesIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges" aria-hidden="true">
    <path d="M1 3h5l2 1 2-1h5v10h-5l-2 1-2-1H1zM2 4v8h4l1 .5V4.5L6 4zM14 4h-4L9 4.5v8l1-.5h4z" fill="currentColor" fill-rule="evenodd" />
  </svg>
)

/** Opens the rules (the start screen's icon). */
export function RulesButton() {
  return (
    <button type="button" class="corner-btn" data-sheet-opener aria-label="Regolamento" title="Regolamento" onClick={() => (rulesOpen.value = true)}>
      <RulesIcon />
    </button>
  )
}

export function Menu() {
  const [open, setOpenState] = useState(false)
  // Opening and closing the menu have their own sounds; closing it to show a page doesn't (the page plays its own).
  const setOpen = (v: boolean, quiet = false) => (quiet || play(v ? 'menu-apri' : 'menu-chiudi'), setOpenState(v))
  const code = roomState.value?.code
  useEffect(() => {
    if (!open) return
    const close = (e: Event) => !(e.target as Element).closest?.('.menu') && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('pointerdown', close)
    addEventListener('keydown', esc)
    return () => (removeEventListener('pointerdown', close), removeEventListener('keydown', esc))
  }, [open])
  return (
    <div class="menu">
      <button type="button" class="corner-btn" aria-label="Menu" aria-expanded={open} title="Menu" onClick={() => setOpen(!open)}>
        <MenuIcon />
      </button>
      {open && (
        <div class="menu-panel parch" role="menu">
          {code && <div class="menu-code">Stanza <b>{code}</b></div>}
          <button type="button" role="menuitem" onClick={() => ((rulesOpen.value = true), setOpen(false, true))}>
            <RulesIcon /> Regolamento
          </button>
          <button type="button" role="menuitem" onClick={() => ((creditsOpen.value = true), setOpen(false, true))}>
            Crediti
          </button>
          <button type="button" role="menuitem" onClick={() => (play('menu-scelta'), setOpen(false, true), leaveRoom())}>
            Torna alla schermata iniziale
          </button>
          {code && <p class="menu-note">Il tuo posto resta: rientri con il codice {code}.</p>}
        </div>
      )}
    </div>
  )
}
