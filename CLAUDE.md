# Kitsu — CLAUDE.md

Kitsu is a production tracking web application for animation studios, built by CGWire.

## Quick reference

| Item | Value |
|------|-------|
| Stack | Vue 3.5, Vuex 4, Vue Router 5, vue-i18n 9, Vite 8, Vitest |
| Node | >= 22.22.1 |
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

#### Import order

Within `<script setup>`, sort imports **alphabetically by source path** within
each of these blocks (separate blocks with a blank line):

1. Third-party packages (`vue`, `vue-i18n`, `vuex`, `vue-router`,
   `lucide-vue-next`, `moment`, …) — alphabetical by package name.
2. Project libs and composables (`@/lib/...`, `@/composables/...`,
   `@/store/...`).
3. Vue components (`@/components/...`) — alphabetical by path; named imports
   alphabetical too.

The same rule applies in `.js` files.

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

Use imperative loops only when functional doesn't fit (side effects across iterations, performance-critical hot paths, or complex control flow).

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
- For animation/VFX domain terms (shot, frame, onion skin, edit/montage, …), align translations with Blender's official terminology (`blender/blender-translations` `po/<lang>.po`, or the translated manual at `docs.blender.org/manual/<lang>/`).

```js
// In template
{{ $t('studios.number', entries.length) }}

// In script setup
t('studios.title')
```

### Production-type terminology overlays

`en.js` is the English source of truth. Two **partial overlays** are merged on
top of it for specific production types:

- `en_nft.js` — NFT productions: remaps the *shot* concept to **NFT**
  (`shot/shots/Shot/Shots → NFT/NFTs`). Sequence, episode, asset and edit are
  unchanged.
- `en_video-game.js` — video-game productions: `shot → map`,
  `sequence → level`, `episode → chapter` (asset and edit unchanged).

Rules:

- These files contain **only** the keys whose wording differs from `en.js` —
  never copy a key whose value is identical to the base.
- Key names must **mirror `en.js` exactly**. When a key is renamed in `en.js`
  (e.g. `creation_explaination → creation_explanation`), rename it in the
  overlays too: a stale key becomes a dead override and the new base key then
  leaks untranslated vocabulary (English "shot" showing in an NFT/map UI).
- When a key is **added** to `en.js` whose value mentions a remapped word
  (shot / sequence / episode), add the matching override to the relevant
  overlay.
- Only English has these overlays. The other locales (`fr.json`, …) translate
  `en.js` and have no production-type variant.

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

### No direct `fetch` from components

Components must never call `fetch()` (or any HTTP client) directly. All
network calls go through:

1. an API method in `src/store/api/<entity>.js` using the shared `client.*`
   helpers (`pget`, `ppost`, `pput`, `pdel`),
2. a Vuex action in `src/store/modules/<entity>.js` that wraps it and commits
   the resulting mutations.

This keeps auth/error handling, retries and store updates centralised. If you
find yourself reaching for `fetch` in a `.vue` file, add the missing API
method and action instead.

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

- **fabric.js** v5.1.0 (cgwire fork) — annotation canvas, wrapped by `src/composables/players/annotation.js` and `src/components/players/annotations/AnnotationCanvas.vue`
- **socket.io-client** — real-time events via `vue-websocket-next`
- **moment / moment-timezone** — date handling (used throughout schedule and timesheet components)
- **vue-multiselect** — people/entity selection dropdowns

## Intégration des fonctionnalités IA dans Kitsu

Cette section définit les règles à appliquer pour toute fonctionnalité IA ajoutée à Kitsu (cloud et self-hosted). Elle s'inspire de l'enquête [*Le forcing de l'IA*](https://limitesnumeriques.fr/travaux-productions/ai-forcing) (Limites Numériques, février 2025), qui documente les patterns par lesquels les éditeurs imposent l'IA via le design, au détriment des usages réels.

**Principe directeur** : Kitsu intègre l'IA sans forcing. L'IA est une fonctionnalité comme une autre, justifiée par un usage validé, et non un produit poussé pour lui-même.

### 1. Design d'interface

- Pas de couleur dédiée à l'IA (pas de violet, mauve, dégradé bleu-rose, gradient shimmer).
- Pas d'icône évoquant la magie (pas de ✨, pas d'étoile, pas de baguette).
- Pas d'animation spécifique aux boutons ou zones IA quand les autres fonctions sont statiques.
- Les fonctionnalités IA utilisent les mêmes composants visuels (couleurs, typographie, iconographie Material) que le reste de Kitsu.
- Pas de placement privilégié : l'IA ne prend pas le bouton principal d'une vue (Tâches, Casting, Breakdown, Playlists). Elle se loge dans le contexte métier où elle a un sens.
- Pas de répétition de la même fonction IA à plusieurs endroits de l'interface.

