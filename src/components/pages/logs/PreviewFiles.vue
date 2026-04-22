<template>
  <div class="mt1">
    <p class="flexrow">
      <em class="flexrow-item">{{ $t('logs.preview_files.explanation') }}</em>
      <span class="filler"></span>
      <button-simple
        class="flexrow-item"
        icon="refresh"
        :is-loading="loading.previewFiles"
        :title="$t('main.reload')"
        @click="reload"
      />
    </p>
    <div class="has-text-centered" v-if="loading.previewFiles">
      <spinner />
    </div>
    <p class="empty" v-else-if="!previewFiles.length">
      {{ $t('logs.preview_files.empty_list') }}
    </p>
    <template v-else>
      <preview-file-list
        :preview-files="previewFiles"
        :is-loading="loading.previewFiles"
        @mark-broken-clicked="markBrokenClicked"
      />
      <div class="has-text-centered mt1" v-if="hasMorePreviewFiles">
        <button-simple
          :is-loading="loading.morePreviewFiles"
          :text="$t('main.load_more')"
          @click="loadMorePreviewFiles"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import PreviewFileList from '@/components/lists/PreviewFileList.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const PAGE_SIZE = 100

const store = useStore()

// State

const hasMorePreviewFiles = ref(false)
const previewFiles = ref([])
const loading = reactive({
  previewFiles: false,
  morePreviewFiles: false
})

// Functions

const reload = async () => {
  previewFiles.value = []
  loading.previewFiles = true
  try {
    const result = await store.dispatch('getRunningPreviewFiles', {
      limit: PAGE_SIZE
    })
    previewFiles.value = result
    hasMorePreviewFiles.value = result.length >= PAGE_SIZE
  } catch (err) {
    console.error(err)
  } finally {
    loading.previewFiles = false
  }
}

const loadMorePreviewFiles = async () => {
  if (!previewFiles.value.length) return

  loading.morePreviewFiles = true
  const lastPreviewFileId = previewFiles.value[previewFiles.value.length - 1].id
  try {
    const result = await store.dispatch('getRunningPreviewFiles', {
      limit: PAGE_SIZE,
      lastPreviewFileId
    })
    previewFiles.value = [...previewFiles.value, ...result]
    hasMorePreviewFiles.value = result.length >= PAGE_SIZE
  } catch (err) {
    console.error(err)
  } finally {
    loading.morePreviewFiles = false
  }
}

const markBrokenClicked = async previewFileId => {
  const previewFile = previewFiles.value.find(p => p.id === previewFileId)
  previewFile.status = 'broken'
  await store.dispatch('markPreviewFileAsBroken', previewFileId)
}

// Lifecycle

onMounted(reload)
</script>

<style lang="scss" scoped>
.empty {
  color: var(--text);
  font-size: 1.2em;
  font-weight: 500;
  margin-top: 1em;
  text-align: center;
}

em {
  color: var(--text);
}
</style>
