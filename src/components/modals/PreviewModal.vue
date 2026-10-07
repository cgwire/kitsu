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
        download
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
      <span
        class="pointer"
        :title="$t('main.close')"
        role="button"
        tabindex="0"
        @click="$emit('cancel')"
        @keydown.enter.prevent="$emit('cancel')"
        @keydown.space.prevent="$emit('cancel')"
      >
        <x-icon />
      </span>
    </div>
    <div class="modal-content" @click="$emit('cancel')">
      <!-- Keyed: browsing must not leave the previous picture on screen
           while the next one loads. -->
      <img
        :key="previewPath"
        :src="previewPath"
        :alt="attachment?.name"
        v-if="previewPath"
      />
    </div>
    <button
      class="browse previous"
      type="button"
      :title="$t('main.previous')"
      @click="$emit('change', previousId)"
      v-if="previousId"
    >
      <chevron-left-icon :size="32" />
    </button>
    <button
      class="browse next"
      type="button"
      :title="$t('main.next')"
      @click="$emit('change', nextId)"
      v-if="nextId"
    >
      <chevron-right-icon :size="32" />
    </button>
  </div>
</template>

<script setup>
import {
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  XIcon
} from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, toRef } from 'vue'

import { useModal } from '@/composables/modal'
import { getDownloadAttachmentPath } from '@/lib/path'

const props = defineProps({
  active: { type: Boolean, default: false },
  attachment: { type: Object, default: () => ({}) },
  previewFileId: { type: String, default: '' },
  // the previews the arrows walk through, the shown one included
  previewFileIds: { type: Array, default: () => [] }
})

const emit = defineEmits(['cancel', 'change'])

useModal(toRef(props, 'active'), emit)

const index = computed(() => props.previewFileIds.indexOf(props.previewFileId))
const previousId = computed(() =>
  index.value > 0 ? props.previewFileIds[index.value - 1] : null
)
const nextId = computed(() =>
  index.value > -1 ? (props.previewFileIds[index.value + 1] ?? null) : null
)

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

const onKeyDown = event => {
  if (!props.active) return
  const targetId = { ArrowLeft: previousId, ArrowRight: nextId }[event.key]
  if (targetId?.value) emit('change', targetId.value)
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
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

.browse {
  background: rgba(0, 0, 0, 0.4);
  border: 0;
  border-radius: 50%;
  color: $light-grey;
  cursor: pointer;
  display: flex;
  padding: 8px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    color: $white;
  }

  &.previous {
    left: 1em;
  }

  &.next {
    right: 1em;
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
