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
  <Edit-icon class="icon is-small" v-if="icon === 'edit'"></edit-icon>
  <trash-icon class="icon is-small" v-if="icon === 'delete'"></trash-icon>
  <rotate-ccw-icon class="icon is-small" v-if="icon === 'restore'"></rotate-ccw-icon>

  <span
    :class="{
      text: true,
      'is-hidden-touch': isResponsive
    }" v-if="text.length > 0">
    {{ text }}
  </span>
</router-link>
</template>

<script>
import {
  DownloadIcon,
  EditIcon,
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
  UploadIcon
} from 'vue-feather-icons'

export default {
  name: 'button-link',
  components: {
    DownloadIcon,
    EditIcon,
    PlusIcon,
    RotateCcwIcon,
    TrashIcon,
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
    },
    isResponsive: {
      default: false,
      type: Boolean
    }
  }
}
</script>

<style scoped>
</style>
