<template>
<a
  :title="title"
  :class="'button ' + styleclass"
  :href="path"
  :target="target"
>
  <span class="icon is-small" v-if="icon.length > 0 && icon.startsWith('fa')">
    <i :class="'fa ' + icon"></i>
  </span>
  <plus-icon class="icon is-small" v-if="icon === 'plus'" />
  <download-icon class="icon is-small" v-if="icon === 'download'" />
  <upload-icon class="icon is-small" v-if="icon === 'upload'" />
  <span class="text is-hidden-touch">
    {{ text }}
  </span>
</a>
</template>

<script>
import { PlusIcon, DownloadIcon, UploadIcon } from 'vue-feather-icons'

export default {
  name: 'button-href-link',
  components: {
    PlusIcon,
    DownloadIcon,
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
</style>
