import { defineConfig } from 'vitest/config'
// Only the tuning simulation (not part of `npm test`).
export default defineConfig({ test: { include: ['tools/variants.sim.ts'] } })
