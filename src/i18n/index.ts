import { signalLang, type Lang } from './lang'
import { strings, type StringKey } from './strings'

export type { Lang }
export type Bilingual = { it: string; en: string }

export { signalLang as lang, setLang } from './lang'

/** UI string in the current language. `{name}` placeholders are filled from `vars`. */
export function t(key: StringKey, vars?: Record<string, string | number>): string {
  let s: string = strings[key][signalLang.value]
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}

/** Pick the current language from card or rules text stored as { it, en }. */
export function tr(text: Bilingual): string {
  return text[signalLang.value] || text.it || text.en
}
