<template>
<router-link
  class="button"
  :title="title"
  :to="path"
>
  <span class="icon is-small" v-if="icon.length > 0 && icon.startsWith('fa')">
    <i :class="'fa ' + icon"></i>
  </span>
  <plus-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': !isText
    }" v-if="icon === 'plus'" />
  <download-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': !isText
    }" v-if="icon === 'download'" />
  <upload-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': !isText
    }" v-if="icon === 'upload'" />
  <edit-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': !isText
    }" v-if="icon === 'edit'" />
  <trash-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': !isText
    }" v-if="icon === 'delete'" />
  <rotate-ccw-icon
    :class="{
      icon: true,
      'is-small': true,
      'only-icon': !isText
    }" v-if="icon === 'restore'" />

  <span
    :class="{
      text: true,
      'is-hidden-touch': isResponsive
    }"
    v-if="isText"
  >
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
    title: {
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
    isText () {
      return this.text && this.text.length > 0
    }
  }
}
</script>

<style lang="scss" scoped>
.button .icon.is-small.only-icon {
  margin-right: 0;
}
</style>
