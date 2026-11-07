// What changed between two room states, small enough to send instead of the whole state.
// A patch node is one of:
//   { v: value }            replace with this value
//   { d: 1 }                the key is gone
//   { s: k, t: [...] }      an array that dropped its first k items and gained these at the end (the event log, recent actions)
//   { o: { key: node } }    an object with some keys changed
// Arrays that change any other way are replaced whole (a reshuffled deck, a new hand).

export type Patch = { v: unknown } | { d: 1 } | { s: number; t: unknown[] } | { o: Record<string, Patch> }

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)

function same(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== typeof b || !a || !b || typeof a !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a)) return a.length === (b as unknown[]).length && a.every((x, i) => same(x, (b as unknown[])[i]))
  const ka = Object.keys(a as object).filter((k) => (a as Record<string, unknown>)[k] !== undefined)
  const kb = Object.keys(b as object).filter((k) => (b as Record<string, unknown>)[k] !== undefined)
  return ka.length === kb.length && ka.every((k) => same((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

/** The patch from a to b, or null when they are the same. */
export function diff(a: unknown, b: unknown): Patch | null {
  if (same(a, b)) return null
  if (isObj(a) && isObj(b)) {
    const o: Record<string, Patch> = {}
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (b[k] === undefined) {
        if (a[k] !== undefined) o[k] = { d: 1 }
      } else {
        const p = diff(a[k], b[k])
        if (p) o[k] = p
      }
    }
    return { o }
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    // Shifted and appended? Find the smallest k with a[k..] equal to the start of b.
    for (let k = 0; k <= a.length; k++) {
      const rest = a.length - k
      if (rest > b.length) continue
      if (rest === 0 && b.length >= a.length) break // nothing in common: replace
      let ok = true
      for (let i = 0; i < rest && ok; i++) ok = same(a[k + i], b[i])
      if (ok) return { s: k, t: b.slice(rest) }
    }
  }
  return { v: b }
}

/** Apply a patch made by diff(a, b) to a, giving b. `a` is not changed. */
export function patch<T>(a: T, p: Patch | null): T {
  if (!p) return a
  if ('v' in p) return structuredClone(p.v) as T
  if ('s' in p) return [...(a as unknown[]).slice(p.s), ...structuredClone(p.t)] as T
  if ('o' in p) {
    const out: Record<string, unknown> = { ...(a as Record<string, unknown>) }
    for (const [k, c] of Object.entries(p.o)) {
      if ('d' in c) delete out[k]
      else out[k] = patch(out[k], c)
    }
    return out as T
  }
  return a
}
