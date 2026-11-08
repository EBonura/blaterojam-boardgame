// An overlay page over the start screen or the game (the rules, the credits): a title, a close button,
// a scrolling body. Closes with the X, a tap outside it, or Escape.
import { useEffect, useRef } from 'preact/hooks'
import { play } from './sound'
import type { Signal } from '@preact/signals'
import type { ComponentChildren } from 'preact'

export function Sheet({ open, title, children }: { open: Signal<boolean>; title: string; children: ComponentChildren }) {
  const shown = open.value
  // Its own sound when it opens and when it closes (however it closes).
  const was = useRef(shown)
  useEffect(() => {
    if (shown !== was.current) play(shown ? 'menu-apri' : 'menu-chiudi')
    was.current = shown
  }, [shown])
  useEffect(() => {
    if (!shown) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && (open.value = false)
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [shown])
  if (!shown) return null
  return (
    <div class="rules" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.target === e.currentTarget && (open.value = false)}>
      <div class="rules-sheet parch">
        <header>
          <h2 class="px">{title}</h2>
          <button type="button" class="rules-close" aria-label={`Chiudi: ${title}`} onClick={() => (open.value = false)}>
            X
          </button>
        </header>
        <div class="rules-body">{children}</div>
      </div>
    </div>
  )
}
