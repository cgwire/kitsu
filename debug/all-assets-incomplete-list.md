# Bug — Liste "All Assets" incomplète après changement de production (TV show)

## Symptômes

- Page **All Assets** d'un TV show affiche **rien** ou **juste 2 assets**.
- Un **refresh navigateur** corrige.
- Touche tout le monde, observé fréquemment.
- Repro fiable : venir du **main pack d'un autre projet série** vers le **all assets** du projet courant.

## Cause racine

Une **séquence de 2 appels `reset()` rapprochés** se produit pendant `configureProduction` (Topbar). Le 2e appel est avalé par le bail-out de `loadAssets`, et la chaîne `.then` casse silencieusement.

### Trace détaillée du repro (A.main → B.all)

| # | Action | État résultant |
|---|--------|----------------|
| 1 | User clique projet B → `Topbar.configureProduction(B, 'main')` | URL devient `/productions/B/episodes/main/assets` (encore 'main' !) |
| 2 | `setProduction(B)` → `CLEAR_ASSETS` | cache vidé. **Bug : `isAssetsLoading` PAS reset** |
| 3 | `clearEpisodes()` | `currentEpisode = null` |
| 4 | `loadEpisodes(B)` async | requête en vol |
| 5 | `loadEpisodes` résout → `SET_EPISODES_WITH_TASKS` lit l'URL (`routeEpisodeId='main'`) | `currentEpisode = {id:'main'}` |
| 6 | **Watcher `currentEpisode` fire #1** : `null → {id:'main'}` → `reset()` → `loadAssets()` | charge **B.main**, `isAssetsLoading=true` |
| 7 | `.then` de `loadEpisodes` continue : `router.push('/episodes/all/...')` + `updateCombosFromRoute()` | URL → `/all/`, `currentEpisode = {id:'all'}` |
| 8 | **Watcher `currentEpisode` fire #2** : `{id:'main'} → {id:'all'}` → `reset()` → `loadAssets()` | bail (`isAssetsLoading=true`) → return `[]` |
| 9 | `[].then(...)` → `TypeError` silencieux dans `reset()` | `applySearchFromUrl` jamais appelée |
| 10 | Étape 6 termine → `LOAD_ASSETS_END` commit | cache = main pack de B |
| 11 | UI affiche le **main pack de B** alors que l'URL est `/all/` | "shows just 2 assets" si B.main = 2 assets |

### Les deux bugs sous-jacents

**Bug A — `loadAssets` retourne `[]` au lieu d'une Promise**

`src/store/modules/assets.js` lignes 413, 419, 423, 470 :

```js
if (state.isAssetsLoading) {
  return []   // pas une Promise → .then() throw TypeError
}
```

Tous les appelants (`Assets.vue`, `Concepts.vue`, `Breakdown.vue`, `Playlist.vue`, `Task.vue`, `ProductionSchedule.vue`, `ProductionAssetTypes.vue`) chaînent `.then()` ou utilisent `await`. Le bail casse silencieusement la chaîne.

**Bug B — `CLEAR_ASSETS` ne reset pas `isAssetsLoading`**

```js
[CLEAR_ASSETS](state) {
  cache.assets = []
  // ... mais state.isAssetsLoading n'est PAS touché
}
```

Seuls `LOAD_ASSETS_END` (succès) et `LOAD_ASSETS_ERROR` (erreur) le repassent à `false`. Si une requête de A est encore en vol au moment où l'utilisateur switche vers B, le flag reste `true` après `CLEAR_ASSETS`.

## Pourquoi spécifiquement "2 assets"

`B.main` (le main pack de B) contient typiquement très peu d'assets (souvent 2 dans le repro de Frank). Comme l'étape 6 finit par charger ce main pack au lieu du `all`, le user voit ces 2 assets sur la page `/all/`.

## Pourquoi le refresh corrige

Refresh = full reload du SPA :
- État Vuex repart vide
- Pas de `currentEpisode={id:'main'}` intermédiaire (l'URL est déjà `/all/` au moment du mount)
- `mounted()` de `Assets.vue` charge directement avec le bon contexte
- Pas de race entre 2 watchers

## Plan de fix retenu

L'utilisateur tient à préserver le **"do nothing"** du bail-out `isAssetsLoading` (« le but du return c'est de ne rien faire car on est déjà en train de loader »). Donc on ne change pas la sémantique du bail — on empêche les 2 fires rapprochés à la source.

1. **`CLEAR_ASSETS` reset `state.isAssetsLoading` + `state.isAssetsLoadingError`**
   - Défensif, harmless. Si une requête de A traîne quand on switche vers B, le flag est nettoyé.

2. **Debounce le `reset()` dans `Assets.vue`** (~50 ms)
   - Coalèsce les watcher fires rapprochés du `currentEpisode`.
   - L'état intermédiaire `{id:'main'}` est ignoré, seul le `{id:'all'}` final déclenche `loadAssets`.
   - Implémentation : `clearTimeout` + `setTimeout` dans `reset()`, ou un wrapper.

3. **Garde `if (this.isAssetsLoading) return` au début de `reset()`**
   - Défensif, respecte l'intent "do nothing" pour les rares cas où le bail serait quand même atteint.

4. **Bails de `loadAssets` qui retournent `[]`** : on les laisse comme demandé (do nothing)
   - Avec le debounce + la garde, ils ne sont plus atteints depuis `reset()`.
   - Risque résiduel : autres callers (Concepts, Breakdown, etc.) peuvent encore crasher si bail atteint depuis chez eux. À traiter dans une 2e passe si nécessaire.

## Fichiers à modifier

- `src/store/modules/assets.js` — mutation `CLEAR_ASSETS` (ligne 882)
- `src/components/pages/Assets.vue` — méthode `reset()` (ligne 998)

## Test manuel après fix

1. Ouvrir Projet A (TV show), aller sur `main pack > assets` → attendre que la liste s'affiche
2. Cliquer sur Projet B (TV show) dans la production picker
3. Cliquer sur "Assets" (devrait router vers `/productions/B/episodes/all/assets`)
4. Vérifier que la liste affiche bien tous les assets de B (pas juste le main pack)
5. Répéter plusieurs fois, depuis différents projets, pour confirmer la non-régression intermittente
