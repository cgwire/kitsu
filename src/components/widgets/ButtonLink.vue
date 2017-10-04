<template>
<router-link
  class="button"
  :to="path"
>

  <span class="icon is-small" v-if="icon.length > 0 && icon.startsWith('fa')">
    <i :class="'fa ' + icon"></i>
  </span>
  <plus-icon class="icon is-small" v-if="icon === 'plus'"></plus-icon>
  <download-icon class="icon is-small" v-if="icon === 'download'"></download-icon>
  <upload-icon class="icon is-small" v-if="icon === 'upload'"></upload-icon>

  <span class="text is-hidden-touch" v-if="text.length > 0">
    {{ text }}
  </span>
</router-link>
</template>

<script>
import { PlusIcon, DownloadIcon, UploadIcon } from 'vue-feather-icons'

export default {
  name: 'button-link',
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
      default: ''
    },
    icon: {
      default: '',
      type: String
    }
  }
}
</script>

<style scoped>
</style>
