<template>
  <div ref="container" class="preview-player dark" tabindex="-1">
    <div class="preview filler">
      <div class="flexrow filler">
        <div class="preview-container filler" ref="preview-container">
          <div
            class="canvas-wrapper"
            ref="canvas-wrapper"
            oncontextmenu="return false"
            @click="onCanvasClicked"
            v-show="!isZoomPan && isAnnotationsDisplayed"
          >
            <canvas ref="annotation-canvas" class="canvas" :id="canvasId">
            </canvas>
          </div>
          <div
            class="canvas-comparison-wrapper"
            ref="canvas-comparison-wrapper"
            oncontextmenu="return false"
            @click="onCanvasClicked"
            v-show="
              !isZoomPan &&
              isAnnotationsDisplayed &&
              isComparing &&
              previewToCompare &&
              !isComparisonOverlay
            "
          >
            <canvas
              ref="annotation-canvas-comparison"
              class="canvas"
              :id="`${canvasId}-comparison`"
            >
            </canvas>
          </div>
          <div class="viewers">
            <preview-viewer
              ref="preview-viewer"
              class="preview-viewer"
              :current-frame="currentFrame"
              :default-height="defaultHeight"
              :is-big="big"
              :is-comparing="isComparing && isComparisonEnabled"
              :is-comparison-overlay="isComparisonOverlay"
              :is-environment-skybox="isEnvironmentSkybox"
              :is-full-screen="fullScreen"
              :is-hd="isHd"
              :is-light="light"
              :is-muted="isMuted"
              :is-object-background="isObjectBackground"
              :is-repeating="isRepeating"
              :is-wireframe="isWireframe"
              :margin-bottom="marginBottom"
              name="main"
              :nb-frames="nbFrames"
              :object-background-url="objectBackgroundUrl"
              :preview="currentPreview"
              :style="{
                position: isComparisonOverlay ? 'absolute' : 'static'
              }"
              @duration-changed="changeMaxDuration"
              @frame-update="setVideoFrameContext"
              @model-loaded="onModelLoaded"
              @play-ended="pause"
              @size-changed="fixCanvasSize"
              @video-end="onVideoEnd"
              @video-loaded="onVideoLoaded"
            />

            <preview-viewer
              ref="comparison-preview-viewer"
              class="comparison-preview-viewer"
              name="comparison-preview-viewer"
              :current-frame="currentFrame"
              :default-height="defaultHeight"
              :is-big="big"
              :is-comparing="isComparing && isComparisonEnabled"
              :is-full-screen="fullScreen"
              :is-light="light"
              :is-hd="isHd"
              :is-muted="true"
              :is-repeating="isRepeating"
              :margin-bottom="marginBottom"
              :preview="comparisonPreview"
              :style="{
                opacity: overlayOpacity
              }"
              @size-changed="fixCanvasComparisonSize"
              @video-loaded="syncComparisonViewer"
              v-show="isComparing && previewToCompare"
            />
          </div>
        </div>

        <task-info
          ref="task-info-player"
          class="flexrow-item task-info-column"
          :current-frame="currentFrame"
          :current-parent-preview="currentPreview"
          :entity-type="entityType"
          :extendable="false"
          :is-preview="false"
          :player="playerApi"
          :root="false"
          :silent="isCommentsHidden"
          :task="task"
          @comment-added="$emit('comment-added')"
          @time-code-clicked="timeCodeClicked"
          v-show="!isCommentsHidden"
          v-if="!readOnly"
        />
      </div>
    </div>
    <div class="button-bar" ref="button-bar">
      <video-progress
        ref="progress"
        class="video-progress pull-bottom"
        :annotations="annotations"
        :comparison-annotations="comparisonAnnotations"
        :frame-duration="frameDuration"
        :is-full-screen="fullScreen"
        :movie-dimensions="movieDimensions"
        :nb-frames="nbFrames"
        :width="width"
        :handle-in="-1"
        :handle-out="-1"
        :preview-id="isMovie && currentPreview ? currentPreview.id : ''"
        @start-scrub="$refs['button-bar'].classList.add('unselectable')"
        @end-scrub="$refs['button-bar'].classList.remove('unselectable')"
        @progress-changed="onProgressChanged"
        v-show="isMovie"
      />

      <div class="buttons flexrow pull-bottom" ref="buttons">
        <player-playback-bar
          :available-3-d-animations="available3DAnimations"
          :current-frame-label="currentFrameLabel"
          :current-time="currentTime"
          :full-screen="fullScreen"
          :is-3-d-animation="is3DAnimation"
          :is-3-d-model="is3DModel"
          :is-movie="isMovie"
          :is-playing="isPlaying"
          :is-repeating="isRepeating"
          :is-sound="isSound"
          :light="light"
          :max-duration="maxDuration"
          :nb-frames="nbFrames"
          v-model:current-3-d-animation="current3DAnimation"
          v-model:is-hd="isHd"
          v-model:is-muted="isMuted"
          v-model:speed="speed"
          v-model:volume="volume"
          @play-pause-clicked="onPlayPauseClicked"
          @repeat-clicked="onRepeatClicked"
          @toggle-sound-clicked="onToggleSoundClicked"
        />

        <player-comparison-bar
          :comparison-mode-options="comparisonModeOptions"
          :comparison-preview-index="comparisonPreviewIndex"
          :comparison-preview-length="comparisonPreviewLength"
          :is-comparing="isComparing"
          :is-comparison-enabled="isComparisonEnabled"
          :is-concept="isConcept"
          :is-movie="isMovie"
          :is-sound="isSound"
          :light="light"
          :preview-file-options="previewFileOptions"
          :task-type-options="taskTypeOptions"
          v-model:comparison-mode="comparisonMode"
          v-model:preview-to-compare-id="previewToCompareId"
          v-model:task-type-id="taskTypeId"
          @compare-clicked="onCompareClicked"
          @next-comparison-clicked="onNextComparisonClicked"
          @previous-comparison-clicked="onPreviousComparisonClicked"
        />

        <div class="filler"></div>

        <div class="entity-name mr1" v-if="fullScreen && task">
          {{ task.entity_name }}
        </div>

        <div class="separator" v-if="fullScreen"></div>

        <div class="flexrow">
          <player-annotation-bar
            :background-options="backgroundOptions"
            :full-screen="fullScreen"
            :is-3-d-model="is3DModel"
            :is-annotations-displayed="isAnnotationsDisplayed"
            :is-comments-hidden="isCommentsHidden"
            :is-concept="isConcept"
            :is-drawing="isDrawing"
            :is-movie="isMovie"
            :is-object-background="isObjectBackground"
            :is-picture="isPicture"
            :is-typing="isTyping"
            :is-zoom-pan="isZoomPan"
            :light="light"
            :object-background-url="objectBackgroundUrl"
            :pencil-color="pencilColor"
            :pencil-palette="pencilPalette"
            :pencil-width="pencilWidth"
            :production-backgrounds="productionBackgrounds"
            :read-only="readOnly"
            :text-color="textColor"
            v-model:current-background="currentBackground"
            v-model:is-environment-skybox="isEnvironmentSkybox"
            v-model:is-wireframe="isWireframe"
            @annotation-displayed-clicked="onAnnotationDisplayedClicked"
            @change-pencil-color="onChangePencilColor"
            @change-pencil-width="onChangePencilWidth"
            @change-text-color="onChangeTextColor"
            @comment-clicked="onCommentClicked"
            @delete-clicked="onDeleteClicked"
            @object-background-selected="onObjectBackgroundSelected"
            @pencil-annotate-clicked="onPencilAnnotateClicked"
            @redo="redoLastAction"
            @type-clicked="onTypeClicked"
            @undo="undoLastAction"
            @zoom-pan-clicked="onZoomPanClicked"
          />

          <div
            class="separator"
            v-if="!readOnly && fullScreen && isPicture"
          ></div>

          <a
            class="button flexrow-item"
            :href="originalPath"
            :title="$t('playlists.actions.see_original_file')"
            target="blank"
            v-if="!readOnly && isPicture"
          >
            <arrow-up-right-icon class="icon is-small" />
          </a>

          <div
            class="separator"
            v-if="
              !fullScreen ||
              (fullScreen &&
                (previews.length > 1 || lastPreviewFiles.length > 1))
            "
          ></div>

          <browsing-bar
            :current-index="currentIndex"
            :previews="previews"
            :read-only="readOnly"
            :light="light"
            :full-screen="fullScreen"
            :is-assigned="isAssigned"
            @add-preview-clicked="$emit('add-extra-preview')"
            @next-clicked="onNextClicked"
            @previous-clicked="onPreviousClicked"
            @remove-preview-clicked="onRemovePreviewClicked"
            @current-index-clicked="toggleIsOrdering"
            v-if="currentPreview && !isConcept"
          />

          <div
            class="flexrow"
            v-if="fullScreen && !isConcept && lastPreviewFileOptions.length"
          >
            <combobox-styled
              class="preview-combo flexrow-item"
              :options="lastPreviewFileOptions"
              is-reversed
              is-preview
              thin
              :model-value="currentPreview?.id"
              @update:model-value="changeCurrentPreviewFile"
            />
          </div>

          <div
            class="separator"
            v-if="lastPreviewFiles.length > 1 && fullScreen"
          ></div>

          <a
            class="button flexrow-item"
            :href="link"
            :title="$t('playlists.actions.open_link')"
            target="_blank"
            v-if="!isCurrentUserArtist && link?.length"
          >
            <link-icon class="icon is-small" />
          </a>

          <a
            class="button flexrow-item"
            :class="{
              'is-disabled': !isReady
            }"
            :href="originalDlPath"
            :title="$t('playlists.actions.download_file')"
            v-if="
              !isCurrentUserArtist ||
              currentProduction?.is_preview_download_allowed
            "
          >
            <download-icon class="icon is-small" />
          </a>

          <button-simple
            class="flexrow-item"
            :title="$t('playlists.actions.fullscreen')"
            icon="maximize"
            v-if="isFullScreenEnabled"
            @click="onFullscreenClicked"
          />
        </div>
      </div>
    </div>

    <div class="flexrow" v-if="isConcept && conceptLinkedEntities.length">
      <ul class="tags">
        <li
          class="tag"
          :key="entity.id"
          v-for="entity in conceptLinkedEntities"
        >
          <router-link :to="entityPath(entity, 'asset')">
            {{ entity.name }}
          </router-link>
        </li>
      </ul>
    </div>

    <div
      class="flexrow revision-previews"
      ref="revision-previews"
      @wheel="onSubPreviewsWheel"
      v-if="isOrdering"
    >
      <div
        class="flexrow-item revision-preview"
        :key="preview.id"
        v-for="(preview, index) in previews"
      >
        <revision-preview
          :preview-file="preview"
          :index="index"
          :is-selected="currentPreview.id === preview.id"
          @selected="onRevisionPreviewSelected(index + 1)"
          @preview-dropped="onRevisionPreviewDropped"
        />
      </div>
    </div>

    <!-- used only for picture saving purpose, it is not displayed -->
    <canvas id="annotation-snapshot" ref="annotation-snapshot"> </canvas>
    <canvas id="resize-annotation-canvas" ref="resize-annotation-canvas">
    </canvas>
    <!-- end -->
  </div>
