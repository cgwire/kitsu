<template>
  <div class="flexrow" v-if="isMovie || isPicture">
    <button-simple
      class="flexrow-item"
      icon="undo"
      :title="$t('playlists.actions.annotation_undo')"
      v-if="!readOnly && fullScreen && !isConcept"
      @click="$emit('undo')"
    />

    <button-simple
      class="flexrow-item flexrow-item"
      :title="$t('playlists.actions.annotation_redo')"
      icon="redo"
      v-if="!readOnly && fullScreen && !isConcept"
      @click="$emit('redo')"
    />

    <button-simple
      icon="pen"
      :title="$t('playlists.actions.toggle_annotations')"
      :active="isAnnotationsDisplayed"
      @click="$emit('annotation-displayed-clicked')"
      v-if="(isPicture || isMovie) && (!light || fullScreen) && !isConcept"
    />

    <button-simple
      class="flexrow-item"
      icon="loupe"
      :active="isZoomPan"
      :title="$t('playlists.actions.annotation_zoom_pan')"
      @click="$emit('zoom-pan-clicked')"
      v-if="(!light || fullScreen) && !isConcept"
    />

    <onion-skin-picker
      v-bind="pickerState('onion')"
      :is-on="isOnionSkinOn"
      :frames="onionSkinFrames"
      @change="onOnionChange"
      v-if="isMovie && (!light || fullScreen) && !isConcept"
    />

    <transition name="slide">
      <div class="annotation-tools" v-show="isTyping && (!light || fullScreen)">
        <color-picker
          v-bind="pickerState('text-color')"
          :color="textColor"
          @change="$emit('change-text-color', $event)"
        />
      </div>
    </transition>

    <button-simple
      class="flexrow-item"
      icon="type"
      :active="isTyping"
      :title="$t('playlists.actions.annotation_text')"
      @click="$emit('type-clicked')"
      v-if="!readOnly && (!light || fullScreen) && !isConcept"
    />

    <transition name="slide">
      <div
        class="annotation-tools"
        v-show="isDrawing && (!light || fullScreen)"
      >
        <pencil-picker
          v-bind="pickerState('draw-pencil')"
          :pencil="pencilWidth"
          :sizes="pencilPalette"
          @change="$emit('change-pencil-width', $event)"
        />
        <color-picker
          v-bind="pickerState('draw-color')"
          :color="pencilColor"
          @change="$emit('change-pencil-color', $event)"
        />
      </div>
    </transition>

    <button-simple
      class="flexrow-item"
      icon="pencil"
      :active="isDrawing"
      :title="$t('playlists.actions.annotation_draw')"
      @click="$emit('pencil-annotate-clicked')"
      v-if="!readOnly && (!light || fullScreen) && !isConcept"
    />

    <transition name="slide">
      <div
        class="annotation-tools"
        v-show="isShapeMode && (!light || fullScreen)"
      >
        <shape-picker
          v-bind="pickerState('shape')"
          :shape="currentShape"
          @change="$emit('change-shape', $event)"
        />
        <pencil-picker
          v-bind="pickerState('shape-pencil')"
          :pencil="pencilWidth"
          :sizes="pencilPalette"
          @change="$emit('change-pencil-width', $event)"
        />
        <color-picker
          v-bind="pickerState('shape-color')"
          :color="pencilColor"
          @change="$emit('change-pencil-color', $event)"
        />
      </div>
    </transition>

    <button-simple
      class="flexrow-item"
      icon="shapes"
      :active="isShapeMode"
      :title="$t('playlists.actions.annotation_shape')"
      @click="$emit('shape-mode-clicked')"
      v-if="
        isShapeMode !== undefined &&
        !readOnly &&
        (!light || fullScreen) &&
        !isConcept
      "
    />

    <button-simple
      class="flexrow-item"
      icon="laser"
      :active="isLaserModeOn"
      :title="$t('playlists.actions.toggle_laser')"
      @click="isLaserModeOn = !isLaserModeOn"
      v-if="
        isLaserModeOn !== undefined &&
        !readOnly &&
        (!light || fullScreen) &&
        !isConcept
      "
    />

    <transition name="slide">
      <div
        class="annotation-tools"
        v-show="isEraserModeOn && (!light || fullScreen)"
      >
        <pencil-picker
          v-bind="pickerState('eraser-pencil')"
          :pencil="pencilWidth"
          :sizes="pencilPalette"
          @change="$emit('change-pencil-width', $event)"
        />
      </div>
    </transition>

    <button-simple
      class="flexrow-item"
      icon="eraser"
      :active="isEraserModeOn"
      :title="$t('playlists.actions.annotation_erase')"
      @click="$emit('erase-clicked')"
      v-if="
        isEraserModeOn !== undefined &&
        !readOnly &&
        (!light || fullScreen) &&
        !isConcept
      "
    />

    <button-simple
      class="flexrow-item"
      icon="delete"
      :title="$t('playlists.actions.annotation_delete')"
      @click="$emit('delete-clicked')"
      v-if="!readOnly && fullScreen && !isConcept"
    />

    <button-simple
      class="button playlist-button flexrow-item"
      icon="comment"
      :active="!isCommentsHidden"
      :title="$t('playlists.actions.comments')"
      @click="$emit('comment-clicked')"
      v-if="!readOnly && (fullScreen || showCommentsButton)"
    />
  </div>

  <div class="flexrow" v-if="is3DModel">
    <combobox-styled
      class="background-combo mr05"
      :active="Boolean(currentBackground)"
      :disabled="!productionBackgrounds.length"
      :is-compact="(light && !fullScreen) || !productionBackgrounds.length"
      is-reversed
      keep-order
      thin
      :options="backgroundOptions"
      @change="$emit('object-background-selected')"
      v-if="backgroundOptions.length > 0"
      v-model="currentBackground"
    >
      <template #icon>
        <globe-icon class="icon is-small mr05" />
      </template>
    </combobox-styled>
    <button-simple
      class="flexrow-item"
      :active="isObjectBackground && isEnvironmentSkybox"
      :disabled="!objectBackgroundUrl || !isObjectBackground"
      icon="image"
      :title="$t('playlists.actions.toggle_environment_skybox')"
      @click="isEnvironmentSkybox = !isEnvironmentSkybox"
      v-if="!light || (fullScreen && backgroundOptions.length > 0)"
    />
    <button-simple
      class="flexrow-item"
      :active="isWireframe"
      icon="box"
      :title="$t('playlists.actions.toggle_wireframe')"
      @click="isWireframe = !isWireframe"
    />
  </div>
