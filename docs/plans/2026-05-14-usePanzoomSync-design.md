# `usePanzoomSync` — Design

**Date** : 2026-05-14
**Branche** : `refactoring-review`
**Scope** : extraire la logique de tracking de la transform panzoom partagée
entre `SharedPlaylistPlayer` et (à terme) `PreviewPlayer`, et préparer le
terrain pour l'objectif final : annoter en zoomant/panant dans
`PreviewPlayer`.

## Contexte

Aujourd'hui le tracking de la transform panzoom existe sous deux formes
incompatibles dans la base de code :

- **`SharedPlaylistPlayer`** : `panzoomTransform: Ref<{x,y,scale}>` mis à
  jour via `@panzoom-changed`, passé en prop à `SharedAnnotationOverlay`
  qui applique `fabric.setViewportTransform(...)` sur le canvas
  d'annotation. Les annotations suivent le zoom en temps réel.
- **`PreviewPlayer`** : pas de tracking. Le toggle `isZoomPan` est modal :
  zoom ON cache le fabric canvas (`v-show="!isZoomPan && …"`), zoom OFF
  reset à scale 1. Annotations et zoom sont mutuellement exclusifs.

Cap visé : faire converger `PreviewPlayer` vers le pattern overlay-live
(annotations toujours visibles, suivent la transform). Mais on y va
progressivement.

## Approche choisie

Composable minimal, agnostique du viewer : `state + handlers`.

```js
// src/composables/panzoom.js
import { ref } from 'vue'

export function usePanzoomSync() {
  const transform = ref({ x: 0, y: 0, scale: 1 })

  const onPanzoomChanged = ({ x, y, scale }) => {
    transform.value = { x, y, scale }
  }

  const reset = () => {
    transform.value = { x: 0, y: 0, scale: 1 }
  }

  const applyTo = fabricCanvas => {
    if (!fabricCanvas) return
    const { x, y, scale } = transform.value
    fabricCanvas.setViewportTransform([scale, 0, 0, scale, x, y])
    fabricCanvas.requestRenderAll()
  }

  return { transform, onPanzoomChanged, reset, applyTo }
}
```

**Pourquoi pas un composable couplé au viewer (qui encapsulerait aussi
`resumeZoom`/`pauseZoom`)** : la gestion impérative du panzoom underlying
(via `PreviewViewer.resumeZoom`/`pauseZoom`/`resetZoom`) est corrélée à
plusieurs états dans `PreviewPlayer` (`isAnnotationsDisplayed`,
`isDrawing`, `isTyping`) qui n'ont rien à voir avec le tracking de la
transform. Mélanger les deux responsabilités élargirait l'API du
composable sans bénéfice.

## Mode comparison (PreviewPlayer)

Décision : zoom synchronisé sur les deux viewers. Une seule instance de
`usePanzoomSync` par `PreviewPlayer`. Le viewer comparison adoptera la
même transform que le viewer principal en phase 3 (en propageant
impérativement via `PictureViewer.setPanZoom` qui existe déjà).

## Découpage en phases

### Phase 1 — Extraction + adoption dans `SharedPlaylistPlayer`

Remplace exactement le code dupliqué actuel
(`SharedPlaylistPlayer.vue:265, 608-610, 744`) :

```js
import { usePanzoomSync } from '@/composables/panzoom'

const { transform: panzoomTransform, onPanzoomChanged, reset: resetPanzoomTransform } =
  usePanzoomSync()

// dans watch(isZoomEnabled, …)
resetPanzoomTransform()
```

- L'alias `transform: panzoomTransform` préserve le nom utilisé dans le
  template (`:panzoom-transform="panzoomTransform"`).
- `applyTo` n'est **pas** consommé par `SharedPlaylistPlayer` : la cible
  (fabric canvas dans `SharedAnnotationOverlay`) est dans un autre
  composant qui reçoit `panzoomTransform` en prop et applique lui-même
  (`SharedAnnotationOverlay.vue:217-223`). Ce flux prop-down reste tel
  quel pour cette PR.
- Comportement strictement identique. Zéro changement visible.

### Phase 2 — Adoption dans `PreviewPlayer` (modal préservé) + fix bug comparison

**2a. Fix du bug "comparisonViewer figé en zoom-pan"**

`PreviewPlayer.vue:2095-2101` aujourd'hui :

```js
watch(isZoomPan, () => {
  if (isZoomPan.value) {
    previewViewer.value.resumeZoom()
  } else {
    previewViewer.value.pauseZoom()
  }
})
```

→ Symétriser sur les deux viewers + reset :

