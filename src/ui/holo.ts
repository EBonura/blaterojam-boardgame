// Holographic Mentor cards and the home-screen card: the shine follows the finger or mouse, and the card tilts.
let held: HTMLElement | null = null

function release() {
  if (!held) return
  held.classList.remove('held')
  for (const v of ['--mx', '--my', '--rx', '--ry']) held.style.removeProperty(v)
  held = null
}

export function startHolo() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  document.addEventListener('pointermove', (e) => {
    const el = (e.target as HTMLElement | null)?.closest?.('.card.f-argento, .tilt') as HTMLElement | null
    if (el !== held) release()
    if (!el) return
    held = el
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.classList.add('held')
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    const k = el.classList.contains('tilt') ? 36 : 16
    el.style.setProperty('--rx', `${(x - 0.5) * k}`)
    el.style.setProperty('--ry', `${(y - 0.5) * k}`)
  })
  document.addEventListener('pointerleave', release)
  document.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && release())
  document.addEventListener('pointercancel', release)
}
