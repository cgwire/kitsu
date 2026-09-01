import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => ['drag', 'drop', 'model-viewer'].includes(tag)
        }
      }
    })
  ],
  build: {
    sourcemap: true,
    target: 'es2020',
    rolldownOptions: {
      output: {
        // Stable vendor chunks: their hashes survive app-only deploys, so
        // returning browsers keep them cached instead of re-downloading them.
        codeSplitting: {
          groups: [
            {
              // oxc lowering helpers otherwise park in whichever vendor chunk
              // uses them first (date-fns/parse, so `charts`), which drags that
              // chunk into the entry preload. Isolating them frees the entry.
              // The test matches a rolldown-internal virtual module id: if that
              // format changes the group silently stops matching and the graph
              // reverts to its previous shape (size regression, not a crash).
              name: 'helpers',
              test: /@oxc-project\+runtime/
            },
            {
              name: 'vue-vendor',
              test: /node_modules[\\/](?:@intlify|@vue|vue-i18n|vue-router|vuex|vue)[\\/]/
            },
            {
              name: 'date-vendor',
              test: /node_modules[\\/]moment(?:-timezone)?[\\/]/
            },
            {
              name: 'sentry',
              test: /node_modules[\\/]@sentry[\\/]/
            },
            {
              name: 'realtime',
              test: /node_modules[\\/](?:socket\.io-client|engine\.io-client|engine\.io-parser|socket\.io-parser)[\\/]/
            },
            {
              name: 'charts',
              test: /node_modules[\\/](?:chart\.js|chartkick|vue-chartkick|@kurkle|chartjs-adapter-date-fns)[\\/]/
            },
            {
              name: 'datepicker',
              test: /node_modules[\\/](?:@vuepic|date-fns)[\\/]/
            }
          ]
        }
      }
    }
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': `${import.meta.dirname}/src/`,
      // Runtime-only build: templates are precompiled by the SFC plugin,
      // shipping the template compiler was dead weight.
      vue: 'vue/dist/vue.runtime.esm-bundler.js',
      'fabricjs-psbrush': `${import.meta.dirname}/node_modules/fabricjs-psbrush/dist/index.mjs`,
      // Shield entry: keeps `moment/locale/*` imports out of the `moment` alias below (first match wins).
      'moment/locale': `${import.meta.dirname}/node_modules/moment/locale`,
      // Pin bare `moment` to the CJS build; otherwise ESM imports resolve `jsnext:main` (dist/moment.js)
      // while CJS requires (moment-timezone, locale files) resolve `main` (moment.js) — two instances.
      moment: `${import.meta.dirname}/node_modules/moment/moment.js`,
      // Truncated IANA data (same zone names, exact offsets for 1970-2030); smaller windows shift historical timestamps by 1h.
      'moment-timezone': `${import.meta.dirname}/node_modules/moment-timezone/builds/moment-timezone-with-data-1970-2030.min.js`
    }
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/variables.scss" as *;`,
        api: 'modern'
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 8080,
    proxy: {
      '/api': {
        target: process.env.KITSU_API_TARGET || 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
      '/socket.io': {
        target: process.env.KITSU_EVENT_TARGET || 'http://127.0.0.1:5001',
        changeOrigin: true,
        ws: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest-localstorage-mock', 'tests/unit.setup.js'],
    mockReset: false,
    isolate: true,
    // Agent worktrees under .claude/ carry their own copy of the suite;
    // without this exclude `vitest tests/unit` picks them up too.
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**'],
    deps: {
      optimizer: {
        client: {
          include: ['vue', 'vuex', 'vue-router', '@vue/test-utils']
        }
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      // Components are exercised through the dev app, not unit tests;
      // thresholds only guard the layers the suite actually covers.
      include: ['src/lib/**/*.js', 'src/store/**/*.js'],
      // Floors set just under the measured baseline (2026-07): raise them
      // as coverage grows, never lower them.
      thresholds: {
        lines: 28,
        functions: 17,
        branches: 25,
        statements: 28
      }
    }
  }
})
