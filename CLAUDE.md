# Kitsu — CLAUDE.md

Kitsu is a production tracking web application for animation studios, built by CGWire.

## Quick reference

| Item | Value |
|------|-------|
| Stack | Vue 3.5, Vuex 4, Vue Router 5, vue-i18n 9, Vite 8, Vitest |
| Node | >= 20.19 |
| Default branch | `main` |
| Dev server | `npm run dev` |
| Tests | `npm run test:unit` (vitest) |
| Lint | `npm run lint` (eslint + prettier, auto-run on commit via husky + lint-staged) |
| Build | `npm run build` |
| Commit style | `[scope] Short description` (e.g. `[widgets] convert Combobox to composition API`) |
| PR format | C4 contract — Problems / Solutions description |

## Architecture

```
src/
  components/
    cells/          # Table cell components (RowActionsCell, etc.)
    lists/          # List/table components (StudioList, etc.)
    modals/         # Modal dialogs (BaseModal, EditStudiosModal, etc.)
    pages/          # Page-level components (Studios, etc.)
    previews/       # Preview/player components
    sides/          # Sidebar components
    tops/           # Topbar components
    widgets/        # Reusable UI widgets (Combobox*, DateField, etc.)
    mixins/         # Legacy Options API mixins (annotation.js, etc.)
  composables/      # Composition API composables (modal.js, combobox.js, etc.)
  lib/              # Utility libraries (csv, string, sorting, etc.)
  locales/          # i18n translation files (en.js, fr.json, etc.)
  router/           # Vue Router configuration
  store/
    api/            # API client modules (studios.js, etc.)
    modules/        # Vuex store modules (studios.js, etc.)
  styles/           # Global SCSS (shared.scss)
```

## Component conventions

### Composition API (`<script setup>`)

All new and refactored components use `<script setup>`. When converting from Options API:

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// Vuex getters → computed
const studios = computed(() => store.getters.studios)

// Vuex actions → store.dispatch
await store.dispatch('loadStudios')

// head() → useHead with reactive computed
useHead({ title: computed(() => `${t('studios.title')} - Kitsu`) })
</script>
```

### Script setup organization

Group code by role with section comments, in this order:

```vue
<script setup>
// Imports
import { ref, computed, ... } from 'vue'
...

// Composables (useI18n, useStore, useRoute, ...)
const { t } = useI18n()
const store = useStore()

// Props / Emits
const props = defineProps({ ... })
const emit = defineEmits([...])

// State            (refs and reactive)
// Computed         (computed values, including Vuex getters)
// Functions        (event handlers and helpers)
// Watchers         (watch / watchEffect)
// Lifecycle        (onMounted, onBeforeUnmount, ...)
// Head             (useHead)
</script>
```

Skip sections that are not relevant. Order within each section is by usage proximity (related items together) rather than alphabetical.

### Arrow functions

Arrow functions are preferred over classic function declarations:

```js
// Good
const onSelect = () => { ... }
const onSearchChange = s => { ... }

// Avoid
function onSelect() { ... }
```

### Props

Always type props with defaults:

```js
// Good
defineProps({
  entries: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false }
})

// Avoid
props: ['entries', 'isLoading', 'isError']
```

### Emits

Declare emits explicitly:

```js
const emit = defineEmits(['cancel', 'confirm'])
defineEmits(['delete-clicked', 'edit-clicked'])
```

## Composables

Composables live in `src/composables/`. Existing ones:

### `useModal(active, emit)`

Replaces the legacy `modalMixin` from `src/components/modals/base_modal.js`. Handles Escape key to close modal, manages event listener lifecycle.

```js
import { toRef } from 'vue'
import { useModal } from '@/composables/modal'

const props = defineProps({ active: { type: Boolean, default: false } })
const emit = defineEmits(['cancel'])
useModal(toRef(props, 'active'), emit)
```

### `useCombobox(emit)`

Shared toggle/select logic for custom combobox components.

### `BaseModal` component

`BaseModal.vue` wraps the modal markup (background, content box, title, slot) and uses `useModal` internally. Prefer using `BaseModal` over reimplementing the modal structure:

```vue
<base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
  <!-- form content goes in the slot -->
  <modal-footer @confirm="onConfirm" @cancel="$emit('cancel')" />
</base-modal>
```

## i18n

- Use `$t()` (or `t()` in `<script setup>`), never `$tc()` (deprecated in vue-i18n 9+).
- Pluralization with pipe format: the locale key `"studio | studios"` works with `$t('key', count)` where the second argument is a number.

```js
// In template
{{ $t('studios.number', entries.length) }}

// In script setup
t('studios.title')
```

## CSS / SCSS

### Scoped styles

All component styles are `<style lang="scss" scoped>`.

### Dark mode

Use CSS custom properties for theme-aware values, not hardcoded colors:

```scss
// Good
background: var(--background);
color: var(--text);
border-color: var(--border);

// Avoid
background: $white;    // breaks dark mode
background: #ffffff;   // breaks dark mode
```

SCSS variables (`$red`, `$green`, `$dark-grey-light`, etc.) are fine for non-theme values like accents and are defined in `src/variables.scss`.

For colors that must differ between light/dark, always use `var(--*)`.

### Datatable pattern

Tables use `.data-list > .datatable-wrapper > table.datatable`. The wrapper handles `overflow: auto` and `border-radius` globally from `App.vue`.

### Responsive

Desktop-first approach. The primary users are on large screens; tablet (768px-1024px) is the secondary target for production managers on the studio floor; mobile is occasional.

Breakpoints used in the project:
- `768px` — primary mobile/tablet breakpoint
- `1000px` — secondary desktop breakpoint

```scss
@media screen and (max-width: 768px) {
  // tablet and below
}
```

## Store (Vuex)

Store modules are in `src/store/modules/`. API client functions are in `src/store/api/`.

Pattern:
- API module exports functions that call `client.pget/ppost/pput/pdel`
- Store actions call the API, then commit mutations
- Mutations update state and maintain caches (often a `Map` outside reactive state)
- Use `sortByName()` from `@/lib/sorting` after loading collections

When editing/adding items, re-sort the list to maintain order (some mutations miss this).

## Testing

- Test files go in `tests/unit/` with `.spec.js` extension
- Framework: Vitest with jsdom
- Run: `npm run test:unit`

## Migration status

The codebase is migrating from Options API to Composition API. Many components (especially pages and modals) still use Options API with mixins. When touching these files, convert them to `<script setup>`.

The `modalMixin` in `src/components/modals/base_modal.js` is being replaced by the `useModal` composable. When converting a modal:
1. Use `BaseModal` component if possible (handles markup + Escape key)
2. Otherwise use `useModal(toRef(props, 'active'), emit)` directly
3. Remove the `mixins: [modalMixin]` and secondary `<script>` block

## Key dependencies

- **fabric.js** v5.1.0 (cgwire fork) — annotation canvas, used only in `src/components/mixins/annotation.js` and `src/components/previews/PreviewPlayer.vue`
- **socket.io-client** — real-time events via `vue-websocket-next`
- **moment / moment-timezone** — date handling (used throughout schedule and timesheet components)
- **vue-multiselect** — people/entity selection dropdowns