</template>

<script setup>
import {
  computed,
  defineAsyncComponent,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { fabric } from 'fabric'
import { PSBrush } from 'fabricjs-psbrush'
import { ArrowUpRightIcon, DownloadIcon, LinkIcon } from 'lucide-vue-next'

import { useAnnotation } from '@/composables/annotation'
import {
  formatFrame,
  formatTime,
  roundToFrame,
  floorToFrame
} from '@/lib/video'
import { getEntityPath } from '@/lib/path'
import localPreferences from '@/lib/preferences'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import BrowsingBar from '@/components/previews/BrowsingBar.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import PlayerAnnotationBar from '@/components/previews/PlayerAnnotationBar.vue'
import PlayerComparisonBar from '@/components/previews/PlayerComparisonBar.vue'
import PlayerPlaybackBar from '@/components/previews/PlayerPlaybackBar.vue'
import PreviewViewer from '@/components/previews/PreviewViewer.vue' // eslint-disable-line no-unused-vars
import RevisionPreview from '@/components/previews/RevisionPreview.vue'
import VideoProgress from '@/components/previews/VideoProgress.vue'

const TaskInfo = defineAsyncComponent(
  () => import('@/components/sides/TaskInfo.vue')
)

let lastIndex = 1

const FRAME_DELAY = 20
const RENDER_DELAY = 100
const SYNC_DELAY = 200
const RESIZE_DELAY = 500

// Props

const props = defineProps({
  canvasId: {
    type: String,
    default: 'annotation-canvas'
  },
  big: {
    type: Boolean,
    default: false
  },
  entityPreviewFiles: {
    type: Object,
    default: () => ({})
  },
  isAssigned: {
    type: Boolean,
    default: false
  },
  lastPreviewFiles: {
    type: Array,
    default: () => []
  },
  light: {
    type: Boolean,
    default: false
  },
  link: {
    type: String
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  previews: {
    type: Array,
    default: () => []
  },
  task: {
    type: Object,
    default: () => ({})
  },
  taskTypeMap: {
    type: Map,
    default: () => new Map()
  },
  extraWide: {
    type: Boolean,
    default: false
  },
  entityType: {
    type: String
  }
})

// Emits

const emit = defineEmits([
  'add-extra-preview',
  'annotation-changed',
  'change-current-preview',
  'comment-added',
  'frame-updated',
  'previews-order-changed',
  'remove-extra-preview'
])

// Store

const store = useStore()
const { t } = useI18n()

const assetMap = computed(() => store.getters.assetMap)
const isCurrentUserArtist = computed(() => store.getters.isCurrentUserArtist)
const isTVShow = computed(() => store.getters.isTVShow)
const organisation = computed(() => store.getters.organisation)
const productionMap = computed(() => store.getters.productionMap)
const selectedConcepts = computed(() => store.getters.selectedConcepts)

const userId = computed(() => store.getters.user?.id)

const updateRevisionPreviewPosition = payload =>
  store.dispatch('updateRevisionPreviewPosition', payload)

// Template refs

const container = useTemplateRef('container')
const annotationCanvasRef = useTemplateRef('annotation-canvas')
const previewViewer = useTemplateRef('preview-viewer')
const comparisonViewer = useTemplateRef('comparison-preview-viewer')
const canvasWrapper = useTemplateRef('canvas-wrapper')
const canvasComparisonWrapper = useTemplateRef('canvas-comparison-wrapper')
const previewContainer = useTemplateRef('preview-container')
const commentContainer = useTemplateRef('task-info-player')
const progress = useTemplateRef('progress')
const revisionPreviews = useTemplateRef('revision-previews')

// Non-reactive state

let loupe = false
let scrubbing = false
let scrubStartX = 0
let previewFileMap = {}

// Reactive state

const annotations = ref([])
const available3DAnimations = ref([])
const comparisonPreviewIndex = ref(0)
const current3DAnimation = ref(null)
const currentFrame = ref(0)
const currentIndex = ref(1)
const fullScreen = ref(false)
const currentBackground = ref(null)
const currentTime = ref('00:00:00:00')
const currentTimeRaw = ref(0)
const is3DAnimation = ref(false)
const isObjectBackground = ref(false)
const isAnnotationsDisplayed = ref(true)
const isEnvironmentSkybox = ref(false)
const isCommentsHidden = ref(true)
const isComparing = ref(false)
const isDrawing = ref(false)
const isHd = ref(false)
const isMuted = ref(false)
const isPlaying = ref(false)
const isOrdering = ref(true)
const isRepeating = ref(false)
const isTyping = ref(false)
const isWireframe = ref(false)
const isZoomPan = ref(false)
const maxDuration = ref('00:00:00:00')
const movieDimensions = ref({ width: 1920, height: 1080 })
const objectBackgroundUrl = ref(null)
const pencilPalette = ref(['big', 'medium', 'small'])
const previewToCompare = ref(null)
const previewToCompareId = ref(null)
const speed = ref(3)
const taskTypeId = ref(
  props.entityPreviewFiles ? Object.keys(props.entityPreviewFiles)[0] : null
)
const videoDuration = ref(0)
const volume = ref(50)
const width = ref(0)
const comparisonMode = ref('sidebyside')

// Annotation composable
// Callbacks are wrapped in closures so they can reference functions defined later.

const annotation = useAnnotation({
  annotationCanvas: annotationCanvasRef,
  canvasWrapper,
  annotations,
  isCurrentUserArtist,
  userId,
  store,
  emit,
  getCurrentTime: () => getCurrentTime(),
  getCurrentFrame: () => getCurrentFrame(),
  saveAnnotationsCb: () => saveAnnotations(),
  loadAnnotationCb: () => loadAnnotation(),
  onCanvasMouseMovedCb: event => onCanvasMouseMoved(event),
  onCanvasReleasedCb: event => onCanvasReleased(event)
})

const {
  fabricCanvas,
  fabricCanvasComparison,
  notSaved,
  pencilColor,
  pencilWidth,
  textColor,
  addText,
  addTypeArea,
  removeTypeArea,
  deleteSelection,
  isWriting,
  getNewAnnotations,
  loadSingleAnnotation,
  loadSingleAnnotationComparison,
  onChangePencilColor,
  onChangePencilWidth,
  onChangeTextColor,
  _resetColor,
  _resetPencil,
  resetPencilConfiguration,
  onWindowsClosed,
  undoLastAction,
  redoLastAction,
  clearCanvas,
  configureCanvas,
  copyAnnotations,
  pasteAnnotations,
  startAnnotationSaving,
  endAnnotationSaving
} = annotation

// Computed

const comparisonModeOptions = computed(() => [
  {
    label: t('playlists.actions.side_by_side'),
    value: 'sidebyside'
  },
  {
    label: `${t('playlists.actions.overlay')} 0%`,
    value: 'overlay0'
  },
  {
    label: `${t('playlists.actions.overlay')} 25%`,
    value: 'overlay25'
  },
  {
    label: `${t('playlists.actions.overlay')} 50%`,
    value: 'overlay50'
  },
  {
    label: `${t('playlists.actions.overlay')} 75%`,
    value: 'overlay75'
  },
  {
    label: `${t('playlists.actions.overlay')} 100%`,
    value: 'overlay100'
  }
])

const comparisonPreview = computed(() => {
  if (
    previewToCompare.value?.previews?.length > 0 &&
    comparisonPreviewIndex.value > 0
  ) {
    return previewToCompare.value.previews[comparisonPreviewIndex.value - 1]
  }
  return previewToCompare.value
})

const comparisonPreviewLength = computed(() => {
  if (previewToCompare.value) {
    const previews = previewToCompare.value.previews
    return previews ? previews.length + 1 : 0
  }
  return 0
})

const comparisonAnnotations = computed(() =>
  previewToCompare.value && isComparing.value
    ? previewToCompare.value.annotations
    : []
)

const currentFrameLabel = computed(() => {
  const frame = Math.min(nbFrames.value, currentFrame.value)
  return formatFrame(frame + 1)
})

const currentPreview = computed(() => {
  if (
    props.previews &&
    props.previews.length > 0 &&
    currentIndex.value - 1 < props.previews.length
  ) {
    return props.previews[currentIndex.value - 1]
  }
  return {}
})

annotation.setCurrentPreviewGetter(() => currentPreview.value)

const currentProduction = computed(() =>
  productionMap.value.get(props.task.project_id)
)

const marginBottom = computed(() => {
  let margin = 32
  if (isMovie.value) margin += 28
  if (isOrdering.value) margin += 140
  return margin
})

const defaultHeight = computed(() => {
  if (fullScreen.value) {
    return screen.height - marginBottom.value
  }
  let bigHeight = screen.height > 800 ? 470 : 300
  if (isMovie.value) bigHeight = screen.height > 800 ? 442 : 272
  return screen.width > 1300 && (!props.light || props.big) ? bigHeight : 200
})

const fps = computed(() => parseFloat(currentProduction.value?.fps) || 25)

const frameDuration = computed(
  () => Math.round((1 / fps.value) * 10000) / 10000
)

const extension = computed(() =>
  currentPreview.value ? currentPreview.value.extension : ''
)

const isConcept = computed(() => props.entityType === 'Concept')

const isPicture = computed(() =>
  ['gif', 'png', 'jpg', 'jpeg'].includes(extension.value)
)

const isMovie = computed(() => extension.value === 'mp4')

const is3DModel = computed(() => ['glb', 'gltf'].includes(extension.value))

const isSound = computed(() => ['mp3', 'wav'].includes(extension.value))

const isFile = computed(() => !isPicture.value && !isMovie.value)

const isFullScreenEnabled = computed(
  () =>
    !!(
      document.fullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled ||
      document.webkitSupportsFullscreen ||
      document.webkitFullscreenEnabled ||
      document.createElement('video').webkitRequestFullScreen
    )
)

const originalPath = computed(() => {
  if (currentPreview.value) {
    const previewId = currentPreview.value.id
    const ext = extension.value || 'png'
    const type = isMovie.value ? 'movies' : 'pictures'
    return `/api/${type}/originals/preview-files/${previewId}.${ext}`
  }
  return ''
})

const originalDlPath = computed(() => {
  if (currentPreview.value) {
    const type = isMovie.value ? 'movies' : 'pictures'
    return `/api/${type}/originals/preview-files/${currentPreview.value.id}/download`
  }
  return ''
})

const taskTypeOptions = computed(() => {
  if (!props.entityPreviewFiles) return []
  const taskTypeIds = Object.keys(props.entityPreviewFiles)
  return taskTypeIds
    .filter(id => {
      const previewFiles = props.entityPreviewFiles[id].filter(p =>
        ['mp4', 'png'].includes(p.extension)
      )
      return previewFiles.length > 0 && props.taskTypeMap.get(id)
    })
    .map(id => {
      const taskType = props.taskTypeMap.get(id)
      return { label: taskType.name, value: taskType.id }
    })
})

const lastPreviewFileOptions = computed(() => {
  if (!props.lastPreviewFiles) return []
  return [...props.lastPreviewFiles]
    .sort((a, b) => b.revision - a.revision)
    .map(preview => ({
      value: preview.id,
      label: `v${preview.revision}`,
      validation_status: preview.validation_status
    }))
})

const previewFileOptions = computed(() => {
  if (!props.entityPreviewFiles) return []
  const previewFiles = props.entityPreviewFiles[taskTypeId.value]
  if (previewFiles && previewFiles.length > 0) {
    return previewFiles.map(previewFile => ({
      label: `v${previewFile.revision}`,
      value: previewFile.id
    }))
  }
  return []
})

const isComparisonEnabled = computed(() => fullScreen.value || props.extraWide)

const nbFrames = computed(() => {
  const duration =
    currentPreview.value && currentPreview.value.duration
      ? currentPreview.value.duration
      : videoDuration.value
  return Math.round(duration * fps.value)
})

const isComparisonOverlay = computed(
  () => comparisonMode.value !== 'sidebyside' && isComparing.value
)

const overlayOpacity = computed(() => {
  if (isComparing.value && isComparisonOverlay.value) {
    switch (comparisonMode.value) {
      case 'overlay0':
        return 0
      case 'overlay25':
        return 0.25
      case 'overlay50':
        return 0.5
      case 'overlay75':
        return 0.75
      case 'overlay100':
        return 1
      default:
        return 1
    }
  }
  return 1
})

const backgroundOptions = computed(() => {
  const defaultFlag = t('playlists.actions.default')
  return [
    {
      label: t('playlists.actions.select_background'),
      value: null,
      placeholder: true
    },
    ...productionBackgrounds.value.map(background => ({
      value: background,
      label: background.name,
      optionLabel:
        background.name +
        (isDefaultBackground(background) ? ` (${defaultFlag})` : '')
    }))
  ]
})

const productionBackgrounds = computed(() =>
  store.getters.getProductionBackgrounds(props.task?.project_id)
)

const currentConcept = computed(
  () => selectedConcepts.value.values().next().value
)

const conceptLinkedEntities = computed(() =>
  getLinkedEntities(currentConcept.value)
)

// DOM utility functions (inlined from domMixin)

const clearFocus = () => {
  document.activeElement.blur()
}

const pauseEvent = e => {
  if (e.stopPropagation) e.stopPropagation()
  if (e.preventDefault) e.preventDefault()
  e.cancelBubble = true
  e.returnValue = false
  return false
}

const getClientX = event =>
  event.touches?.[0]?.clientX ??
  event.changedTouches?.[0]?.clientX ??
  event.clientX

// Fullscreen utility functions (inlined from fullScreenMixin)

const isFullScreen = () =>
  !!(
    document.fullscreen ||
    document.webkitIsFullScreen ||
    document.mozFullScreen ||
    document.msFullscreenElement ||
    document.fullscreenElement
  )

const documentExitFullScreen = () => {
  if (document.exitFullscreen) {
    return document.exitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

const documentSetFullScreen = element => {
  if (element.requestFullscreen) {
    return element.requestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  }
}

// Methods

const setVideoFrameContext = frame => {
  frame = Math.min(frame, nbFrames.value - 1)
  if (currentFrame.value !== frame) {
    const time = frame * frameDuration.value
    currentFrame.value = frame
    currentTimeRaw.value = time
    currentTime.value = formatTime(time, fps.value)
    progress.value.updateProgressBar(frame)
    emit('frame-updated', frame)
    if (!isPlaying.value) {
      syncComparisonViewer()
    }
    if (!isPlaying.value) loadAnnotation()
  }
}

const onSubPreviewsWheel = event => {
  const isMouseWheelY = !event.deltaX
  if (isMouseWheelY) {
    event.preventDefault()
    revisionPreviews.value.scrollLeft += event.deltaY
  }
}

const setCurrentFrame = frame => {
  if (currentFrame.value !== frame) {
    setVideoFrameContext(frame)
    previewViewer.value.setCurrentFrame(frame)
  }
}

const initPreferences = () => {
  isRepeating.value = localPreferences.getBoolPreference('player:repeating')
  isMuted.value = localPreferences.getBoolPreference('player:muted')
  isHd.value = Boolean(organisation.value.hd_by_default)
  isOrdering.value =
    props.previews.length > 1 &&
    localPreferences.getPreference('player:ordering') !== 'false'
}

const toggleIsOrdering = () => {
  isOrdering.value = !isOrdering.value
  localPreferences.setPreference('player:ordering', isOrdering.value)
}

const focus = () => {
  container.value.focus()
}

const timeCodeClicked = ({ versionRevision, frame }) => {
  const preview = props.lastPreviewFiles.find(
    p => p.revision === parseInt(versionRevision)
  )
  if (!preview) return
  changeCurrentPreview(preview)
  setTimeout(() => {
    setCurrentFrame(frame)
  }, FRAME_DELAY)
}

const configureVideo = () => {
  isPlaying.value = false
  isRepeating.value = false
}

const changeMaxDuration = duration => {
  if (duration) {
    const isChromium = !!window.chrome
    if (isChromium) {
      duration += 0.001
    }
    if (currentPreview.value.duration) {
      duration = currentPreview.value.duration
    }
    duration = floorToFrame(duration, fps.value)
    videoDuration.value = duration
    maxDuration.value = formatTime(
      videoDuration.value - frameDuration.value,
      fps.value
    )
  } else {
    maxDuration.value = '00:00:00:00'
    videoDuration.value = 0
  }
}

const getCurrentTime = () => {
  if (!isMovie.value) return 0
  const time = roundToFrame(currentTimeRaw.value, fps.value)
  return Number(time.toPrecision(4))
}

const getCurrentFrame = () => {
  if (currentFrame.value) {
    return currentFrame.value + 1
  }
  const time = roundToFrame(currentTimeRaw.value, fps.value) || 0
  return Math.round(time / frameDuration.value) + 1
}

const play = () => {
  isPlaying.value = true
  isDrawing.value = false
  if (previewViewer.value) {
    if (is3DModel.value) {
      previewViewer.value.playModelAnimation(current3DAnimation.value)
    } else {
      clearCanvas()
      if (currentFrame.value >= nbFrames.value - 1) {
        previewViewer.value.setCurrentFrame(0)
        comparisonViewer.value.setCurrentFrame(0)
      }
      previewViewer.value.play()
      if (comparisonViewer.value && isComparing.value) {
        comparisonViewer.value.play()
      }
    }
  }
}

const pause = () => {
  if (isPlaying.value) {
    isPlaying.value = false
    if (is3DModel.value) {
      previewViewer.value.pauseModelAnimation()
    } else {
      if (previewViewer.value) previewViewer.value.pause()
      if (comparisonViewer.value) comparisonViewer.value.pause()
      nextTick(() => {
        syncComparisonViewer()
      })
    }
  }
}

const goPreviousFrame = () => {
  clearCanvas()
  previewViewer.value.goPreviousFrame()
  syncComparisonViewer()
}

const goNextFrame = () => {
  clearCanvas()
  previewViewer.value.goNextFrame()
  syncComparisonViewer()
}

const goPreviousDrawing = () => {
  const time = getPreviousAnnotationTime(currentTimeRaw.value)
  jumpToAnnotationFrame(time)
}

const goNextDrawing = () => {
  const time = getNextAnnotationTime(currentTimeRaw.value)
  jumpToAnnotationFrame(time)
}

const jumpToAnnotationFrame = time => {
  if (time) {
    const annotationTime = time.frame - 1
    clearCanvas()
    setCurrentFrame(annotationTime)
    syncComparisonViewer()
  }
}

const syncComparisonViewer = () => {
  if (comparisonViewer.value && isComparing.value) {
    comparisonViewer.value.setCurrentFrame(currentFrame.value)
  }
}

const onProgressChanged = frame => {
  reloadAnnotations()
  if (currentFrame.value !== frame) {
    clearCanvas()
    setCurrentFrame(frame)
  }
}

const onVideoEnd = () => {
  isPlaying.value = false
  if (isRepeating.value) {
    setCurrentFrame(0)
    syncComparisonViewer()
    nextTick(() => {
      play()
    })
  }
}

const onPlayPauseClicked = () => {
  clearFocus()
  if (!isPlaying.value) {
    play()
  } else {
    pause()
  }
}

const onRepeatClicked = () => {
  clearFocus()
  isRepeating.value = !isRepeating.value
  localPreferences.setPreference('player:repeating', isRepeating.value)
}

const onToggleSoundClicked = () => {
  clearFocus()
  isMuted.value = !isMuted.value
  localPreferences.setPreference('player:muted', isMuted.value)
}

// Sizing

const getDimensions = () => {
  const dimensions = { width: 0, height: 0 }
  if (previewContainer.value) {
    dimensions.width = previewContainer.value.offsetWidth
    dimensions.height = previewContainer.value.offsetHeight
  }
  return dimensions
}

const setupFabricCanvas = () => {
  const dimensions = getDimensions()
  const w = dimensions.width
  const h = dimensions.height
  fabricCanvas.value = markRaw(
    new fabric.Canvas(props.canvasId, {
      fireRightClick: true,
      width: w,
      height: h,
      enablePointerEvents: true
    })
  )
  const brush = new PSBrush(fabricCanvas.value)
  brush.width = 20
  brush.color = '#000'
  brush.disableTouch = true
  brush.disableMouse = true
  brush.pressureManager.fallback = 0.5
  fabricCanvas.value.freeDrawingBrush = brush
  fabricCanvasComparison.value = new fabric.StaticCanvas(
    props.canvasId + '-comparison'
  )
  configureCanvas()
}

const fixCanvasSize = dimensions => {
  if (!fabricCanvas.value) return
  if (isPicture.value && dimensions.source === 'movie') return
  if (isMovie.value && dimensions.source === 'picture') return
  const { height, left, top, width: w } = dimensions
  canvasWrapper.value.style.top = top + 'px'
  canvasWrapper.value.style.left = left + 'px'
  canvasWrapper.value.style.width = w + 'px'
  canvasWrapper.value.style.height = height + 'px'
  if (fabricCanvas.value.width !== w || fabricCanvas.value.height !== height) {
    fabricCanvas.value.setDimensions({ width: w, height })
  }
  refreshCanvas()
}

const fixCanvasComparisonSize = dimensions => {
  if (!fabricCanvasComparison.value) return
  const { height, left, top, width: w } = dimensions
  canvasComparisonWrapper.value.style.top = top + 'px'
  canvasComparisonWrapper.value.style.left =
    getDimensions().width / 2 + left + 'px'
  canvasComparisonWrapper.value.style.width = w + 'px'
  canvasComparisonWrapper.value.style.height = height + 'px'
  if (
    fabricCanvasComparison.value.width !== w ||
    fabricCanvasComparison.value.height !== height
  ) {
    fabricCanvasComparison.value.setDimensions({ width: w, height })
  }
  refreshCanvas()
}

// Screen

const setFullScreen = () => {
  endAnnotationSaving()
  const promise = documentSetFullScreen(container.value)
  Promise.resolve(promise).finally(() => {
    fullScreen.value = true
  })
  nextTick(() => {
    clearFocus()
  })
}

const exitFullScreen = () => {
  endAnnotationSaving()
  const promise = documentExitFullScreen()
  Promise.resolve(promise).finally(() => {
    fullScreen.value = false
    nextTick(() => {
      previewViewer.value?.resize()
      comparisonViewer.value?.resize()
    })
  })
  isComparing.value = false
  isCommentsHidden.value = true
  nextTick(() => {
    clearFocus()
    previewViewer.value?.resize()
    comparisonViewer.value?.resize()
    triggerResize()
  })
}

const onFullscreenClicked = () => {
  if (fullScreen.value) {
    removeTypeArea()
    exitFullScreen()
  } else {
    addTypeArea()
    setFullScreen()
  }
}

const onFullScreenChange = () => {
  if (fullScreen.value && !isFullScreen()) {
    isComparing.value = false
    fullScreen.value = false
    isCommentsHidden.value = true
    endAnnotationSaving()
    nextTick(() => {
      previewViewer.value?.resize()
      comparisonViewer.value?.resize()
      clearFocus()
      nextTick(() => {
        loadAnnotation()
      })
    })
  }
  setTimeout(() => {
    previewViewer.value?.resize()
    comparisonViewer.value?.resize()
  }, RESIZE_DELAY)
}

// Comparison

const onCompareClicked = () => {
  clearFocus()
  if (isComparing.value) {
    isComparing.value = false
  } else {
    isComparing.value = true
    taskTypeId.value = taskTypeOptions.value[0].value
    previewToCompareId.value = ''
    nextTick(() => {
      previewToCompareId.value = previewFileOptions.value[0].value
    })
    isDrawing.value = false
  }
}

const setDefaultComparisonTaskType = () => {
  if (!props.entityPreviewFiles) return ''
  const taskTypeIds = Object.keys(props.entityPreviewFiles)
  if (taskTypeIds && taskTypeIds.length > 0) {
    const taskTypeOption = taskTypeOptions.value.find(option => {
      return (
        props.entityPreviewFiles[option.value].findIndex(
          p => p.id === currentPreview.value.id
        ) >= 0
      )
    })
    if (taskTypeOption) {
      taskTypeId.value = taskTypeOption.value
    } else if (taskTypeOptions.value.length > 0) {
      taskTypeId.value = taskTypeOptions.value[0].value
    }
    if (taskTypeId.value) setDefaultComparisonPreview()
  } else {
    previewToCompareId.value = null
  }
}

const setDefaultComparisonPreview = () => {
  if (!props.entityPreviewFiles) return ''
  let previewFiles = props.entityPreviewFiles[taskTypeId.value]
  if (previewFiles) {
    previewFiles = previewFiles.filter(p => p.id !== currentPreview.value.id)
    if (previewFiles.length > 0) {
      previewToCompareId.value = previewFiles[0].id
    } else {
      previewToCompareId.value = null
    }
  } else {
    previewToCompareId.value = null
  }
}

const onPreviousComparisonClicked = () => {
  const index = comparisonPreviewIndex.value - 1
  comparisonPreviewIndex.value =
    index < 0 ? comparisonPreviewLength.value - 1 : index
}

const onNextComparisonClicked = () => {
  const index = comparisonPreviewIndex.value + 1
  comparisonPreviewIndex.value =
    index > comparisonPreviewLength.value - 1 ? 0 : index
}

const resetPreviewFileMap = () => {
  previewFileMap = {}
  if (props.entityPreviewFiles) {
    const previewFiles = props.entityPreviewFiles[taskTypeId.value]
    if (previewFiles) {
      previewFiles.forEach(previewFile => {
        previewFileMap[previewFile.id] = previewFile
      })
    }
  }
}

const onZoomPanClicked = () => {
  if (!isZoomPan.value) {
    isDrawing.value = false
    isAnnotationsDisplayed.value = false
    isZoomPan.value = true
  } else {
    isZoomPan.value = false
    isAnnotationsDisplayed.value = true
  }
}

const onObjectBackgroundSelected = () => {
  objectBackgroundUrl.value = currentBackground.value?.url
  const enabled = Boolean(objectBackgroundUrl.value)
  isObjectBackground.value = enabled
  isEnvironmentSkybox.value = enabled
}

const isDefaultBackground = background => {
  const defaultId = currentProduction.value?.default_preview_background_file_id
  return defaultId ? background.id === defaultId : background.is_default
}

const setPlayerSpeed = rate => {
  previewViewer.value.setSpeed(rate)
  comparisonViewer.value.setSpeed(rate)
}

// Annotations

const triggerResize = () => {
  window.dispatchEvent(new Event('resize'))
}

const onDeleteClicked = () => {
  clearFocus()
  deleteSelection()
}

const onPencilAnnotateClicked = () => {
  clearFocus()
  if (isDrawing.value) {
    isDrawing.value = false
  } else {
    _resetColor()
    _resetPencil()
    isTyping.value = false
    isDrawing.value = true
  }
}

const onTypeClicked = () => {
  clearFocus()
  if (isTyping.value) {
    isTyping.value = false
  } else {
    isDrawing.value = false
    isTyping.value = true
  }
}

const refreshCanvas = () => {
  clearCanvas()
  if (annotations.value.length > 0) {
    if (isMovie.value || isPicture.value) {
      loadAnnotation()
    }
  }
}

const getAnnotation = time => {
  if (isMovie.value) {
    time = roundToFrame(time, fps.value)
    return annotations.value.find(annotation => {
      return (
        roundToFrame(annotation.time, fps.value) < time + 0.0001 &&
        roundToFrame(annotation.time, fps.value) > time - 0.0001
      )
    })
  } else if (isPicture.value) {
    return annotations.value.find(annotation => annotation.time === 0)
  }
}

const getSortedAnnotations = () => {
  const anns = annotations.value
  anns.sort((a, b) => a.time - b.time)
  return anns
}

const getNextAnnotationTime = time => {
  const anns = getSortedAnnotations()
  if (isMovie.value) {
    time = roundToFrame(time, fps.value)
    return anns.find(annotation => {
      return roundToFrame(annotation.time, fps.value) > time + 0.0001
    })
  } else if (isPicture.value) {
    return anns.find(annotation => annotation.time === 0)
  }
}

const getPreviousAnnotationTime = time => {
  const anns = getSortedAnnotations()
  if (isMovie.value) {
    time = roundToFrame(time, fps.value)
    return anns.findLast(annotation => {
      return (
        roundToFrame(annotation.time, fps.value) < time - 1 / fps.value + 0.0001
      )
    })
  } else if (isPicture.value) {
    return anns.find(annotation => annotation.time === 0)
  }
}

const onAnnotationDisplayedClicked = () => {
  clearFocus()
  isAnnotationsDisplayed.value = !isAnnotationsDisplayed.value
  isZoomPan.value = false
  previewViewer.value.resetZoom()
  comparisonViewer.value.resetZoom()
}

const saveAnnotations = () => {
  let currentTimeVal = 0
  if (isMovie.value) {
    currentTimeVal = currentFrame.value * frameDuration.value
    currentTimeVal = roundToFrame(currentTimeVal, fps.value)
    currentTimeVal = Number(currentTimeVal.toPrecision(4))
  }
  const annotation = getAnnotation(currentTimeVal)
  const newAnnotations = getNewAnnotations(
    currentTimeVal,
    currentFrame.value,
    annotation
  )
  if (!props.readOnly) {
    const preview = currentPreview.value
    if (!notSaved.value) {
      startAnnotationSaving(preview, newAnnotations)
    }
  }
}

const loadAnnotation = annotation => {
  let currentTimeVal = 0
  if (!annotation) {
    if (isMovie.value) {
      currentTimeVal = currentFrame.value * frameDuration.value
    }
    annotation = getAnnotation(currentTimeVal)
    if (!annotation) {
      if (!isMovie.value) {
        console.warn('Annotations are malformed or empty.')
      }
      if (isComparing.value && !isComparisonOverlay.value) {
        loadComparisonAnnotation(currentTimeVal)
      }
      return
    }
  }
  if (!fabricCanvas.value) setupFabricCanvas()
  if (isMovie.value && previewViewer.value && isPlaying.value) {
    previewViewer.value.pause()
  }
  clearCanvas()
  loadSingleAnnotation(annotation)
  if (isComparing.value && !isComparisonOverlay.value) {
    loadComparisonAnnotation(currentTimeVal)
  }
}

const loadComparisonAnnotation = time => {
  fabricCanvasComparison.value.clear()
  previewToCompare.value = previewFileMap[previewToCompareId.value]
  let anns = []
  if (previewToCompare.value && previewToCompare.value.annotations) {
    anns = previewToCompare.value.annotations
  }
  let annotation = null
  if (isMovie.value) {
    annotation = anns.find(a => a.time === time)
  } else if (isPicture.value) {
    annotation = anns.find(a => a.time === 0)
  }
  if (annotation) {
    loadSingleAnnotationComparison(annotation)
  }
}

const reloadAnnotations = () => {
  annotations.value = []
  if (currentPreview.value.annotations) {
    const anns = []
    if (currentPreview.value.annotations.forEach) {
      currentPreview.value.annotations.forEach(a => {
        if (a.time >= 0) {
          anns.push({ ...a })
        }
      })
    }
    annotations.value = anns.sort((a, b) => a.time - b.time) || []
  } else {
    annotations.value = []
  }
  return annotations.value
}

const getFileFromCanvas = (canvas, filename) => {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      const file = new File([blob], filename, {
        type: 'image/png',
        lastModified: new Date().getTime()
      })
      return resolve(file)
    })
  })
}

