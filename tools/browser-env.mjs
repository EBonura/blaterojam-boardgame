// Shared test setup applied to every page before the game loads, so the game itself has no test switches.
//   RELAY=1  only connect through the TURN relay (like a network that blocks direct links between devices)
//   fastCpu  game pacing runs fast: the CPU delay and reveal timings in src/ui/pace.ts (exact values) are shortened
export async function prepare(page, { fastCpu = false } = {}) {
  if (process.env.RELAY)
    await page.evaluateOnNewDocument(() => {
      const Native = window.RTCPeerConnection
      window.RTCPeerConnection = class extends Native {
        constructor(config = {}) {
          super({ ...config, iceTransportPolicy: 'relay' })
        }
      }
    })
  if (fastCpu)
    await page.evaluateOnNewDocument(() => {
      const native = window.setTimeout
      const fast = { 1500: 250, 1800: 200, 1050: 150, 8000: 400, 2200: 300, 1100: 150, 3800: 300 }
      window.setTimeout = (fn, ms, ...args) => native(fn, fast[ms] ?? ms, ...args)
    })
}
