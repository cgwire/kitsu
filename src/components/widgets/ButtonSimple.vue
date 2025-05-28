<template>
  <button
    class="button"
    :class="{
      active,
      'is-on': isOn,
      'is-loading': isLoading,
      'is-primary': isPrimary,
      'is-big': isBig,
      'is-thin': isThin
    }"
    :disabled="disabled"
    :title="title"
    :type="type"
    @click="$emit('click', $event)"
  >
    <grid-icon class="icon" v-if="icon === 'grid'" />
    <send-icon class="icon" v-else-if="icon === 'send'" />
    <paperclip-icon class="icon" v-else-if="icon === 'attach'" />
    <corner-left-down-icon class="icon" v-else-if="icon === 'undo'" />
    <corner-right-down-icon class="icon" v-else-if="icon === 'redo'" />
    <save-icon class="icon" v-else-if="icon === 'save'" />
    <plus-icon class="icon" v-else-if="icon === 'plus'" />
    <minus-icon class="icon" v-else-if="icon === 'minus'" />
    <message-square-icon class="icon" v-else-if="icon === 'comment'" />
    <download-icon class="icon" v-else-if="icon === 'download'" />
    <film-icon class="icon" v-else-if="icon === 'film'" />
    <pause-icon class="icon" v-else-if="icon === 'pause'" />
    <edit-icon class="icon" v-else-if="icon === 'edit'" />
    <image-icon class="icon" v-else-if="icon === 'image'" />
    <maximize-icon class="icon" v-else-if="icon === 'maximize'" />
    <skip-back-icon class="icon" v-else-if="icon === 'back'" />
    <skip-forward-icon class="icon" v-else-if="icon === 'forward'" />
    <chevron-down-icon class="icon" v-else-if="icon === 'down'" />
    <chevron-left-icon class="icon" v-else-if="icon === 'left'" />
    <chevron-right-icon class="icon" v-else-if="icon === 'right'" />
    <x-icon class="icon" v-else-if="icon === 'remove'" />
    <edit2-icon class="icon" v-else-if="icon === 'pencil'" />
    <layers-icon class="icon" v-else-if="icon === 'layers'" />
    <list-icon class="icon" v-else-if="icon === 'list'" />
    <triangle-icon class="icon" v-else-if="icon === 'triangle'" />
    <music-icon class="icon" v-else-if="icon === 'music'" />
    <square-icon class="icon" v-else-if="icon === 'eraser'" />
    <key-icon class="icon" v-else-if="icon === 'key'" />
    <zoom-in-icon class="icon" v-else-if="icon === 'loupe'" />
    <globe-icon class="icon" v-else-if="icon === 'globe'" />
    <codepen-icon class="icon" v-else-if="icon === 'codepen'" />
    <link-icon class="icon" v-else-if="icon === 'link'" />
    <clock-icon class="icon" v-else-if="icon === 'clock'" />
    <file-digit-icon
      class="icon"
      :stroke-width="1.2"
      v-else-if="icon === 'file-digit'"
    />
    <kitsu-icon
      class="icon"
      :name="icon"
      :title="title"
      :active="active"
      v-else-if="icon !== ''"
    />
    <span
      :class="{
        'is-hidden-touch': isResponsive
      }"
      v-if="text"
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
  ClockIcon,
  CodepenIcon,
  CornerLeftDownIcon,
  CornerRightDownIcon,
  DownloadIcon,
  FileDigitIcon,
  EditIcon,
  Edit2Icon,
  GlobeIcon,
  GridIcon,
  FilmIcon,
  ImageIcon,
  KeyIcon,
  LayersIcon,
  LinkIcon,
  ListIcon,
  MaximizeIcon,
  MessageSquareIcon,
  MinusIcon,
  MusicIcon,
  PaperclipIcon,
  PauseIcon,
  PlusIcon,
  SaveIcon,
  SendIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SquareIcon,
  TriangleIcon,
  XIcon,
  ZoomInIcon
} from 'lucide-vue-next'

import KitsuIcon from '@/components/widgets/KitsuIcon.vue'

export default {
  name: 'button-simple',

  components: {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    CodepenIcon,
    CornerLeftDownIcon,
    CornerRightDownIcon,
    DownloadIcon,
    EditIcon,
    Edit2Icon,
    FileDigitIcon,
    FilmIcon,
    GlobeIcon,
    GridIcon,
    ImageIcon,
    KeyIcon,
    KitsuIcon,
    LayersIcon,
    LinkIcon,
    ListIcon,
    MaximizeIcon,
    MessageSquareIcon,
    MinusIcon,
    MusicIcon,
    PaperclipIcon,
    PauseIcon,
    PlusIcon,
    SaveIcon,
    SendIcon,
    SkipBackIcon,
    SkipForwardIcon,
    SquareIcon,
    TriangleIcon,
    XIcon,
    ZoomInIcon
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
    isBig: {
      default: false,
      type: Boolean
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
    isThin: {
      default: false,
      type: Boolean
    },
    text: {
      type: String
    },
    title: {
      type: String
    },
    type: {
      type: String,
      validator: value => ['submit', 'button', 'reset'].includes(value)
    }
  },

  emits: ['click']
}
</script>

<style lang="scss" scoped>
.is-primary {
  border-radius: 10px;
}

.is-big {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0.5em 1em;
}

.is-thin {
  border-radius: 6px;
  font-size: 0.8rem;
  padding: 0.25em 0.5em;
}

.active {
  box-shadow: inset 0 0 2px 2px var(--box-shadow);
}
</style>
