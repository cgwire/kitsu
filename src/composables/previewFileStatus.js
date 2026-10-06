import { computed, inject, ref, toValue, watch } from 'vue'
import { storeKey } from 'vuex'

import { latestPreviewFileStatus } from '@/lib/preview'

// Zou answers 404 for the pictures of a preview file until a job has built
// them. The socket keeps the statuses it announces in the store, which some
// specs render the thumbnails without.
export const usePreviewFileStatus = (previewFileId, givenStatus) => {
  const store = inject(storeKey, null)
  const reloadQuery = ref('')

  const knownStatus = computed(() =>
    store?.getters.previewFileStatusMap?.get(toValue(previewFileId))
  )
  const status = computed(
    () =>
      latestPreviewFileStatus(toValue(givenStatus), knownStatus.value) ||
      'ready'
  )
  const isProcessing = computed(() => status.value === 'processing')
  const isBroken = computed(() => ['broken', 'missing'].includes(status.value))

  const reload = () => {
    reloadQuery.value = `?t=${Date.now()}`
  }

  // A picture asked for while its files were being built got a 404 that its
  // img keeps: a new URL makes the browser ask again.
  watch(knownStatus, known => {
    if (known === 'ready') reload()
  })

  return { isBroken, isProcessing, reload, reloadQuery }
}
