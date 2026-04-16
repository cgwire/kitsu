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

<script>
import { ArrowUpRightIcon, DownloadIcon, XIcon } from 'lucide-vue-next'

import { getDownloadAttachmentPath } from '@/lib/path'

import { modalMixin } from '@/components/modals/base_modal'

export default {
  name: 'preview-modal',

  mixins: [modalMixin],

  components: {
    ArrowUpRightIcon,
    DownloadIcon,
    XIcon
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    previewFileId: {
      type: String,
      default: ''
    },
    attachment: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel'],

  computed: {
    previewPath() {
      if (this.previewFileId) {
        return this.active
          ? `/api/pictures/originals/preview-files/${this.previewFileId}.png`
          : ''
      }
      if (this.attachment) {
        return getDownloadAttachmentPath(this.attachment)
      }
      return ''
    },

    previewDlPath() {
      return `/api/pictures/originals/preview-files/${this.previewFileId}/download`
    }
  }
}
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