```js
watch(isZoomPan, enabled => {
  const viewers = [previewViewer.value, comparisonViewer.value]
  if (enabled) {
    viewers.forEach(v => v?.resumeZoom())
  } else {
    viewers.forEach(v => {
      v?.pauseZoom()
      v?.resetZoom()
    })
    resetPanzoomTransform()
  }
})
```

**2b. Brancher `usePanzoomSync` (uniquement `reset` pour l'instant)**

```js
const { transform: panzoomTransform, onPanzoomChanged, reset: resetPanzoomTransform, applyTo: applyPanzoomTo } =
  usePanzoomSync()
```

Phase 2 = on n'ajoute que ce qu'on utilise : `resetPanzoomTransform()`
aux endroits où les viewers sont reset (`watch(isZoomPan)` ci-dessus,
`onAnnotationDisplayedClicked` au `PreviewPlayer.vue:1450-1456`,
`clearPreview` au `:2052`). `onPanzoomChanged`, `applyTo` et la ref
`transform`/`panzoomTransform` ne sont pas branchés en phase 2 — ils
arrivent en phase 3.

### Phase 3 — Annoter en zoomant dans `PreviewPlayer` (esquisse, hors de ce design doc)

Pour vérifier que l'API phase 1 est suffisante :

1. Retirer `v-show="!isZoomPan && …"` sur `canvas-wrapper` et
   `canvas-comparison-wrapper` → les fabric canvases sont toujours dans
   le DOM.
2. Retirer le `resetZoom` automatique dans
   `onAnnotationDisplayedClicked` et `watch(isAnnotationsDisplayed)`.
3. Dans `useAnnotation`, ajouter `applyPanzoomToCanvas(transform)` qui
   appelle `fabricCanvas.setViewportTransform(...)` sur les deux canvases
   (main + comparison). Soit injecté en paramètre du composable, soit
   exposé pour que le composant le wire avec `watch(transform,
   applyPanzoomToCanvas)`.
4. Brancher `@panzoom-changed="onPanzoomChanged"` sur le main viewer.
5. Synchroniser le panzoom underlying du comparison viewer sur celui du
   main via `PictureViewer.setPanZoom` (existe déjà,
   `PictureViewer.vue:333-351`). Ajouter l'équivalent côté video si
   besoin.

**Risque connu** : le canvas comparison du `PreviewPlayer` est shifté de
`getDimensions().width / 2` dans `fixCanvasComparisonSize`. Suivre la
transform live avec `setViewportTransform` va probablement nécessiter
d'ajuster ce positionnement. À traiter en phase 3.

## Tests

### Unitaires (composable) — `tests/unit/composables/panzoom.spec.js`

Le folder `tests/unit/composables/` n'existe pas encore, à créer.

Cas :

- État initial : `transform.value` égal à `{x:0, y:0, scale:1}`.
- `onPanzoomChanged({x:10, y:20, scale:2})` → `transform.value` reflète
  exactement.
- `reset()` après modification → revient à `{0,0,1}`.
- `applyTo(null)` / `applyTo(undefined)` → no-op, ne lève pas.
- `applyTo(fakeCanvas)` avec transform non-identité → `setViewportTransform`
  appelé avec `[scale, 0, 0, scale, x, y]` + `requestRenderAll` appelé.
  Fake canvas = objet avec deux spies (pas de stub fabric global).
- Réactivité : muter via `onPanzoomChanged` puis lire — la valeur
  retournée est la même ref que celle exposée.

### Consommateurs

Pas de nouveaux specs. Ni `SharedPlaylistPlayer` ni `PreviewPlayer` n'ont
de couverture aujourd'hui — c'est un refactor sans changement observable
côté UX en phase 1, et un fix isolé en phase 2.

### Vérif manuelle (phase 2)

- Task avec preview vidéo + une révision précédente → comparison mode →
  activer zoom-pan → **les deux** viewers zooment (2a).
- Désactiver zoom-pan → les deux reviennent à scale 1, transform interne
  reset.
- SharedPlaylistPlayer : lancer un playlist partagé, vérifier que les
  annotations suivent toujours le zoom (régression possible si l'alias
  `transform: panzoomTransform` est mal câblé).

## Risques et hors-scope

- **Hors-scope phase 1/2** : refonte du positionnement du canvas
  comparison dans `PreviewPlayer`.
- **Risque transverse** : le bug fix 2a change un comportement observable
  (les deux viewers zooment au lieu d'un seul). Si un utilisateur s'en
  était inconsciemment accommodé, c'est un changement de feel — assumé
  car le comportement actuel est clairement un oubli, pas un design.
- **Aucun risque côté SharedPlaylistPlayer** : refactor pur, même
  comportement, mêmes événements, mêmes consommateurs.
