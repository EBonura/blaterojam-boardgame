import { signal } from '@preact/signals'
import { load, save } from '../storage'

export type Lang = 'it' | 'en'

function initial(): Lang {
  const stored = load<Lang>('lang')
  if (stored === 'it' || stored === 'en') return stored
  return navigator.language?.toLowerCase().startsWith('it') ? 'it' : 'en'
}

export const signalLang = signal<Lang>(initial())

export function setLang(l: Lang) {
  signalLang.value = l
  document.documentElement.lang = l
  save('lang', l)
}
