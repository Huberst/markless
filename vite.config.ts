// import vite config type without adding it to deno.jsonc

import denoPlugin from '@deno/vite-plugin'
import { defineConfig } from 'vite'

const config = defineConfig(({ command }) => ({
  base: command === 'build' ? '/markless/' : '/',
  plugins: [denoPlugin()],
  root: './page',
  server: {
    host: '0.0.0.0',
    port: 8080,
  },

  // Build with vite? (rollup)
  build: {
    outDir: './dist',
    target: 'esnext',
  },
}))

export default config
