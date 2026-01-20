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
    target: 'es2020'
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': `${import.meta.dirname}/src/`,
      vue: 'vue/dist/vue.esm-bundler.js',
      'fabricjs-psbrush': `${import.meta.dirname}/node_modules/fabricjs-psbrush/dist/index.mjs`
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
    deps: {
      optimizer: {
        client: {
          include: ['vue', 'vuex', 'vue-router', '@vue/test-utils']
        }
      }
    }
  }
})
