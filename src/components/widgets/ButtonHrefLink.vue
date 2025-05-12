<template>
  <a class="button" :title="title" :href="path" :target="target">
    <plus-icon class="icon is-small" v-if="icon === 'plus'" />
    <download-icon class="icon is-small" v-else-if="icon === 'download'" />
    <upload-icon class="icon is-small" v-else-if="icon === 'upload'" />
    <list-icon class="icon is-small" v-else-if="icon === 'list'" />
    <kitsu-icon
      class="icon is-small"
      :name="icon"
      v-else-if="['export', 'export-lines'].includes(icon)"
    />
    <span class="is-hidden-touch" v-if="text">
      {{ text }}
    </span>
  </a>
</template>

<script>
import { DownloadIcon, ListIcon, PlusIcon, UploadIcon } from 'lucide-vue-next'

import KitsuIcon from '@/components/widgets/KitsuIcon.vue'

export default {
  name: 'button-href-link',

  components: {
    DownloadIcon,
    KitsuIcon,
    ListIcon,
    PlusIcon,
    UploadIcon
  },

  props: {
    text: {
      type: String
    },
    path: {
      required: true,
      type: String
    },
    icon: {
      default: '',
      type: String
    },
    title: {
      type: String
    },
    target: {
      default: '_self',
      type: String
    }
  }
}
</script>

<style lang="scss" scoped>
.button {
  border-radius: 10px;
}

.button .icon {
  min-height: 18px;
  min-width: 18px;
  max-height: 18px;
  min-width: 18px;
}
</style>
