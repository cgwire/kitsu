<template>
<button
  :class="{
    button: true,
    active: active,
    'is-primary': isPrimary,
    'is-loading': isLoading,
    'is-on': isOn
  }"
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
  <save-icon
    :class="iconClass"
    v-if="icon === 'save'"
  />
  <plus-icon
    :class="iconClass"
    v-if="icon === 'plus'"
  />
  <minus-icon
    :class="iconClass"
    v-if="icon === 'minus'"
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
  <filter-icon
    :class="iconClass"
    v-if="icon === 'funnel'"
  />
  <refresh-cw-icon
    :class="iconClass"
    v-if="icon === 'refresh'"
  />
  <repeat-icon
    :class="iconClass"
    v-if="icon === 'repeat'"
  />
  <volume-x-icon
    :class="iconClass"
    v-if="icon === 'soundoff'"
  />
  <volume-2-icon
    :class="iconClass"
    v-if="icon === 'soundon'"
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
  FilterIcon,
  ImageIcon,
  LayersIcon,
  ListIcon,
  MaximizeIcon,
  MessageSquareIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  RepeatIcon,
  RotateCcwIcon,
  SaveIcon,
  SkipBackIcon,
  SkipForwardIcon,
  TrashIcon,
  TypeIcon,
  UploadIcon,
  VolumeXIcon,
  Volume2Icon,
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
    FilterIcon,
    ImageIcon,
    LayersIcon,
    ListIcon,
    MaximizeIcon,
    MessageSquareIcon,
    MinusIcon,
    PauseIcon,
    PlayIcon,
    PlusIcon,
    RefreshCwIcon,
    RepeatIcon,
    RotateCcwIcon,
    SaveIcon,
    SkipBackIcon,
    SkipForwardIcon,
    TrashIcon,
    TypeIcon,
    UploadIcon,
    VolumeXIcon,
    Volume2Icon,
    XIcon
  },

  props: {
    active: {
      default: false,
      type: Boolean
    },
    icon: {
      default: '',
      type: String
    },
    isOn: {
      default: false,
      type: Boolean
    },
    isLoading: {
      default: false,
      type: Boolean
    },
    isPrimary: {
      default: false,
      type: Boolean
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

.is-primary {
  border-radius: 2em;
}

.active {
  box-shadow: inset 0 0 2px 2px var(--box-shadow)
}
</style>
