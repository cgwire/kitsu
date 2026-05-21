/*
 * Composable for the PlaylistPlayer's comparison mode.
 *
 * Owns the playlist-specific comparison state (revision selection
 * per-entity, entity-list-to-compare, comparison-entity-missing flag,
 * picture-index inside the compared revision) and reuses the generic
 * primitives from useComparison (mode options, overlay math, the
 * shared `isComparing` / `taskTypeId` / `comparisonMode` refs and the
 * toggle-full-overlay helper).
 */
import { computed, ref } from 'vue'

import { useComparison } from '@/composables/comparison'

export const usePlaylistComparison = ({
  currentEntity,
  entityList,
  taskTypeMap,
  t
}) => {
  // Shared base — feed useComparison the current entity's preview files
  // so its taskTypeOptions logic (which we don't use) sees something
  // coherent, and so its comparisonModeOptions/overlay computeds stay
  // accurate.
  const entityPreviewFiles = computed(
    () => currentEntity.value?.preview_files || {}
  )
  const currentPreview = ref(null) // unused by playlist mode, satisfies useComparison shape
  const base = useComparison({
    entityPreviewFiles,
    currentPreview,
    taskTypeMap,
    t
  })

  // Playlist-specific state
  const revisionToCompare = ref(null)
  const comparisonEntityMissing = computed(() => {
    if (!savedTaskTypeToCompare.value) return false
    if (taskTypeOptions.value.length === 0) return false
    return !taskTypeOptions.value.some(
      o => o.value === savedTaskTypeToCompare.value
    )
  })
  const currentComparisonPreviewIndex = ref(0)
  const savedTaskTypeToCompare = ref(null)

  // Playlist-specific computeds (placeholders, filled in subsequent tasks)
  const taskTypeOptions = computed(() => {
    const entity = currentEntity.value
    if (!entity?.preview_files) return []
    const map = taskTypeMap.value
    return Object.keys(entity.preview_files)
      .filter(id => entity.preview_files[id] && map.get(id))
      .map(id => ({ label: map.get(id).name, value: id }))
      .sort(
        (a, b) => -a.label.localeCompare(b.label, undefined, { numeric: true })
      )
  })
  const revisionOptions = computed(() => {
    const entity = currentEntity.value
    const files = entity?.preview_files?.[base.taskTypeId.value]
    if (!files) return []
    const revisions = files.map(p => p.revision).sort((a, b) => b - a)
    return [
      { label: 'Last', value: null },
      ...revisions.map(r => ({ label: `v${r}`, value: `${r}` }))
    ]
  })
  const entityListToCompare = computed(() => {
    if (!base.taskTypeId.value) return []
    return entityList.value.map(entity => {
      const previewFiles = entity?.preview_files
      if (!previewFiles || Object.keys(previewFiles).length === 0) {
        return { preview_file_id: '', preview_file_extension: 'none' }
      }
      let key = base.taskTypeId.value
      let files = previewFiles[key]
      if (!files) {
        key = Object.keys(previewFiles)[0]
        files = previewFiles[key]
      }
      const preview =
        files?.find(p => `${p.revision}` === revisionToCompare.value) ||
        files?.[0]
      if (!preview) {
        return { preview_file_id: '', preview_file_extension: 'none' }
      }
      return {
        preview_file_id: preview.id,
        preview_file_extension: preview.extension
      }
    })
  })

  const currentRevisionToCompare = computed(() => {
    const entity = currentEntity.value
    const files = entity?.preview_files?.[base.taskTypeId.value]
    if (!files || files.length === 0) return null
    const match = files.find(p => `${p.revision}` === revisionToCompare.value)
    return match || files[0]
  })

  const currentPreviewToCompare = computed(() => {
    const revision = currentRevisionToCompare.value
    if (!revision) return null
    if (currentComparisonPreviewIndex.value > 0) {
      return (
        revision.previews?.[currentComparisonPreviewIndex.value - 1] || null
      )
    }
    return revision
  })

  const currentComparisonPreviewLength = computed(() => {
    const revision = currentRevisionToCompare.value
    if (!revision) return 0
    const previews = revision.previews
    return previews ? previews.length + 1 : 0
  })

  const comparisonAnnotations = computed(() =>
    base.isComparing.value && currentRevisionToCompare.value
      ? currentRevisionToCompare.value.annotations || []
      : []
  )

  const goToPreviousComparisonPicture = () => {
    const index = currentComparisonPreviewIndex.value - 1
    currentComparisonPreviewIndex.value =
      index < 0 ? currentComparisonPreviewLength.value - 1 : index
  }

  const goToNextComparisonPicture = () => {
    const index = currentComparisonPreviewIndex.value + 1
    currentComparisonPreviewIndex.value =
      index > currentComparisonPreviewLength.value - 1 ? 0 : index
  }

  const toggleComparison = () => {
    if (base.isComparing.value) {
      base.isComparing.value = false
      return
    }
    if (taskTypeOptions.value.length === 0) {
      base.isComparing.value = true
      return
    }
    base.isComparing.value = true
    const saved = savedTaskTypeToCompare.value
    const isAvailable = taskTypeOptions.value.some(o => o.value === saved)
    base.taskTypeId.value = isAvailable ? saved : taskTypeOptions.value[0].value
    revisionToCompare.value = null
  }

  return {
    // Shared from useComparison
    isComparing: base.isComparing,
    taskTypeId: base.taskTypeId,
    comparisonMode: base.comparisonMode,
    comparisonModeOptions: base.comparisonModeOptions,
    isComparisonOverlay: base.isComparisonOverlay,
    overlayOpacity: base.overlayOpacity,
    toggleFullOverlay: base.toggleFullOverlay,

    // Playlist-specific actions
    toggleComparison,
    goToPreviousComparisonPicture,
    goToNextComparisonPicture,

    // Playlist-specific state
    revisionToCompare,
    entityListToCompare,
    comparisonEntityMissing,
    currentComparisonPreviewIndex,
    savedTaskTypeToCompare,

    // Playlist-specific computeds (filled in next tasks)
    taskTypeOptions,
    revisionOptions,
    currentRevisionToCompare,
    currentPreviewToCompare,
    currentComparisonPreviewLength,
    comparisonAnnotations
  }
}
