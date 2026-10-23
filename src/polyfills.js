import structuredClonePolyfill from '@ungap/structured-clone'
import 'core-js/features/array/at' // ES2022 - marked
import 'core-js/features/array/find-last' // ES2023 - app
import 'core-js/features/object/has-own' // ES2022 - sanitize-html + @unhead
import 'core-js/features/string/replace-all' // ES2021

// Web API - @vuepic/vue-datepicker + players/eraserbrush. Only where the
// browser lacks it: core-js replaced even a native one, over error cloning
// details Kitsu never relies on. Keep the check: this polyfill calls the
// native function when there is one.
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = structuredClonePolyfill
}
