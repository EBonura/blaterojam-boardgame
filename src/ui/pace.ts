// Pacing shared by the game screen and the CPU driver, so the table can follow what happens.
import { signal } from '@preact/signals'
import type { Stat } from '../game/rules'

/** A reveal (a card, or an Imprevisto sequence) is on screen: CPUs wait for it. */
export const revealBusy = signal(false)
/** Imprevisti up to this event have been fully shown; later ones still hold the board at their `before`. */
export const shownSeq = signal(Infinity)
/** The Imprevisto sequence in progress: which thresholds, and which step. */
/** The vote's result is on screen as the game opens: CPUs wait for it too. */
export const introBusy = signal(false)
export const breaking = signal<{ seq: number; hits: { stat: Stat; t: number }[]; phase: 'warn' | 'break' } | null>(null)

// Durations (ms). tools/browser-env.mjs shortens these exact values in the CPU test.
export const CPU_DELAY_MS = 1500
export const WARN_MS = 1800
export const BREAK_MS = 1050
export const IMPREVISTO_HOLD_MS = 8000
export const PLAY_HOLD_MS = 4400
export const SETTLE_MS = 1100
export const INTRO_MS = 3800
/** Before a person's clock starts, the table watches what the last move set off: a played card, or a whole Imprevisto. */
export const PLAY_GRACE_MS = PLAY_HOLD_MS + SETTLE_MS
export const IMPREVISTO_GRACE_MS = WARN_MS + BREAK_MS + IMPREVISTO_HOLD_MS + SETTLE_MS
