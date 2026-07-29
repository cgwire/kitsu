# Kitsu — CLAUDE.md

Kitsu is a production tracking web application for animation studios, built by CGWire.

## Quick reference

| Item | Value |
|------|-------|
| Stack | Vue 3.5, Vuex 4, Vue Router 5, vue-i18n 9, Vite 8, Vitest |
| Node | >= 22.22.2 |
| npm | >= 10 |
| Default branch | `main` |
| Dev server | `npm run dev` |
| Tests | `npm run test:unit` (vitest) |
| Lint | `npm run lint` (eslint + prettier, auto-run on commit via husky + lint-staged) |
| Build | `npm run build` |
| Commit style | `[scope] Short description` (e.g. `[widgets] Convert Combobox to composition API`) |
| PR format | C4 contract — `**Problem**` / `**Solution**` bold two-paragraph body (see below) |

## Architecture

```
src/
  components/
    cells/          # Table cell components (RowActionsCell, etc.)
    lists/          # List/table components (StudioList, etc.)
    modals/         # Modal dialogs (BaseModal, EditStudiosModal, etc.)
    pages/          # Page-level components (Studios, etc.)
    players/        # Preview/playlist player components (annotations, bars, viewers, ...)
    sides/          # Sidebar components
    tops/           # Topbar components
    widgets/        # Reusable UI widgets (Combobox*, DateField, etc.)
    mixins/         # Legacy Options API mixins still being migrated to composables
  composables/
    players/        # Player-specific composables (annotation, comparison, playlistComparison, ...)
                    # Generic ones (modal, combobox, ...) stay at the root
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

#### `defineExpose` when a parent drives the component via a ref

A `<script setup>` component exposes nothing through a template ref (≠ Options API):

- Parent calls `this.$refs.child.method()` / `childRef.value.method()` → method throws `TypeError`, **property write is a silent no-op**.
- Fix: grep both ref styles and add the members to `defineExpose`.
- If the parent only *wrote* state, prefer a watcher on the child's props and delete the ref access.

#### Known eslint gotcha

The eslint config does not detect template usage of component imports in `<script setup>`. Wrap those imports in `eslint-disable no-unused-vars` / `eslint-enable` comments (see `AddMetadataModal.vue` for the pattern).

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

#### Import order

Within `<script setup>`, sort imports **alphabetically by source path** within each of these blocks (separate blocks with a blank line):

1. Third-party packages (`vue`, `vue-i18n`, `vuex`, `vue-router`, `lucide-vue-next`, `moment`, …) — alphabetical by package name.
2. Project libs and composables (`@/lib/...`, `@/composables/...`, `@/store/...`).
3. Vue components (`@/components/...`) — alphabetical by path; named imports alphabetical too.

The same rule applies in `.js` files.

### Arrow functions

Arrow functions are preferred over classic function declarations:

```js
// Good
const onSelect = () => { ... }
const onSearchChange = s => { ... }

// Avoid
function onSelect() { ... }
```

### Functional style

Prefer functional array methods (`map`, `filter`, `some`, `reduce`, `forEach`) over imperative loops (`for`, `for...of`, `while`) when possible.

```js
// Good
const hasMatch = items.some(item => item.id === targetId)
const names = people.map(p => p.name)

// Avoid
let hasMatch = false
for (const item of items) {
  if (item.id === targetId) {
    hasMatch = true
    break
  }
}
```

Use imperative loops only when functional doesn't fit (side effects across iterations, performance-critical hot paths, or complex control flow). **No `continue` mid-loop**: structure skip conditions as `if (condition) { ...work... }` nested branches, not `if (!condition) continue`. Early `return` in functions is fine.

Keep comments minimal: only for the non-obvious *why* (library quirks, subtle ordering, data-format gotchas). Never restate what well-named code already says.

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

Handles Escape key to close modal, manages event listener lifecycle. (It replaced the legacy `modalMixin`, now removed.)

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

- `src/locales/en.js` is the **source of truth** — new keys go there first. The other locales are kept in sync with it. POEditor was dropped (2026-05): non-English locales are LLM-translated directly in the JSON files.
- Use `$t()` (or `t()` in `<script setup>`), never `$tc()` (deprecated in vue-i18n 9+).
- Pluralization with pipe format: the locale key `"studio | studios"` works with `$t('key', count)` where the second argument is a number. Every locale uses vue-i18n's DEFAULT plural resolver — keep the **same number of `|` segments as en.js**, don't add a language's extra grammatical plural forms.
- For animation/VFX domain terms (shot, frame, onion skin, edit/montage, …), align translations with Blender's official terminology (`blender/blender-translations` `po/<lang>.po`, or the translated manual at `docs.blender.org/manual/<lang>/`).

```js
// In template
{{ $t('studios.number', entries.length) }}

