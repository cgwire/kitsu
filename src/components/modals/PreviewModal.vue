<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>
    <div class="actions">
      <a
        :href="previewDlPath"
        :title="$t('playlists.actions.download_file')"
        v-if="previewFileId"
      >
        <download-icon />
      </a>
      <a
        :href="previewPath"
        target="_blank"
        :title="$t('playlists.actions.see_original_file')"
      >
        <arrow-up-right-icon />
      </a>
      <span class="pointer" :title="$t('main.close')" @click="$emit('cancel')">
        <x-icon />
      </span>
    </div>
    <div class="modal-content" @click="$emit('cancel')">
      <img :src="previewPath" />
    </div>
  </div>
</template>

<script setup>
import { ArrowUpRightIcon, DownloadIcon, XIcon } from 'lucide-vue-next'
import { computed, toRef } from 'vue'

import { useModal } from '@/composables/modal'
import { getDownloadAttachmentPath } from '@/lib/path'

const props = defineProps({
  active: { type: Boolean, default: false },
  attachment: { type: Object, default: () => ({}) },
  previewFileId: { type: String, default: '' }
})

const emit = defineEmits(['cancel'])

useModal(toRef(props, 'active'), emit)

const previewPath = computed(() => {
  if (props.previewFileId) {
    return props.active
      ? `/api/pictures/originals/preview-files/${props.previewFileId}.png`
      : ''
  }
  if (props.attachment) {
    return getDownloadAttachmentPath(props.attachment)
  }
  return ''
})

const previewDlPath = computed(
  () => `/api/pictures/originals/preview-files/${props.previewFileId}/download`
)
</script>

<style lang="scss" scoped>
.actions {
  display: inline-flex;
  gap: 1em;
  color: $grey;
  position: absolute;
  right: 1em;
  top: 1em;
  z-index: 2;

  & > *:hover {
    color: $light-grey;
  }
}

.modal-content {
  width: 100%;
  text-align: center;
  max-height: 100vmax;

  img {
    max-height: 100vh;
  }
}
</style>
