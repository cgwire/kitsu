<template>
  <router-link class="button" :title="title" :to="path">
    <span class="icon is-small" v-if="icon?.startsWith('fa')">
      <i :class="`fa ${icon}`"></i>
    </span>
    <plus-icon class="icon is-small" v-else-if="icon === 'plus'" />
    <download-icon class="icon is-small" v-else-if="icon === 'download'" />
    <upload-icon class="icon is-small" v-else-if="icon === 'upload'" />
    <edit-icon class="icon is-small" v-else-if="icon === 'edit'" />
    <trash-icon class="icon is-small" v-else-if="icon === 'delete'" />
    <rotate-ccw-icon class="icon is-small" v-else-if="icon === 'restore'" />
    <span
      :class="{
        'is-hidden-touch': isResponsive
      }"
      v-if="text"
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
} from 'lucide-vue-next'

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
      type: String
    },
    title: {
      type: String
    },
    path: {
      required: true,
      type: [String, Object]
    },
    icon: {
      type: String
    },
    isResponsive: {
      default: false,
      type: Boolean
    }
  }
}
</script>