const extractVideoFrame = (canvas, frame) => {
  return new Promise(resolve => {
    setCurrentFrame(frame)
    nextTick(() => {
      setTimeout(() => {
        previewViewer.value.extractFrame(canvas, frame)
        resolve()
      }, RESIZE_DELAY)
    })
  })
}

const copyAnnotationCanvas = (canvas, annotation) => {
  return new Promise(resolve => {
    clearCanvas()
    loadSingleAnnotation(annotation)
    setTimeout(() => {
      const context = canvas.getContext('2d')
      const scaleRatio = canvas.width / fabricCanvas.value.width
      const tmpSource = document.getElementById('resize-annotation-canvas')
      const tmpCanvas = new fabric.Canvas('resize-annotation-canvas', {
        width: canvas.width,
        height: canvas.height
      })
      fabricCanvas.value.getObjects().forEach(obj => {
        if (obj._objects) {
          obj._objects.forEach(obj => {
            tmpCanvas.add(obj)
            obj.strokeWidth = obj.strokeWidth / scaleRatio
          })
        } else {
          tmpCanvas.add(obj)
          obj.strokeWidth = obj.strokeWidth / scaleRatio
        }
      })
      tmpCanvas.setZoom(scaleRatio)
      setTimeout(() => {
        context.drawImage(tmpSource, 0, 0, canvas.width, canvas.height)
        setTimeout(() => {
          tmpCanvas.dispose()
        }, RENDER_DELAY)
        return resolve()
      }, RENDER_DELAY)
    }, RENDER_DELAY)
  })
}

