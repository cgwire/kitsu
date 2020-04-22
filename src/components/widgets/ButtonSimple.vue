<template>
<button
  class="button"
  :title="title"
  @click="$emit('click')"
>
  <corner-left-down-icon
    :class="iconClass"
    v-if="icon === 'undo'"
  />
  <corner-right-down-icon
    :class="iconClass"
    v-if="icon === 'redo'"
  />
  <plus-icon
    :class="iconClass"
    v-if="icon === 'plus'"
  />
  <message-square-icon
    :class="iconClass"
    v-if="icon === 'comment'"
  />
  <download-icon
    :class="iconClass"
    v-if="icon === 'download'"
  />
  <upload-icon
    :class="iconClass"
    v-if="icon === 'upload'"
  />
  <film-icon
    :class="iconClass"
    v-if="icon === 'film'"
  />
  <play-icon
    :class="iconClass"
    v-if="icon === 'play'"
  />
  <pause-icon
    :class="iconClass"
    v-if="icon === 'pause'"
  />
  <edit-icon
    :class="iconClass"
    v-if="icon === 'edit'"
  />
  <image-icon
    :class="iconClass"
    v-if="icon === 'image'"
  />
  <maximize-icon
    :class="iconClass"
    v-if="icon === 'maximize'"
  />
  <trash-icon
    :class="iconClass"
    v-if="icon === 'delete'"
  />
  <rotate-ccw-icon
    :class="iconClass"
    v-if="icon === 'restore'"
  />
  <skip-back-icon
    :class="iconClass"
    v-if="icon === 'back'"
  />
  <skip-forward-icon
    :class="iconClass"
    v-if="icon === 'forward'"
  />
  <chevron-left-icon
    :class="iconClass"
    v-if="icon === 'left'"
  />
  <chevron-right-icon
    :class="iconClass"
    v-if="icon === 'right'"
  />
  <copy-icon
    :class="iconClass"
    v-if="icon === 'compare'"
  />
  <x-icon
    :class="iconClass"
    v-if="icon === 'remove'"
  />
  <edit2-icon
    :class="iconClass"
    v-if="icon === 'pencil'"
  />
  <layers-icon
    :class="iconClass"
    v-if="icon === 'layers'"
  />
  <type-icon
    :class="iconClass"
    v-if="icon === 'type'"
  />
  <list-icon
    :class="iconClass"
    v-if="icon === 'list'"
  />

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
  ChevronLeftIcon,
  ChevronRightIcon,
  CornerLeftDownIcon,
  CornerRightDownIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  Edit2Icon,
  FilmIcon,
  ImageIcon,
  LayersIcon,
  ListIcon,
  MaximizeIcon,
  MessageSquareIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
  SkipBackIcon,
  SkipForwardIcon,
  TrashIcon,
  TypeIcon,
  UploadIcon,
  XIcon
} from 'vue-feather-icons'

export default {
  name: 'button-simple',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    CornerLeftDownIcon,
    CornerRightDownIcon,
    CopyIcon,
    DownloadIcon,
    EditIcon,
    Edit2Icon,
    FilmIcon,
    ImageIcon,
    LayersIcon,
    ListIcon,
    MaximizeIcon,
    MessageSquareIcon,
    PauseIcon,
    PlayIcon,
    PlusIcon,
    RotateCcwIcon,
    SkipBackIcon,
    SkipForwardIcon,
    TrashIcon,
    TypeIcon,
    UploadIcon,
    XIcon
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
    title: {
      default: '',
      type: String
    }
  },

  computed: {
    isText () {
      return this.text && this.text.length > 0
    },

    iconClass () {
      return {
        icon: true,
        'is-small': true,
        'only-icon': !this.isText
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.icon.is-small.only-icon {
  margin-right: 0;
}
</style>
