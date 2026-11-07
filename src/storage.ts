// localStorage can throw or be empty (private mode, partitioned iframe storage
// on iOS), so every access is guarded and the game still runs without it.
const PREFIX = 'blaterojam:'

export function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw == null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage unavailable: nothing to do */
  }
}

export function remove(key: string) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

/** A stable id for this device/browser, used to give a player their seat back. */
export function deviceId(): string {
  let id = load<string>('deviceId')
  if (!id) {
    id = crypto.randomUUID()
    save('deviceId', id)
  }
  return id
}
