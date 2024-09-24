<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>
    <div class="new-window">
      <a class="mr1" :href="previewDlPath" v-if="previewFileId">
        <arrow-down-icon />
      </a>
      <a target="_blank" :href="previewPath">
        <arrow-up-right-icon />
      </a>
    </div>

    <div class="modal-content" @click="$emit('cancel')">
      <img :src="previewPath" />
    </div>
  </div>
</template>

<script>
import { ArrowDownIcon, ArrowUpRightIcon } from 'lucide-vue-next'

import { getDownloadAttachmentPath } from '@/lib/path'

import { modalMixin } from '@/components/modals/base_modal'

export default {
  name: 'preview-modal',

  mixins: [modalMixin],

  components: {
    ArrowDownIcon,
    ArrowUpRightIcon
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
        const id = this.previewFileId
        return this.active && this.previewFileId
          ? '/api/pictures/originals/preview-files/' + id + '.png'
          : ''
      } else if (this.attachment) {
        return getDownloadAttachmentPath(this.attachment)
      }
      return ''
    },

    previewDlPath() {
      const previewId = this.previewFileId
      return `/api/pictures/originals/preview-files/${previewId}/download`
    }
  }
}
</script>

<style lang="scss" scoped>
.error {
  margin-top: 1em;
}

.new-window {
  color: $grey;
  position: absolute;
  right: 1em;
  top: 1em;
  z-index: 2;
}

.modal-content {
  width: 100%;
  text-align: center;
  max-height: 100vh;

  img {
    max-height: 100vh;
  }
}
</style>