const extractAnnotationSnapshots = async () => {
  const files = []
  const sortedAnnotations = annotations.value.sort((a, b) => {
    return parseInt(b.frame) < parseInt(a.frame) ? 1 : -1
  })
  let index = 1
  for (const annotation of sortedAnnotations) {
    const canvas = document.getElementById('annotation-snapshot')
    const filename = `annotation ${index}.png`
    const frame = roundToFrame(annotation.time, fps.value) / frameDuration.value
    await extractVideoFrame(canvas, frame)
    await copyAnnotationCanvas(canvas, annotation)
    const file = await getFileFromCanvas(canvas, filename)
    files.push(file)
    index++
  }
  previewViewer.value.setCurrentFrame(currentFrame.value - 1)
  nextTick(() => {
    clearCanvas()
  })
  return files
}

// Concepts

const entityPath = (entity, section) => {
  const episodeId = isTVShow.value ? entity.episode_id || 'main' : null
  return getEntityPath(
    entity.id,
    currentProduction.value.id,
    section,
    episodeId
  )
}

const getLinkedEntities = concept => {
  return concept.entity_concept_links
    .map(id => assetMap.value.get(id))
    .filter(Boolean)
}

// Events

const onKeyDown = event => {
  const PREVANNKEY = ','
  const NEXTANNKEY = '.'
  const OKEY = 'o'

  if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      deleteSelection()
    } else if (event.key === 'ArrowLeft') {
      goPreviousFrame()
    } else if (event.key === 'ArrowRight') {
      goNextFrame()
    } else if (event.key === ' ') {
      let styles
      const playlistModal = document.getElementById('temp-playlist-modal')
      if (playlistModal) styles = window.getComputedStyle(playlistModal)
      if (!styles || (styles && styles.display === 'none')) {
        onPlayPauseClicked()
        pauseEvent(event)
      }
      return false
    } else if (event.key === NEXTANNKEY) {
      goNextDrawing()
    } else if (event.key === PREVANNKEY) {
      goPreviousDrawing()
    } else if (event.key === 'd') {
      container.value.focus()
      pauseEvent(event)
      onPencilAnnotateClicked()
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      undoLastAction()
    } else if (event.altKey && event.key === 'r') {
      redoLastAction()
    } else if (event.altKey && event.key === 'j') {
      onPreviousClicked()
    } else if (event.altKey && event.key === 'k') {
      onNextClicked()
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
      copyAnnotations()
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
      pasteAnnotations()
    } else if (event.altKey && event.key === OKEY) {
      event.preventDefault()
      event.stopPropagation()
      toggleFullOverlayComparison()
    } else if (event.key === 'Escape') {
      if (fullScreen.value) {
        onFullScreenChange()
      }
    }
  }
}

