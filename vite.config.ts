import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// base './' so the build works from itch.io's zip upload (relative asset paths).
export default defineConfig({
  base: './',
  plugins: [preact()],
})
