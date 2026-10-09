import { resolve } from 'node:path'
import { defineConfig } from 'astro/config'

// Set VEYRA_CORE_SRC=../veyra-core to develop against the engine source.
const coreSrc = process.env.VEYRA_CORE_SRC ? resolve(process.env.VEYRA_CORE_SRC, 'src') : null

export default defineConfig({
  // GitHub Pages organization site: https://veyra-studio.github.io/
  site: 'https://veyra-studio.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: {
    resolve: {
      alias: coreSrc
        ? [
            { find: /^@veyra\/core\/three$/, replacement: resolve(coreSrc, 'three/index.ts') },
            { find: /^@veyra\/core$/, replacement: resolve(coreSrc, 'index.ts') },
          ]
        : [],
    },
  },
})