const toggleFullOverlayComparison = async () => {
  if (!isComparing.value) {
    isComparing.value = true
    await nextTick()
    await nextTick()
  }
  nextTick(() => {
    if (comparisonMode.value === 'overlay100') {
      comparisonMode.value = 'overlay0'
    } else {
      comparisonMode.value = 'overlay100'
    }
  })
}

const onCommentClicked = () => {
  const height = previewContainer.value.offsetHeight
  isCommentsHidden.value = !isCommentsHidden.value
  if (!isCommentsHidden.value) {
    commentContainer.value.$el.style.height = `${height}px`
    commentContainer.value.focusCommentTextarea()
  }
  endAnnotationSaving()
  nextTick(() => {
    previewViewer.value.resize()
    comparisonViewer.value.resize()
    loadAnnotation()
  })
}

const onModelLoaded = () => {
  is3DAnimation.value = previewViewer.value.get3DAnimations().length > 0
  if (is3DAnimation.value) {
    available3DAnimations.value = previewViewer.value
      .get3DAnimations()
      .map(animation => ({
        label: animation,
        value: animation
      }))
    current3DAnimation.value = available3DAnimations.value[0].value
    isPlaying.value = true
    previewViewer.value.playModelAnimation(current3DAnimation.value)
  }
}

const onVideoLoaded = () => {
  if (isMovie.value) {
    movieDimensions.value = {
      width: currentPreview.value.width,
      height: currentPreview.value.height
    }
    setCurrentFrame(0)
    progress.value.updateProgressBar(0)
  }
}