</template>

<script setup>
import { GlobeIcon } from 'lucide-vue-next'
import { ref } from 'vue'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ColorPicker from '@/components/players/bars/ColorPicker.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import OnionSkinPicker from '@/components/players/bars/OnionSkinPicker.vue'
import PencilPicker from '@/components/players/bars/PencilPicker.vue'
import ShapePicker from '@/components/players/bars/ShapePicker.vue'

defineProps({
  backgroundOptions: {
    type: Array,
    default: () => []
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  is3DModel: {
    type: Boolean,
    default: false
  },
  isAnnotationsDisplayed: {
    type: Boolean,
    default: true
  },
  isCommentsHidden: {
    type: Boolean,
    default: true
  },
  isConcept: {
    type: Boolean,
    default: false
  },
  isDrawing: {
    type: Boolean,
    default: false
  },
  isMovie: {
    type: Boolean,
    default: false
  },
  isObjectBackground: {
    type: Boolean,
    default: false
  },
  isPicture: {
    type: Boolean,
    default: false
  },
  isTyping: {
    type: Boolean,
    default: false
  },
  isZoomPan: {
    type: Boolean,
    default: false
  },
  light: {
    type: Boolean,
    default: false
  },
  objectBackgroundUrl: {
    type: String,
    default: null
  },
  pencilColor: {
    type: String,
    default: '#000'
  },
  pencilPalette: {
    type: Array,
    default: () => ['huge', 'big', 'medium', 'small', 'tiny']
  },
  pencilWidth: {
    type: String,
    default: 'big'
  },
  productionBackgrounds: {
    type: Array,
    default: () => []
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  showCommentsButton: {
    type: Boolean,
    default: false
  },
  textColor: {
    type: String,
    default: '#ff3860'
  }
})

defineEmits([
  'annotation-displayed-clicked',
  'change-pencil-color',
  'change-pencil-width',
  'change-shape',
  'change-text-color',
  'comment-clicked',
  'delete-clicked',
  'erase-clicked',
  'object-background-selected',
  'pencil-annotate-clicked',
  'redo',
  'shape-mode-clicked',
  'type-clicked',
  'undo',
  'zoom-pan-clicked'
])

const currentBackground = defineModel('currentBackground')
const isEnvironmentSkybox = defineModel('isEnvironmentSkybox', {
  default: false
})
const isWireframe = defineModel('isWireframe', { default: false })
const isLaserModeOn = defineModel('isLaserModeOn', { default: undefined })
const isEraserModeOn = defineModel('isEraserModeOn', { default: undefined })
const isShapeMode = defineModel('isShapeMode', { default: undefined })
const currentShape = defineModel('currentShape', { default: undefined })
const isOnionSkinOn = defineModel('isOnionSkinOn', { default: false })
const onionSkinFrames = defineModel('onionSkinFrames', { default: 2 })

// The picker emits a combined { enabled, frames } so the on/off state and
// the span stay in sync (picking a number turns it on, "Off" disables it).
const onOnionChange = ({ enabled, frames }) => {
  isOnionSkinOn.value = enabled
  onionSkinFrames.value = frames
}

// Tracks which picker dropdown is currently open. Each picker is
// driven through v-model so opening one closes the others — only
// one panel is visible at a time.
const openPicker = ref(null)
const pickerState = id => ({
  modelValue: openPicker.value === id,
  'onUpdate:modelValue': value => (openPicker.value = value ? id : null)
})
</script>

<style lang="scss" scoped>
.annotation-tools {
  align-items: stretch;
  background: $dark-grey;
  display: flex;
  height: 33px;
  max-width: 200px;
  // position + z-index lift the whole tools group above the
  // annotation overlay (z-index 500) so picker dropdowns aren't
  // rendered underneath the drawing canvas.
  position: relative;
  z-index: 600;
}

// clip-path is only applied DURING the slide animation — it clips
// the shrinking horizontal box (with -9999px on top to let picker
// dropdowns escape upwards), then drops away in static state so the
// color palette / shape picker can grow wider than the bar without
// getting cut at its edge.
.slide-enter-active,
.slide-leave-active {
  clip-path: inset(-9999px 0 0 0);
  transition:
    max-width 0.3s ease,
    opacity 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-width: 0;
  opacity: 0;
}

.background-combo {
  max-width: 300px;

  :deep(.combo) {
    max-width: 100%;
  }
}
</style>