### 2. Activation et contrôle

- Activation explicite. Pas de déclenchement par raccourci clavier fréquent ou par clic accidentel sur la zone de saisie principale.
- Opt-in par défaut, pas opt-out, pour toute fonctionnalité IA significative.
- En self-hosted, IA désactivée par défaut, activable explicitement par l'administrateur du studio.
- Bouton clair de désactivation par projet et par studio.

### 3. Nommage et vocabulaire

- Pas de prénom d'assistant ("Kit", "Kitty", "Kitsubot", etc.).
- Pas de visage, d'avatar ou de mascotte associé à l'IA.
- Pas de métaphore de l'"assistant" qui aide sans remplacer.
- Pas de vocabulaire magique ("magie", "boost", "wow", "intelligent").
- Décrire ce que la fonction fait, factuellement. Exemple : "Générer un résumé des notes de review", pas "Résumer ✨".
- Indiquer aussi ce que la fonction ne fait pas et ses limites connues (taux d'erreur, hallucinations possibles, types de contenus mal traités).

### 4. Transparence

- Pour chaque appel IA, le studio peut savoir : quel modèle est utilisé, où il tourne (local ou cloud), quelles données sortent du studio, vers quel fournisseur.
- Cette information est accessible dans les paramètres et dans la documentation, pas cachée derrière plusieurs clics.
- Quand pertinent, exposer le coût (tokens, latence, ordre de grandeur énergétique) à l'admin du studio.
- Privilégier les modèles locaux ou auto-hébergeables quand c'est viable, surtout pour le self-hosted.

### 5. Choix de fonctionnalités

- Une fonctionnalité IA n'est développée que pour répondre à un point de douleur identifié et validé avec 2 ou 3 studios pilotes.
- Pas de fonctionnalité IA "parce qu'il en faut" ou "parce que les concurrents en ont".
- Pas de "tâtonnement" public : les expérimentations restent en feature flag ou en bêta privée tant que l'usage n'est pas démontré.
- Mesure de l'usage réel (pas le premier clic d'essai). Une fonction non utilisée au bout de 3 mois est retirée, pas conservée par inertie.

### 6. Communication produit

- Pas de pop-up d'annonce, de modal d'onboarding ou de tour guidé poussant à essayer l'IA.
- Pas de badge "Nouveau" ou "AI" clignotant sur le bouton.
- Une page de documentation dédiée suffit. Le changelog mentionne la fonctionnalité au même niveau que les autres.
- Sur le blog et la roadmap, expliquer **pourquoi** la fonction arrive (quel problème studio elle résout), pas seulement qu'elle arrive.

### 7. Cadrage éditorial

- L'IA est cadrée en empowerment des équipes (artistes, supes, prod), pas en remplacement.
- Le ton évite l'emphase sur la performance brute du modèle, et insiste sur l'intégration dans le workflow.
- Cohérent avec la sensibilité de la communauté open source VFX/animation : transparence, respect des métiers, attention à l'empreinte.

### 8. Positionnement

Cette charte n'est pas seulement défensive. Elle ouvre un angle de différenciation : Kitsu peut se positionner comme **le production tracker qui intègre l'IA sans forcing**, à rebours des patterns documentés par Limites Numériques. Cet angle peut être assumé publiquement (article de blog dédié, mention dans la doc, communication communauté).

### Checklist de revue avant merge d'une feature IA

- [ ] Aucune couleur, icône ou animation spécifique IA
- [ ] Activation explicite, pas de raccourci ambigu
- [ ] Opt-in (et désactivé par défaut en self-hosted)
- [ ] Pas d'anthropomorphisation
- [ ] Modèle, hébergement et données documentés et visibles
- [ ] Point de douleur validé avec au moins 2 studios pilotes
- [ ] Métriques d'usage en place
- [ ] Pas de pop-up ou onboarding poussant à l'essai
