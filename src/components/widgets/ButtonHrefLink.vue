<template>
  <a class="button" :title="title" :href="path" :target="target">
    <plus-icon class="icon is-small" v-if="icon === 'plus'" />
    <download-icon class="icon is-small" v-if="icon === 'download'" />
    <upload-icon class="icon is-small" v-if="icon === 'upload'" />
    <list-icon class="icon is-small" v-if="icon === 'list'" />
    <kitsu-icon
      :name="icon"
      class="icon is-small"
      v-if="['export', 'export-lines'].includes(icon)"
    />
    <span class="text is-hidden-touch" v-if="text">
      {{ text }}
    </span>
  </a>
</template>

<script>
import { DownloadIcon, ListIcon, PlusIcon, UploadIcon } from 'vue-feather-icons'
import KitsuIcon from '@/components/widgets/KitsuIcon'

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
      default: '',
      type: String
    },
    path: {
      default: '',
      type: String
    },
    icon: {
      default: '',
      type: String
    },
    title: {
      default: '',
      type: String
    },
    styleclass: {
      default: '',
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
.button .icon.is-small {
  margin: 0;
}

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