const configureEvents = () => {
  window.addEventListener('keydown', onKeyDown, false)
  window.addEventListener('beforeunload', onWindowsClosed)
  container.value.addEventListener(
    'fullscreenchange',
    onFullScreenChange,
    false
  )
  container.value.addEventListener(
    'mozfullscreenchange',
    onFullScreenChange,
    false
  )
  container.value.addEventListener(
    'MSFullscreenChange',
    onFullScreenChange,
    false
  )
  container.value.addEventListener(
    'webkitfullscreenchange',
    onFullScreenChange,
    false
  )
}

const removeEvents = () => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('beforeunload', onWindowsClosed)
  container.value.removeEventListener(
    'fullscreenchange',
    onFullScreenChange,
    false
  )
  container.value.removeEventListener(
    'mozfullscreenchange',
    onFullScreenChange,
    false
  )
  container.value.removeEventListener(
    'MSFullscreenChange',
    onFullScreenChange,
    false
  )
  container.value.removeEventListener(
    'webkitfullscreenchange',
    onFullScreenChange,
    false
  )
}

// Browsing

const changeCurrentPreviewFile = previewFileId => {
  const previewFile = props.lastPreviewFiles.find(p => p.id === previewFileId)
  changeCurrentPreview(previewFile)
}

const changeCurrentPreview = previewFile => {
  emit('change-current-preview', previewFile)
}

