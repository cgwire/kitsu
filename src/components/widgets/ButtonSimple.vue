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
    <send-icon :class="iconClass" v-else-if="icon === 'send'" />
    <paperclip-icon :class="iconClass" v-else-if="icon === 'attach'" />
    <corner-left-down-icon :class="iconClass" v-else-if="icon === 'undo'" />
    <corner-right-down-icon :class="iconClass" v-else-if="icon === 'redo'" />
    <save-icon :class="iconClass" v-else-if="icon === 'save'" />
    <plus-icon :class="iconClass" v-else-if="icon === 'plus'" />
    <minus-icon :class="iconClass" v-else-if="icon === 'minus'" />
    <message-square-icon :class="iconClass" v-else-if="icon === 'comment'" />
    <download-icon :class="iconClass" v-else-if="icon === 'download'" />
    <film-icon :class="iconClass" v-else-if="icon === 'film'" />
    <pause-icon :class="iconClass" v-else-if="icon === 'pause'" />
    <edit-icon :class="iconClass" v-else-if="icon === 'edit'" />
    <image-icon :class="iconClass" v-else-if="icon === 'image'" />
    <maximize-icon :class="iconClass" v-else-if="icon === 'maximize'" />
    <skip-back-icon :class="iconClass" v-else-if="icon === 'back'" />
    <skip-forward-icon :class="iconClass" v-else-if="icon === 'forward'" />
    <chevron-down-icon :class="iconClass" v-else-if="icon === 'down'" />
    <chevron-left-icon :class="iconClass" v-else-if="icon === 'left'" />
    <chevron-right-icon :class="iconClass" v-else-if="icon === 'right'" />
    <x-icon :class="iconClass" v-else-if="icon === 'remove'" />
    <edit2-icon :class="iconClass" v-else-if="icon === 'pencil'" />
    <layers-icon :class="iconClass" v-else-if="icon === 'layers'" />
    <list-icon :class="iconClass" v-else-if="icon === 'list'" />
    <triangle-icon :class="iconClass" v-else-if="icon === 'triangle'" />
    <music-icon :class="iconClass" v-else-if="icon === 'music'" />
    <square-icon :class="iconClass" v-else-if="icon === 'eraser'" />
    <key-icon :class="iconClass" v-else-if="icon == 'key'" />
    <zoom-in-icon :class="iconClass" v-else-if="icon == 'loupe'" />
    <globe-icon :class="iconClass" v-else-if="icon == 'globe'" />
    <codepen-icon :class="iconClass" v-else-if="icon == 'codepen'" />
    <link-icon :class="iconClass" v-else-if="icon == 'link'" />
    <clock-icon :class="iconClass" v-else-if="icon == 'clock'" />
    <kitsu-icon
      :name="icon"
      :class="iconClass"
      :title="title"
      :active="active"
      v-else-if="icon !== ''"
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
  ClockIcon,
  CodepenIcon,
  CornerLeftDownIcon,
  CornerRightDownIcon,
  DownloadIcon,
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
} from 'vue-feather-icons'

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
.is-primary {
  border-radius: 2em;
}

.active {
  box-shadow: inset 0 0 2px 2px var(--box-shadow);
}
</style>
