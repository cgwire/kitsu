/*
 * Composable for the preview player's comparison mode.
 *
 * Owns the comparison state (selected task type / preview / mode /
 * cursor), the derived option lists, and the pure selection actions
 * (toggle, navigate, defaults). Side-effects that depend on the
 * viewers or the annotation composable (syncing frames, loading
 * comparison annotations) stay in the consumer's own watchers — this
 * composable does no watch() of its own.
 */
import { computed, nextTick, ref } from 'vue'

import { formatRevision } from '@/lib/preview'

export const useComparison = ({
  entityPreviewFiles,
  currentPreview,
  taskTypeMap,
  currentProduction,
  t
}) => {
  // State
  const isComparing = ref(false)
  const taskTypeId = ref('')
  const previewToCompareId = ref(null)
  const previewToCompare = ref(null)
  const comparisonPreviewIndex = ref(0)
  const comparisonMode = ref('sidebyside')

  // Map of available preview files indexed by id, populated from
  // entityPreviewFiles whenever taskTypeId changes. Kept outside Vue
  // reactivity because it's just a lookup helper.
  let previewFileMap = {}

  const resetPreviewFileMap = () => {
    previewFileMap = {}
    const files = entityPreviewFiles.value?.[taskTypeId.value]
    if (!files) return
    files.forEach(file => {
      previewFileMap[file.id] = file
    })
  }

  const resolvePreviewToCompare = id => previewFileMap[id] ?? null

  // Computed
  const comparisonModeOptions = computed(() => [
    { label: t('playlists.actions.side_by_side'), value: 'sidebyside' },
    { label: `${t('playlists.actions.overlay')} 0%`, value: 'overlay0' },
    { label: `${t('playlists.actions.overlay')} 25%`, value: 'overlay25' },
    { label: `${t('playlists.actions.overlay')} 50%`, value: 'overlay50' },
    { label: `${t('playlists.actions.overlay')} 75%`, value: 'overlay75' },
    { label: `${t('playlists.actions.overlay')} 100%`, value: 'overlay100' }
  ])

  const comparisonPreview = computed(() => {
    const compared = previewToCompare.value
    if (compared?.previews?.length > 0 && comparisonPreviewIndex.value > 0) {
      return compared.previews[comparisonPreviewIndex.value - 1]
    }
    return compared
  })

  const comparisonPreviewLength = computed(() => {
    const previews = previewToCompare.value?.previews
    return previews ? previews.length + 1 : previewToCompare.value ? 0 : 0
  })

  const comparisonAnnotations = computed(() =>
    previewToCompare.value && isComparing.value
      ? previewToCompare.value.annotations
      : []
  )

  const taskTypeOptions = computed(() => {
    const files = entityPreviewFiles.value
    const map = taskTypeMap.value
    if (!files || !map) return []
    return Object.keys(files)
      .filter(id => {
        const previewFiles = files[id].filter(p =>
          ['mp4', 'png'].includes(p.extension)
        )
        return previewFiles.length > 0 && map.get(id)
      })
      .map(id => {
        const taskType = map.get(id)
        return { label: taskType.name, value: taskType.id }
      })
  })

  const previewFileOptions = computed(() => {
    const files = entityPreviewFiles.value?.[taskTypeId.value]
    if (!files || files.length === 0) return []
    return files.map(file => ({
      label: formatRevision(file.revision, currentProduction?.value),
      value: file.id
    }))
  })

  const isComparisonOverlay = computed(
    () => comparisonMode.value !== 'sidebyside' && isComparing.value
  )

  const overlayOpacity = computed(() => {
    if (!isComparing.value || !isComparisonOverlay.value) return 1
    const opacities = {
      overlay0: 0,
      overlay25: 0.25,
      overlay50: 0.5,
      overlay75: 0.75,
      overlay100: 1
    }
    return opacities[comparisonMode.value] ?? 1
  })

  // Actions
  const setDefaultComparisonPreview = () => {
    const files = entityPreviewFiles.value?.[taskTypeId.value]
    if (!files) {
      previewToCompareId.value = null
      return
    }
    const otherFiles = files.filter(p => p.id !== currentPreview.value?.id)
    previewToCompareId.value = otherFiles.length > 0 ? otherFiles[0].id : null
  }

  const setDefaultComparisonTaskType = () => {
    if (!entityPreviewFiles.value) return
    const taskTypeIds = Object.keys(entityPreviewFiles.value)
    if (taskTypeIds.length === 0) {
      previewToCompareId.value = null
      return
    }
    const previewId = currentPreview.value?.id
    const matching = taskTypeOptions.value.find(
      option =>
        entityPreviewFiles.value[option.value].findIndex(
          p => p.id === previewId
        ) >= 0
    )
    if (matching) {
      taskTypeId.value = matching.value
    } else if (taskTypeOptions.value.length > 0) {
      taskTypeId.value = taskTypeOptions.value[0].value
    }
    if (taskTypeId.value) setDefaultComparisonPreview()
  }

  const toggleComparison = () => {
    if (isComparing.value) {
      isComparing.value = false
      return
    }
    isComparing.value = true
    const firstTaskType = taskTypeOptions.value[0]
    taskTypeId.value = firstTaskType?.value ?? ''
    // Clear then set on next tick so previewFileOptions recomputes
    // between the two assignments and watchers see a real change.
    previewToCompareId.value = ''
    nextTick(() => {
      previewToCompareId.value = previewFileOptions.value[0]?.value ?? null
    })
  }

  const goToPreviousComparison = () => {
    const index = comparisonPreviewIndex.value - 1
    comparisonPreviewIndex.value =
      index < 0 ? comparisonPreviewLength.value - 1 : index
  }

  const goToNextComparison = () => {
    const index = comparisonPreviewIndex.value + 1
    comparisonPreviewIndex.value =
      index > comparisonPreviewLength.value - 1 ? 0 : index
  }

  // Activates comparison if needed, then flips between fully visible
  // (overlay100) and fully transparent (overlay0). The waits let the
  // comparison viewer mount and lay out before opacity kicks in.
  const toggleFullOverlay = async () => {
    if (!isComparing.value) {
      isComparing.value = true
      await nextTick()
      await nextTick()
    }
    nextTick(() => {
      comparisonMode.value =
        comparisonMode.value === 'overlay100' ? 'overlay0' : 'overlay100'
    })
  }

  return {
    // State
    isComparing,
    taskTypeId,
    previewToCompareId,
    previewToCompare,
    comparisonPreviewIndex,
    comparisonMode,

    // Computed
    comparisonModeOptions,
    comparisonPreview,
    comparisonPreviewLength,
    comparisonAnnotations,
    taskTypeOptions,
    previewFileOptions,
    isComparisonOverlay,
    overlayOpacity,

    // Actions
    toggleComparison,
    setDefaultComparisonTaskType,
    setDefaultComparisonPreview,
    goToPreviousComparison,
    goToNextComparison,
    toggleFullOverlay,
    resetPreviewFileMap,
    resolvePreviewToCompare
  }
}
