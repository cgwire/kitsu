import * as vue from 'vue'
import * as vueI18n from 'vue-i18n'
import * as vueRouter from 'vue-router'
import * as vuex from 'vuex'

/**
 * Host ↔ injected-plugin bridge (versioned contract, not a public app API).
 *
 * Shape on `globalThis[SHARED_GLOBAL]`:
 *   { modules: { vue, 'vue-router', vuex, 'vue-i18n' } }
 *
 * Plugin builds rewrite imports of those packages to read these instances so
 * they share one reactivity / injection scope with Kitsu. Publish before the
 * first plugin `import()`. A breaking change of this shape requires rebuilt
 * plugin bundles.
 *
 * Longer term we prefer an import map plus stable ESM entries
 * (`/kitsu-shared/vue.js`, …) shared by host and plugins, instead of this
 * global. That needs the host to stop bundling Vue only inside vue-vendor.
 */
export const SHARED_GLOBAL = '__KITSU_SHARED__'

export const publishSharedModules = () => {
  globalThis[SHARED_GLOBAL] = {
    modules: {
      vue,
      'vue-router': vueRouter,
      vuex,
      'vue-i18n': vueI18n
    }
  }
}
