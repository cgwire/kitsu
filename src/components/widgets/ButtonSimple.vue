<template>
<button
  class="button"
  @click="$emit('click')"
>
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
</button>
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
  name: 'button-simple',
  components: {
    DownloadIcon,
    EditIcon,
    PlusIcon,
    RotateCcwIcon,
    TrashIcon,
    UploadIcon
  },
  props: {
    icon: {
      default: '',
      type: String
    },
    isResponsive: {
      default: false,
      type: Boolean
    },
    text: {
      default: '',
      type: String
    },
  },
  computed: {
    isText () {
      return this.text && this.text.length > 0
    }
  }
}
</script>

<style scoped>
.button .icon.is-small.only-icon {
  margin-right: 0;
}
</style>
