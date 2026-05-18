# Studio Page — Code Review

Date: 2026-04-13

Fichiers analyses :
- `src/components/pages/Studios.vue`
- `src/components/lists/StudioList.vue`
- `src/components/modals/EditStudiosModal.vue`
- `src/components/widgets/ComboboxStudio.vue`
- `src/components/widgets/StudioName.vue`
- `src/store/modules/studios.js`
- `src/store/api/studios.js`

---

## 1. Clarte du code

### Options API → Composition API

Les 3 composants principaux (`Studios.vue`, `StudioList.vue`, `EditStudiosModal.vue`) sont encore en Options API alors que la convention du projet est `<script setup>`. `ComboboxStudio.vue` et `StudioName.vue` sont deja convertis.

### StudioList.vue

- **Props non typees** (ligne 46) : `props: ['entries', 'isLoading', 'isError']` — pas de types, pas de defaults.
- **Classe CSS `nb-asset-types`** (ligne 33) : nom copie-colle d'un autre composant, devrait etre `nb-studios`.
- **`$tc` deprecie** (ligne 34) : `$tc('studios.number', entries.length)` — `$tc` est deprecie dans vue-i18n 10+, utiliser `$t` avec un parametre `count`.

### EditStudiosModal.vue

- **Mixin `modalMixin`** (ligne 54) : les mixins sont deconseilles en Vue 3. Un composable `useModal()` serait plus propre.
- **`setTimeout` pour le focus** (lignes 110-113) : `setTimeout(() => this.$refs.nameField.focus(), 100)` — fragile. `nextTick` serait plus fiable.
- **Donnees du formulaire dupliquees** : le watcher `studioToEdit` (lignes 116-132) et `data()` (lignes 84-92) dupliquent la structure du formulaire. Un computed ou un `watch` avec `immediate: true` simplifierait.

### Studios.vue

- **Pattern try/catch repetitif** : `confirmEditStudio` et `confirmDeleteStudio` ont exactement le meme pattern loading/error/try/catch. Un composable `useAsyncAction()` factoriserait ca.
- **`tabs` dans `data()`** (lignes 85-94) : utilise `this.$t()` dans `data()`, ce qui ne se met pas a jour si la locale change. Devrait etre un `computed`.

### studios.js (store)

- **`EDIT_STUDIOS_END` ne retrie pas** (lignes 64-71) : apres un edit ou un ajout, la liste n'est pas re-triee par nom. `LOAD_STUDIOS_END` trie, mais pas `EDIT_STUDIOS_END`.
- **`getStudio` getter** (lignes 25-27) : fait un `find()` O(n) alors que `studioMap` existe deja. Pourrait etre `id => cache.studioMap.get(id)`.

---

## 2. Styles CSS

### StudioList.vue

- **`.name` : largeur fixe** (ligne 63) : `width: 300px` — ne s'adapte pas. Devrait etre `min-width` ou un ratio flex.
- **`.color` : `height` sur un `<td>`** (lignes 69-70) : `height: 20px` sur un `<td>` ne fonctionne pas comme prevu, c'est le `<span>` qui porte la taille.
- **Pas de styles `dark`** : toutes les autres listes du projet en ont.

### ComboboxStudio.vue

- **Backgrounds en dur** (lignes 144, 159, 165) : `background: $white` au lieu de `var(--background)`. Casse le dark mode.
- **`max-height` doublon** (ligne 191) : propriete CSS `max-height: 200px` en dur alors qu'elle est aussi passee en prop `maxHeightSelectInput` et appliquee en inline style. Les deux entrent en conflit.
- **`.opened` manque le radius haut** : quand la dropdown s'ouvre, les coins bas sont retires mais le style est incomplet compare aux autres combobox.

### EditStudiosModal.vue

- **`.is-danger` couleur en dur** (ligne 143) : `color: #ff3860` au lieu de `$red` ou une variable CSS.
- **Styles non utilises** : `.modal-content .box p.text` (ligne 138) — aucun element avec la classe `text` dans le template.

---

## 3. Responsive

- **Aucun style responsive** dans aucun des composants. La table de `StudioList.vue` avec `width: 300px` en dur deborde sur mobile.
- **`ComboboxStudio.vue` : largeur fixe** en prop (`width: 250px` par defaut) passee en inline style. Pas de `max-width: 100%` pour les petits ecrans.
- **Modal `EditStudiosModal.vue`** : utilise les classes Bulma `.modal` qui sont responsive par defaut, mais le contenu interne n'a pas de padding adaptatif.

---

## 4. Performance

- **Pas de probleme majeur** — page admin simple avec peu de donnees.
- **`studioMap` dans le cache** (store ligne 11) : le `Map` est hors du state reactif (dans `cache`), ce qui est bien pour la perf, mais le getter `studioMap` (ligne 23) retourne toujours la meme reference — les composants qui dependent du contenu de la map ne seront pas re-rendus si elle change.
- **`getStudio` getter** : `find()` au lieu de `Map.get()`.

---

## Resume par priorite

| Priorite | Element | Fichier |
|----------|---------|---------|
| Haute | Backgrounds `$white` en dur (dark mode casse) | `ComboboxStudio.vue` |
| Haute | `$tc` deprecie | `StudioList.vue` |
| Moyenne | Conversion Composition API | `Studios.vue`, `StudioList.vue`, `EditStudiosModal.vue` |
| Moyenne | Props non typees | `StudioList.vue` |
| Moyenne | `tabs` dans `data()` au lieu de `computed` | `Studios.vue` |
| Moyenne | `EDIT_STUDIOS_END` ne retrie pas | `studios.js` |
| Basse | Classe CSS `nb-asset-types` -> `nb-studios` | `StudioList.vue` |
| Basse | Mixin -> composable | `EditStudiosModal.vue` |
| Basse | `setTimeout` -> `nextTick` | `EditStudiosModal.vue` |
| Basse | Style `.is-danger` couleur en dur | `EditStudiosModal.vue` |
| Basse | Responsive table/combobox | `StudioList.vue`, `ComboboxStudio.vue` |