// In script setup
t('studios.title')
```

### Production-type terminology overlays

`en.js` is the English source of truth. Two **partial overlays** are merged on top of it for specific production types:

- `en_nft.js` — NFT productions: remaps the *shot* concept to **NFT** (`shot/shots/Shot/Shots → NFT/NFTs`). Sequence, episode, asset and edit are unchanged.
- `en_video-game.js` — video-game productions: `shot → map`, `sequence → level`, `episode → chapter` (asset and edit unchanged).

Rules:

- These files contain **only** the keys whose wording differs from `en.js` — never copy a key whose value is identical to the base.
- Key names must **mirror `en.js` exactly**. When a key is renamed in `en.js` (e.g. `creation_explaination → creation_explanation`), rename it in the overlays too: a stale key becomes a dead override and the new base key then leaks untranslated vocabulary (English "shot" showing in an NFT/map UI).
- When a key is **added** to `en.js` whose value mentions a remapped word (shot / sequence / episode), add the matching override to the relevant overlay.
- Only English has these overlays. The other locales (`fr.json`, …) translate `en.js` and have no production-type variant.

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

SCSS variables (`$red`, `$green`, `$dark-grey-light`, etc.) are fine for non-theme values like accents and are defined in `src/variables.scss`. For colors that must differ between light/dark, always use `var(--*)`.

### Datatable pattern

Tables use `.data-list > .datatable-wrapper > table.datatable`. The wrapper handles `overflow: auto` and `border-radius` globally from `App.vue`.

Beware: global `.datatable-row` styles in `App.vue` paint backgrounds on `td` directly, so mobile overrides need `!important` at the `td` level.

### Responsive

Desktop-first approach. The primary users are on large screens; tablet (768px-1024px) is the secondary target for production managers on the studio floor; mobile is occasional.

Breakpoints used in the project:
- `768px` — primary mobile/tablet breakpoint
- `1000px` — secondary desktop breakpoint

**Mobile (≤768px) is read-only and card-based:**

1. **Read-only**: hide all editing affordances — page-header action buttons (new, export), in-row edit/delete actions, any "click to edit" hint. Keep detail navigation (router-links on names).
2. **Cards over rows**: render list entries as cards, not table rows, via pure CSS (table + `display: block` overrides on `tr`/`td`, hidden `<thead>`, badges for compact attributes). Don't duplicate markup with a separate mobile view.

Apply with a `@media (max-width: 768px)` block: `:deep()` on the page header and `:deep(.actions) { display: none }` on rows, then flip the table to a flex card layout.

## Store (Vuex)

Store modules are in `src/store/modules/`. API client functions are in `src/store/api/`.

Pattern:
- API module exports functions that call `client.pget/ppost/pput/pdel`
- Store actions call the API, then commit mutations
- Mutations update state and maintain caches (often a `Map` outside reactive state)
- Use `sortByName()` from `@/lib/sorting` after loading collections

When editing/adding items, re-sort the list to maintain order (some mutations miss this).

### No direct `fetch` from components

Components must never call `fetch()` (or any HTTP client) directly. All network calls go through:

1. an API method in `src/store/api/<entity>.js` using the shared `client.*` helpers (`pget`, `ppost`, `pput`, `pdel`),
2. a Vuex action in `src/store/modules/<entity>.js` that wraps it and commits the resulting mutations.

This keeps auth/error handling, retries and store updates centralised. If you find yourself reaching for `fetch` in a `.vue` file, add the missing API method and action instead.

## Testing

- Test files go in `tests/unit/` with `.spec.js` extension
- Framework: Vitest with jsdom
- Run: `npm run test:unit`
- A green unit test is NOT proof a UI/player bug is fixed — reproduce against the running dev app (localhost:8080) before claiming success.

## Migration status

The codebase is migrating from Options API to Composition API. Many components (especially pages and modals) still use Options API with mixins. When touching these files, convert them to `<script setup>` (see the `composition-api-migration` skill).

The `modalMixin` migration is done (the mixin has been removed). When converting a modal:
1. Use `BaseModal` component if possible (handles markup + Escape key)
2. Otherwise use `useModal(toRef(props, 'active'), emit)` directly

Vue/Vuex/vue-router/vue-i18n are **deliberately pinned** to their current majors until the Composition API migration finishes. Do not propose major upgrades (Pinia, router majors) as fixes, and don't frame the pins as tech debt. A Vuex → Pinia migration is planned afterwards.

## PR body format

```markdown
**Problem**
- Concise bullet per issue

**Solution**
- Concise bullet per fix
```

Bold headers, no `## Problems` / `## Solutions` sections (harmonized across cgwire repos 2026-07). Bullets short and factual; no `🤖 Generated with` footer.

## Key dependencies

- **fabric.js** v7 (official npm package) — annotation canvas, wrapped by `src/composables/players/annotation.js` and `src/components/players/annotations/AnnotationCanvas.vue`
- **fabricjs-psbrush** (cgwire fork) — pressure-sensitive brush on top of fabric
- **socket.io-client** — real-time events via `vue-websocket-next`
- **moment / moment-timezone** — date handling (used throughout schedule and timesheet components)
- **vue-multiselect** — people/entity selection dropdowns

## AI features

Kitsu integrates AI **without forcing**: no dedicated AI styling, opt-in activation (disabled by default on self-hosted), no anthropomorphization, full transparency on models and data flows, and features only built for validated studio pain points. Before adding or reviewing any AI feature, read the full charter and its merge checklist: [`docs/ai-integration-charter.md`](./docs/ai-integration-charter.md).
