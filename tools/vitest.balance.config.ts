import { defineConfig } from 'vitest/config'
// Only the balancing simulation (not part of `npm test`).
export default defineConfig({ test: { include: ['tools/balance.sim.ts'] } })
