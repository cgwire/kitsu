<template>
<router-link
  class="button"
  :to="path"
>
  <span class="icon is-small" v-if="icon.length > 0 && icon.startsWith('fa')">
    <i :class="'fa ' + icon"></i>
  </span>
  <plus-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': onlyIcon
    }" v-if="icon === 'plus'"></plus-icon>
  <download-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': onlyIcon
    }" v-if="icon === 'download'"></download-icon>
  <upload-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': onlyIcon
    }" v-if="icon === 'upload'"></upload-icon>
  <edit-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': onlyIcon
    }" v-if="icon === 'edit'"></edit-icon>
  <trash-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': onlyIcon
    }" v-if="icon === 'delete'"></trash-icon>
  <rotate-ccw-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': onlyIcon
    }" v-if="icon === 'restore'"></rotate-ccw-icon>

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
  },
  computed: {
    onlyIcon: () => !this.text || this.text.length === 0
  }
}
</script>

<style scoped>
.button .icon.is-small.only-icon {
  margin-right: 0;
}
</style>