const onRemovePreviewClicked = () => {
  emit('remove-extra-preview', currentPreview.value)
}

const onPreviousClicked = () => {
  if (currentIndex.value > 1) {
    currentIndex.value--
  } else {
    currentIndex.value = props.previews.length
  }
}

const onNextClicked = () => {
  if (currentIndex.value < props.previews.length) {
    currentIndex.value++
  } else {
    currentIndex.value = 1
  }
}

const displayFirst = () => {
  if (currentIndex.value > 1) currentIndex.value = 1
}

const displayLast = () => {
  currentIndex.value = props.previews.length
}

// Loupe

const onCanvasMouseMoved = event => {
  if (isPicture.value && loupe) {
    const w = canvasWrapper.value.style.width
    const h = canvasWrapper.value.style.height
    previewViewer.value.updateLoupePosition(event, { width: w, height: h })
  } else if (isMovie.value && scrubbing) {
    const x = getClientX(event.e)
    if (x - scrubStartX < 0) {
      goPreviousFrame()
    } else {
      goNextFrame()
    }
    scrubStartX = x
  }
}

const onCanvasClicked = event => {
  if (event.button > 1 && isPicture.value && fullScreen.value) {
    loupe = true
    previewViewer.value.showLoupe()
    const w = canvasWrapper.value.style.width
    const h = canvasWrapper.value.style.height
    previewViewer.value.updateLoupePosition(event, { width: w, height: h })
  } else if (event.button > 1 && isMovie.value) {
    scrubbing = true
    scrubStartX = getClientX(event)
  }
  return false
}

const onCanvasReleased = event => {
  if (isPicture.value && loupe) {
    previewViewer.value.hideLoupe()
    loupe = false
  } else if (isMovie.value && scrubbing) {
    scrubbing = false
  }
  return false
}

// Revision previews

const onRevisionPreviewSelected = index => {
  currentIndex.value = index
}

const onRevisionPreviewDropped = ({ previousIndex, newIndex }) => {
  const preview = props.previews[previousIndex]
  updateRevisionPreviewPosition({
    previousIndex,
    newIndex,
    revision: currentPreview.value.revision,
    taskId: currentPreview.value.task_id,
    previewId: preview.id
  }).catch(console.error)
  emit('previews-order-changed')
  nextTick(() => {
    currentIndex.value = newIndex + 1
  })
}

const isValidPreviewModification = (previewId, updatedAt) => {
  return (
    !notSaved.value &&
    currentPreview.value &&
    previewId === currentPreview.value.id &&
    !isWriting(updatedAt)
  )
}

// Watchers

watch(current3DAnimation, () => {
  if (is3DModel.value) {
    isPlaying.value = true
    previewViewer.value.playModelAnimation(current3DAnimation.value)
  }
})

watch(currentPreview, () => {
  endAnnotationSaving()
  reloadAnnotations()
  isComparing.value = false
  if (isMovie.value) {
    configureVideo()
    pause()
    maxDuration.value = '00:00:00:00'
    isDrawing.value = false
    setTimeout(() => {
      if (previewViewer.value) {
        movieDimensions.value = previewViewer.value.getNaturalDimensions()
        previewViewer.value.resize()
        comparisonViewer.value.resize()
      }
    }, RESIZE_DELAY)
  } else if (isPicture.value) {
    pause()
    isDrawing.value = false
    refreshCanvas()
    setTimeout(() => {
      previewViewer.value?.resize()
      comparisonViewer.value?.resize()
    }, RESIZE_DELAY)
  } else if (is3DModel.value) {
    fixCanvasSize({ width: 0, height: 0, left: 0, top: 0 })
    previewViewer.value?.resize()
  } else if (isSound.value || isFile.value) {
    fixCanvasSize({ width: 0, height: 0, left: 0, top: 0 })
  }
  nextTick(() => {
    if (previewViewer.value && previewViewer.value.isBroken) {
      clearCanvas()
    }
  })
  setDefaultComparisonTaskType()
  isOrdering.value =
    props.previews.length > 1 &&
    localPreferences.getPreference('player:ordering') !== 'false'
})

watch(
  () => currentPreview.value?.revision,
  () => {
    endAnnotationSaving()
    currentIndex.value = lastIndex <= props.previews.length ? lastIndex || 1 : 1
  }
)

watch(currentIndex, () => {
  lastIndex = currentIndex.value
})

watch(previewToCompare, () => {
  comparisonPreviewIndex.value = 0
  nextTick(() => {
    previewViewer.value.resize()
    comparisonViewer.value.resize()
  })
})

watch(previewToCompareId, () => {
  nextTick(() => {
    if (comparisonViewer.value) comparisonViewer.value.pause()
    previewToCompare.value = previewFileMap[previewToCompareId.value]
    if (isComparing.value) {
      setCurrentFrame(currentFrame.value - 1)
      setTimeout(() => {
        syncComparisonViewer()
      }, SYNC_DELAY)
      pause()
      if (isMovie.value) {
        loadComparisonAnnotation(currentTime.value)
      } else if (isPicture.value) {
        loadComparisonAnnotation(0)
      }
    }
  })
})

watch(taskTypeId, () => {
  resetPreviewFileMap()
  setDefaultComparisonPreview()
})

