# PlaylistPlayer — adoption des bars et composables partagés

**Date :** 2026-05-21
**Branche :** `refactoring-review`
**Scope :** `src/components/pages/playlists/PlaylistPlayer.vue` (4843 lignes) et les sous-composants partagés de `src/components/previews/`.
**Objectif :** Réduire la taille de `PlaylistPlayer.vue` en lui faisant adopter les bars (`PlayerComparisonBar`, `PlayerPlaybackBar`, `PlayerAnnotationBar`) et composables (`useComparison`) déjà utilisés par `PreviewPlayer`, sans dupliquer les besoins playlist-spécifiques.

## Contexte

Les commits récents ont migré `PlaylistPlayer` en Composition API et extrait plusieurs composables partagés (`useAnnotation`, `usePanzoomSync`, `usePreviewRoom`, `useAnnotationBroadcast`, `usePreviewShortcuts`). Le canvas a aussi été migré vers `AnnotationCanvas`. Malgré ça, le fichier reste à 4843 lignes parce que **tout son button bar (~530 lignes de template)** et **toute sa logique de comparaison (~300 lignes de script)** sont encore inline — alors que `PreviewPlayer` utilise déjà :

- `PlayerComparisonBar.vue` (128 lignes)
- `PlayerPlaybackBar.vue` (161 lignes)
- `PlayerAnnotationBar.vue` (280 lignes)
- `useComparison` (`src/composables/comparison.js`, 219 lignes)

Ces composants sont aujourd'hui consommés uniquement par `PreviewPlayer`. Les faire adopter par `PlaylistPlayer` mutualise et amincit le fichier.

## Audit — écarts entre PlaylistPlayer et les composants partagés

### PlayerComparisonBar

| Besoin playlist | Couvert par PlayerComparisonBar | Action |
|---|---|---|
| Bouton compare, comboboxes task-type / revision / mode, navigation prev/next | Oui | Adopter tel quel |
| Warning "⚠️ comparing_missing_plan" quand l'entité comparée n'a pas le task-type | Non | **Ajouter slot `#missing`** |
| `@update:model-value` qui déclenche `rebuildEntityListToCompare` + `updateRoomStatus` | Non (v-model simple) | Pas de changement dans la bar : les watchers vivent côté composable / parent |
| v-model `previewToCompareId` recevant une revision-string ("v3", `null`) au lieu d'un preview-file-id | Oui (la bar ne se soucie que de la valeur du combobox) | Renommer côté playlist : `revisionToCompare` → `previewToCompareId` |

### useComparison

| Besoin playlist | Couvert par useComparison | Action |
|---|---|---|
| `comparisonModeOptions`, `comparisonMode`, `isComparing`, `isComparisonOverlay`, `overlayOpacity` | Oui | Réexporter depuis `usePlaylistComparison` |
| `taskTypeOptions` (source : `currentEntity.preview_files`, pas `entityPreviewFiles`) | Non (source différente) | Logique propre dans `usePlaylistComparison` |
| `revisionToCompare` au lieu de `previewToCompareId` (revision résolue par entité) | Non | Logique propre |
| `entityListToCompare` (résolution preview par entité de la playlist) | Non | Logique propre |
| `comparisonEntityMissing` (le task-type sauvegardé n'existe pas dans l'entité courante) | Non | Logique propre |
| `savedTaskTypeToCompare` (persistance côté store) | Non | Logique propre |
| `toggleComparison`, `goToPrev/NextComparison`, `toggleFullOverlay` | Oui (au moins partiellement) | Réutilisable, peut-être à reprendre avec setDefault* propres au playlist |

### PlayerPlaybackBar

