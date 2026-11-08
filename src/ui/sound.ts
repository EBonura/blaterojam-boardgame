// Sound effects (public/sfx). Phones only allow sound after the first tap, so the sounds load and the
// audio starts on the first touch; before that, play() does nothing. Muting is remembered on this device.
import { signal } from '@preact/signals'
import { load, save } from '../storage'

export type Sound =
  | 'tocco' | 'scegli-carta' | 'tocca-a-te' | 'voto-scelta' | 'voto-annuncio'
  | 'gioca-carta' | 'barra-sale' | 'carta-coperta' | 'carta-scartata'
  | 'allarme-soglia' | 'rottura' | 'imprevisto' | 'overflow'
  | 'tempo-scade' | 'mosse-finite' | 'vittoria' | 'sconfitta'
  | 'menu-apri' | 'menu-chiudi' | 'menu-scelta'

const ALL: Sound[] = ['tocco', 'scegli-carta', 'tocca-a-te', 'voto-scelta', 'voto-annuncio', 'gioca-carta', 'barra-sale', 'carta-coperta',
  'carta-scartata', 'allarme-soglia', 'rottura', 'imprevisto', 'overflow', 'tempo-scade', 'mosse-finite', 'vittoria', 'sconfitta',
  'menu-apri', 'menu-chiudi', 'menu-scelta']

export const muted = signal(load<boolean>('muted') ?? false)
export function toggleMute() {
  muted.value = !muted.value
  save('muted', muted.value)
  if (!muted.value) start()
}

let ctx: AudioContext | null = null
let out: GainNode | null = null
const buffers = new Map<Sound, AudioBuffer>()

/** Create the audio and load the sounds (once), inside a tap. */
function start() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx = new AC()
    out = ctx.createGain()
    out.gain.value = 0.7
    out.connect(ctx.destination)
    for (const s of ALL)
      fetch(`./sfx/${s}.mp3`)
        .then((r) => r.arrayBuffer())
        .then((b) => ctx!.decodeAudioData(b))
        .then((buf) => buffers.set(s, buf))
        .catch(() => {})
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
}
// The first touch anywhere unlocks the audio (and every touch after keeps it running: phones suspend it in the background).
for (const ev of ['pointerdown', 'keydown'] as const) addEventListener(ev, () => !muted.value && start(), { capture: true, passive: true })

/** Play a sound now, or after `delay` ms. Quiet when muted or before the first tap. */
export function play(s: Sound, delay = 0, volume = 1) {
  if (muted.value || !ctx || !out) return
  const buf = buffers.get(s)
  if (!buf) return
  const src = ctx.createBufferSource()
  src.buffer = buf
  let node: AudioNode = src
  if (volume !== 1) {
    const g = ctx.createGain()
    g.gain.value = volume
    src.connect(g)
    node = g
  }
  node.connect(out)
  src.start(ctx.currentTime + delay / 1000)
}

// Taps: picking a card from the hand and voting for a videogame have their own sound; any other button clicks.
// The menu, the rules and the credits play their own open and close sounds (see Menu.tsx and Sheet.tsx).
addEventListener(
  'click',
  (e) => {
    const b = (e.target as Element | null)?.closest?.('button')
    if (!b || (b as HTMLButtonElement).disabled || b.closest('.menu, .rules')) return
    if (b.closest('.hand')) play('scegli-carta')
    else if (b.classList.contains('sheet')) play('voto-scelta')
    else if (!b.classList.contains('card')) play('tocco')
  },
  { capture: true, passive: true },
)
