<template>
  <button
    :class="{
      button: true,
      active: active,
      'is-on': isOn,
      'is-loading': isLoading,
      'is-primary': isPrimary
    }"
    :disabled="disabled"
    :title="title"
    :type="type"
    @click="$emit('click')"
  >
    <grid-icon :class="iconClass" v-if="icon === 'grid'" />
    <send-icon :class="iconClass" v-if="icon === 'send'" />
    <paperclip-icon :class="iconClass" v-if="icon === 'attach'" />
    <corner-left-down-icon :class="iconClass" v-if="icon === 'undo'" />
    <corner-right-down-icon :class="iconClass" v-if="icon === 'redo'" />
    <save-icon :class="iconClass" v-if="icon === 'save'" />
    <plus-icon :class="iconClass" v-if="icon === 'plus'" />
    <minus-icon :class="iconClass" v-if="icon === 'minus'" />
    <message-square-icon :class="iconClass" v-if="icon === 'comment'" />
    <download-icon :class="iconClass" v-if="icon === 'download'" />
    <upload-icon :class="iconClass" v-if="icon === 'upload'" />
    <film-icon :class="iconClass" v-if="icon === 'film'" />
    <pause-icon :class="iconClass" v-if="icon === 'pause'" />
    <edit-icon :class="iconClass" v-if="icon === 'edit'" />
    <image-icon :class="iconClass" v-if="icon === 'image'" />
    <maximize-icon :class="iconClass" v-if="icon === 'maximize'" />
    <rotate-ccw-icon :class="iconClass" v-if="icon === 'restore'" />
    <skip-back-icon :class="iconClass" v-if="icon === 'back'" />
    <skip-forward-icon :class="iconClass" v-if="icon === 'forward'" />
    <chevron-down-icon :class="iconClass" v-if="icon === 'down'" />
    <chevron-left-icon :class="iconClass" v-if="icon === 'left'" />
    <chevron-right-icon :class="iconClass" v-if="icon === 'right'" />
    <x-icon :class="iconClass" v-if="icon === 'remove'" />
    <edit2-icon :class="iconClass" v-if="icon === 'pencil'" />
    <layers-icon :class="iconClass" v-if="icon === 'layers'" />
    <list-icon :class="iconClass" v-if="icon === 'list'" />
    <filter-icon :class="iconClass" v-if="icon === 'funnel'" />
    <refresh-cw-icon :class="iconClass" v-if="icon === 'refresh'" />
    <triangle-icon :class="iconClass" v-if="icon === 'triangle'" />
    <music-icon :class="iconClass" v-if="icon === 'music'" />
    <square-icon :class="iconClass" v-if="icon === 'eraser'" />
    <key-icon :class="iconClass" v-if="icon == 'key'" />
    <zoom-in-icon :class="iconClass" v-if="icon == 'loupe'" />
    <globe-icon :class="iconClass" v-if="icon == 'globe'" />
    <codepen-icon :class="iconClass" v-if="icon == 'codepen'" />
    <kitsu-icon
      :name="icon"
      :class="iconClass"
      :title="title"
      v-if="
        [
          'big-thumbnail',
          'box',
          'compare',
          'check',
          'delete',
          'export',
          'export-lines',
          'filter',
          'import',
          'import-edl',
          'import-files',
          'laser',
          'pen',
          'play',
          'repeat',
          'soundon',
          'soundoff',
          'type',
          'trash',
          'user',
          'waveform'
        ].includes(icon)
      "
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
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CodepenIcon,
  CornerLeftDownIcon,
  CornerRightDownIcon,
  DownloadIcon,
  EditIcon,
  Edit2Icon,
  GlobeIcon,
  GridIcon,
  FilmIcon,
  FilterIcon,
  ImageIcon,
  KeyIcon,
  LayersIcon,
  ListIcon,
  MaximizeIcon,
  MessageSquareIcon,
  MinusIcon,
  MusicIcon,
  PaperclipIcon,
  PauseIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SaveIcon,
  SendIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SquareIcon,
  TriangleIcon,
  UploadIcon,
  XIcon,
  ZoomInIcon
} from 'vue-feather-icons'

import KitsuIcon from '@/components/widgets/KitsuIcon'

export default {
  name: 'button-simple',
  components: {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CodepenIcon,
    CornerLeftDownIcon,
    CornerRightDownIcon,
    DownloadIcon,
    EditIcon,
    Edit2Icon,
    FilmIcon,
    FilterIcon,
    GlobeIcon,
    GridIcon,
    ImageIcon,
    KeyIcon,
    KitsuIcon,
    LayersIcon,
    ListIcon,
    ZoomInIcon,
    MaximizeIcon,
    MessageSquareIcon,
    MinusIcon,
    MusicIcon,
    PaperclipIcon,
    PauseIcon,
    PlusIcon,
    RefreshCwIcon,
    RotateCcwIcon,
    SaveIcon,
    SendIcon,
    SkipBackIcon,
    SkipForwardIcon,
    SquareIcon,
    UploadIcon,
    TriangleIcon,
    XIcon
  },

  props: {
    active: {
      default: false,
      type: Boolean
    },
    disabled: {
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
    isSmall: {
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
    },
    type: {
      type: String,
      validator: value => ['submit', 'button', 'reset'].includes(value)
    }
  },

  computed: {
    isText() {
      return this.text && this.text.length > 0
    },

    iconClass() {
      return {
        icon: true,
        'only-icon': !this.isText
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.button {
  border-radius: 10px;
  padding: 0 10px;
}

.button .icon {
  min-height: 16px;
  min-width: 16px;
  max-height: 16px;
  min-width: 16px;
}

.is-primary {
  border-radius: 2em;
}

.active {
  box-shadow: inset 0 0 2px 2px var(--box-shadow);
}
</style>