| Besoin playlist | Couvert | Action |
|---|---|---|
| Play/pause, animation 3D combo, repeat, HD/LD, sound, speed, time/frame indicators | Oui | Adopter |
| Toggle `isWaveformDisplayed` (lecture sound playlist) | Non | **Ajouter v-model optionnel `isWaveformDisplayed`** (PreviewPlayer peut l'ignorer) |
| Toggle `isShowAnnotationsWhilePlaying` | Non | **Ajouter v-model optionnel** ; ouvre la voie à l'activation côté PreviewPlayer (backlog) |
| Compteur `framesSeenOfPicture` pour les séquences d'images | Non | **Slot `#extra-controls`** (playlist-spécifique) |
| Navigation multi-preview-file par entité (`currentEntityPreviewLength > 1`) | Non | **Slot `#extra-controls`** |
| Bouton "change task type" modal | Non | **Slot `#extra-controls`** |
| Variable de mode `isFullMode` (différente sémantique de `fullScreen`/`light` de la bar) | Partiel | À mapper côté parent ; à voir si la bar a besoin d'une prop supplémentaire |

### PlayerAnnotationBar

Audit ciblé à faire au moment d'attaquer l'étape 3 (laser mode notamment, et la séparation entre bloc annotation et bloc 3D-model).

## Stratégie

**Principe directeur : extension par slot et v-model optionnels.** Les bars restent maigres, orientées partage. Les besoins playlist-spécifiques passent par des slots nommés (`#missing`, `#extra-controls`) ou par des v-model optionnels que `PreviewPlayer` peut ignorer. Pas de prop "isPlaylist", pas de branches conditionnelles dans la bar.

**Composable comparison : `usePlaylistComparison` qui compose `useComparison`.** Le nouveau composable réutilise les primitives génériques (`comparisonModeOptions`, `isComparisonOverlay`, `overlayOpacity`, `toggleFullOverlay`) et ajoute les concepts propres playlist (`revisionToCompare`, `entityListToCompare`, `comparisonEntityMissing`, `rebuildComparisonOptions`, `rebuildEntityListToCompare`). Cela évite de complexifier `useComparison` avec un mode `playlist`, et garde une séparation nette.

## Plan d'exécution

### Étape 1 — PlayerComparisonBar + usePlaylistComparison

1. `PlayerComparisonBar.vue` : ajouter un slot `#missing` (rendu après les comboboxes, dans le même flexrow).
2. Créer `src/composables/playlistComparison.js` exportant `usePlaylistComparison`. Inputs : `currentEntity`, `entityList`, `taskTypeMap`, `savedTaskTypeToCompare` (ref de store), `t`. Outputs : tous les états et actions actuellement dans `PlaylistPlayer` pour la comparaison.
3. `PlaylistPlayer.vue` :
   - Remplacer le bloc inline de comparison dans le template par `<PlayerComparisonBar>` + slot `#missing`.
   - Remplacer `getComparisonTaskTypeOptions`, `rebuildComparisonOptions`, `rebuildRevisionOptions`, `rebuildEntityListToCompare`, `resetComparison`, `onCompareClicked`, `onPreviousComparisonPictureClicked`, `onNextComparisonPictureClicked`, `toggleFullOverlayComparison`, et les refs associées par les bindings de `usePlaylistComparison`.
   - Le côté store (`savedTaskTypeToCompare` → action store) reste dans le composant ; le composable ne touche pas le store.

**Critère de succès :** PlaylistPlayer perd ~250 à 400 lignes (template + script combinés). Tests unitaires verts. Test manuel : toggle comparison, switch task-type avec et sans match, switch revision, navigation prev/next préview de comparaison, side-by-side et tous les overlays (0/25/50/75/100 + toggle full overlay), comparison dans une preview room.

### Étape 2 — PlayerPlaybackBar

1. `PlayerPlaybackBar.vue` :
   - Ajouter v-models optionnels `isWaveformDisplayed` (avec icône waveform et bouton conditionnel) et `isShowAnnotationsWhilePlaying` (bouton conditionnel).
   - Ajouter un slot `#extra-controls` rendu après la zone time/frame.
   - Garder le rendu actuel de PreviewPlayer inchangé (v-models par défaut à `false`, slot vide).
2. `PlaylistPlayer.vue` :
   - Remplacer le bloc playback inline par `<PlayerPlaybackBar>` + slot `#extra-controls` (où vont : compteur framesSeenOfPicture, navigation multi-preview-file, bouton change task type).
   - Mapper `isFullMode` ↔ props de la bar (à clarifier au moment de l'implémentation).

**Critère de succès :** PlaylistPlayer perd ~150 à 250 lignes. Tests unitaires verts. Test manuel : play/pause, repeat, HD/LD, son, speed, waveform on/off, "show annotations while playing" on/off, navigation multi-preview-file dans une entité, séquence d'images.

### Étape 3 — PlayerAnnotationBar

Audit ciblé au moment d'attaquer, puis même schéma (slot pour laser mode si nécessaire, v-model optionnels si laser mode est un state partagé).

## Hors scope

- Activer "show annotations while playing" et "handle-in/out markers" dans **PreviewPlayer**. Ces items du backlog (`project_preview_player_followups.md`) deviennent triviaux après l'étape 2 — mais on les active dans une session dédiée pour ne pas mélanger deux refactors.
- Extraction des autres concerns playlist-spécifiques (`useBuildExport`, `useEntityNavigation`, `useSoundWaveform`, `usePicturePlayback`) — c'est l'approche B / la suite. À traiter après les 3 étapes ci-dessus.
- Refactor des sous-composants `previews/` non-bars (viewers, `PlaylistProgress`, `VideoProgress`). Les viewers sont déjà bien découpés.

## Risques et points ouverts

1. **`previewToCompare` (preview file id) vs `revisionToCompare` (revision string)** : la bar accepte une string générique côté v-model, donc OK ; mais il faut veiller à ce que les watchers côté composable utilisent bien le sens correct (resolve par entité dans le playlist composable).
2. **`isFullMode` côté playlist vs `fullScreen`/`light` côté bar** : sémantique partiellement différente. À clarifier dans l'étape 2 — possiblement renommer/aligner.
3. **Preview room broadcast** (`updateRoomStatus` appelé quand le mode comparison change) : doit rester déclenché ; à brancher dans le watcher du composable ou via un callback `onComparisonModeChanged` passé en input.
4. **Slot vs prop** pour le warning : le slot donne plus de flexibilité (le parent peut décider du contenu i18n) au coût d'une légère cérémonie. À confirmer à l'implémentation.

## Suite

Une fois ce design validé et commité, lancer `writing-plans` pour produire le plan d'exécution détaillé de **l'étape 1 uniquement** (Comparison + usePlaylistComparison). Les étapes 2 et 3 auront leur propre plan une fois l'étape 1 livrée.