watch(isComparing, () => {
  endAnnotationSaving()
  if (!isComparing.value) {
    if (comparisonViewer.value) comparisonViewer.value.pause()
    taskTypeId.value = ''
    previewToCompareId.value = ''
  }
  nextTick(() => {
    previewViewer.value.resize()
    comparisonViewer.value.resize()
    previewViewer.value.resetZoom()
    comparisonViewer.value.resetZoom()
  })
})

watch(
  () => props.light,
  () => {
    endAnnotationSaving()
    previewViewer.value.resize()
    comparisonViewer.value.resize()
  }
)

watch(
  () => props.extraWide,
  () => {
    endAnnotationSaving()
    previewViewer.value.resize()
    comparisonViewer.value.resize()
  }
)

watch(isDrawing, () => {
  if (fabricCanvas.value) {
    fabricCanvas.value.isDrawingMode = isDrawing.value
  } else {
    endAnnotationSaving()
  }
  if (isDrawing.value) {
    isAnnotationsDisplayed.value = true
    isZoomPan.value = false
  }
})

watch(isOrdering, () => {
  nextTick(() => {
    previewViewer.value.resize()
    comparisonViewer.value.resize()
  })
})

watch(isTyping, () => {
  if (isTyping.value) {
    isAnnotationsDisplayed.value = true
  }
  const clickarea =
    canvasWrapper.value.getElementsByClassName('upper-canvas')[0]
  if (isTyping.value && clickarea) {
    clickarea.addEventListener('dblclick', addText)
  } else {
    clickarea.removeEventListener('dblclick', addText)
  }
})

watch(isAnnotationsDisplayed, () => {
  if (isAnnotationsDisplayed.value) {
    nextTick(() => {
      previewViewer.value.resetZoom()
      comparisonViewer.value.resetZoom()
    })
  }
  if (!isAnnotationsDisplayed.value) {
    isDrawing.value = false
  }
})

watch(isComparisonOverlay, () => {
  nextTick(() => {
    previewViewer.value.resize()
    comparisonViewer.value.resize()
  })
})

watch(isZoomPan, () => {
  if (isZoomPan.value) {
    previewViewer.value.resumeZoom()
  } else {
    previewViewer.value.pauseZoom()
  }
})

watch(speed, () => {
  const rates = [0.25, 0.5, 1, 1.5, 2]
  const rate = rates[speed.value - 1]
  setPlayerSpeed(rate)
})

watch(volume, () => {
  previewViewer.value.setVolume(volume.value)
  localPreferences.setPreference('player:volume', volume.value)
})

// Lifecycle

onMounted(() => {
  configureEvents()
  setupFabricCanvas()
  reloadAnnotations()
  if (isPicture.value) loadAnnotation()
  resetPreviewFileMap()
  initPreferences()
  if (isSound.value || is3DModel.value || isFile.value) {
    fixCanvasSize({ width: 0, height: 0, left: 0, top: 0 })
  }
  new ResizeObserver(() => comparisonViewer.value?.resize()).observe(
    container.value
  )
  if (is3DModel.value) {
    currentBackground.value =
      productionBackgrounds.value.find(isDefaultBackground) || null
    onObjectBackgroundSelected()
  }
  resetPencilConfiguration()
  if (isMuted.value) {
    previewViewer.value.setVolume(0)
  } else {
    volume.value =
      localPreferences.getPreference('player:volume') || volume.value
    previewViewer.value.setVolume(volume.value)
  }
})

onBeforeUnmount(() => {
  endAnnotationSaving()
  removeEvents()
})

// Player API (passed to TaskInfo via :player prop)

const playerApi = computed(() => ({
  currentPreview: currentPreview.value,
  notSaved: notSaved.value,
  extractAnnotationSnapshots,
  isValidPreviewModification,
  reloadAnnotations,
  loadAnnotation
}))

// Expose

defineExpose({
  extractAnnotationSnapshots,
  setCurrentFrame,
  getCurrentFrame,
  getCurrentTime,
  displayFirst,
  displayLast,
  focus,
  pause,
  play,
  reloadAnnotations,
  setupFabricCanvas,
  saveAnnotations,
  loadAnnotation,
  onCanvasMouseMoved,
  onCanvasReleased,
  isValidPreviewModification
})
</script>

<style lang="scss" scoped>
.dark {
  .preview-player {
    box-shadow: 0 0 4px #0008;
  }
}

.loading-background {
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.spinner {
  margin: auto;
}

.annotation-movie {
  margin: auto;
  width: 100%;
}

.preview-viewer {
  width: 100%;
  text-align: center;
  background: #36393f;
}

.buttons {
  background: $dark-grey-2;
  height: 32px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  font-variant-numeric: tabular-nums;
}

.buttons :deep(.button:first-child) {
  border-bottom-left-radius: 5px;
}
.buttons :deep(.button:last-child) {
  border-bottom-right-radius: 5px;
}

.buttons :deep(.button) {
  background: $dark-grey-2;
  border-radius: 0;
  color: $light-grey-2;
  border: 0;
  margin: 0;
  transition: all 0.3s ease;
}

.buttons :deep(.background-combo) {
  max-width: 300px;

  .combo {
    max-width: 100%;
  }
}

.buttons :deep(.button.active),
.buttons :deep(.background-combo.active .icon) {
  color: var(--background-selectable);
}

.buttons :deep(.button:hover) {
  border-radius: 5px;
  transform: scale(1.2);
}

.buttons :deep(.comparison-button) {
  margin-left: 1em;
}

.previous-preview-file {
  padding: 1px 8px;
  margin-right: 0.4em;
  border: 1px solid $grey;
  border-radius: 50%;
  cursor: pointer;
  color: $grey;
}

.current-preview-file {
  padding: 1px 8px;
  margin-right: 0.4em;
  border: 1px solid $grey;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  background: $purple-strong;
  transition: 0.3s background ease;
}

.buttons :deep(.button.ml1) {
  margin-left: 1em;
}

.preview-viewer {
  background: $dark-grey-stronger;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.canvas-wrapper {
  position: absolute;
  width: 100%;
  left: 0;
  z-index: 500;
}
.canvas-comparison-wrapper {
  position: absolute;
  width: 100%;
  left: 0;
  z-index: 5;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-player {
  background: $dark-grey-light;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  box-shadow: 0 0 4px #0007;
  min-height: 200px;

  .preview {
    position: relative;
    align-items: flex-start;
    background: black;
    display: flex;
    justify-content: center;

    .button {
      padding: 1.5em;
      transition: background 0.3s ease;

      &:hover {
        background: $dark-grey-lightest;
      }
    }
  }
}

.revision-previews {
  overflow-x: auto;
  height: 140px;
  padding-left: 10px;
  padding-top: 10px;
  box-shadow: inset 0 0 10px 1px #0008;
  align-items: flex-start;

  .flexrow-item.revision-preview {
    margin-right: 0;
  }
}

.preview-viewer,
.comparison-preview-viewer {
  flex: 1 1 0;
  overflow: hidden;
}

.preview-viewer {
  z-index: 1;
}

.comparison-preview-viewer {
  z-index: 2;
}

.separator {
  background: $dark-grey-2;
}

.entity-name {
  color: $light-grey;
}

.task-info-column {
  min-width: 450px;
  max-width: 450px;
  overflow-y: auto;
  height: 90vh;
}

.preview-container {
  position: relative;
}

.viewers {
  display: flex;
}

.tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 1rem;
  margin-left: 0;
  font-weight: 500;
  letter-spacing: 1px;

  .tag {
    transition: transform 0.1s linear;

    a {
      display: inline-flex;
      gap: 1em;
      line-height: normal;
    }

    .action {
      border-radius: 50%;
      display: none;
      height: 14px;
      width: 14px;
      line-height: 8px;
    }

    &:hover {
      transform: scale(1.1);

      .action {
        display: inline-block;
      }
    }
  }
}

#resize-annotation-canvas,
#annotation-snapshot {
  display: none;
}
</style>
