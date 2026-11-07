// Shared test setup applied to every page before the game loads, so the game itself has no test switches.
//   RELAY=1  only connect through the TURN relay (like a network that blocks direct links between devices)
//   fastCpu  CPU players wait 80 ms instead of 1.5 s (they use 1500 and 3000 ms timers; nothing else does)
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
      window.setTimeout = (fn, ms, ...args) => native(fn, ms === 1500 ? 80 : ms === 3000 ? 160 : ms, ...args)
    })
}
