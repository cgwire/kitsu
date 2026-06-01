<template>
  <div ref="container" class="preview-player dark" tabindex="-1">
    <div class="preview filler">
      <div class="flexrow filler">
        <div
          class="preview-container filler"
          :style="{ cursor: annotationCursor || null }"
          ref="preview-container"
        >
          <annotation-canvas
            ref="main-annotation-canvas"
            :canvas-id="canvasId"
            :cursor="annotationCursor"
            :media-element="mainMediaElement"
            :panzoom-transform="panzoomTransform"
            :interactive="isOverlayInteractive"
            :wheel-target="mainMediaElement"
            v-show="
              isAnnotationsDisplayed &&
              (isMovie || isPicture) &&
              mainMediaElement
            "
            @click="onCanvasClicked"
            @resized="onMainCanvasResized"
          />
          <annotation-canvas
            ref="comparison-annotation-canvas"
            :canvas-id="`${canvasId}-comparison`"
            :media-element="comparisonMediaElement"
            :panzoom-transform="panzoomTransform"
            :interactive="false"
            :static="true"
            v-show="
              isAnnotationsDisplayed &&
              isComparing &&
              previewToCompare &&
              !isComparisonOverlay &&
              (isMovie || isPicture) &&
              comparisonMediaElement
            "
            @click="onCanvasClicked"
            @resized="onComparisonCanvasResized"
          />
          <div class="viewers">
            <preview-viewer
              ref="preview-viewer"
              class="preview-viewer"
              :current-frame="currentFrame"
              :default-height="defaultHeight"
              :fps="fps"
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
              @panzoom-changed="onPanzoomChanged"
              @picture-loaded="onPreviewLoaded"
              @play-ended="pause"
              @video-end="onVideoEnd"
              @video-loaded="onPreviewLoaded"
            />

            <preview-viewer
              ref="comparison-preview-viewer"
              class="comparison-preview-viewer"
              name="comparison-preview-viewer"
              :current-frame="currentFrame"
              :default-height="defaultHeight"
              :fps="fps"
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
              @video-loaded="onComparisonVideoLoaded"
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
          :show-panel="fullScreen"
          :task-type-options="taskTypeOptions"
          v-model:comparison-mode="comparisonMode"
          v-model:preview-to-compare-id="previewToCompareId"
          v-model:task-type-id="taskTypeId"
          @compare-clicked="onCompareClicked"
          @next-comparison-clicked="goToNextComparison"
          @previous-comparison-clicked="goToPreviousComparison"
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
            :is-zoom-pan="false"
            :light="light"
            :object-background-url="objectBackgroundUrl"
            :pencil-color="pencilColor"
            :pencil-palette="pencilPalette"
            :pencil-width="pencilWidth"
            :production-backgrounds="productionBackgrounds"
            :read-only="readOnly"
            :show-comments-button="showCommentsButton"
            :text-color="textColor"
            v-model:current-background="currentBackground"
            v-model:current-shape="currentShape"
            v-model:is-environment-skybox="isEnvironmentSkybox"
            v-model:is-shape-mode="isShapeMode"
            v-model:is-wireframe="isWireframe"
            @annotation-displayed-clicked="onAnnotationDisplayedClicked"
            @change-pencil-color="onChangePencilColor"
            @change-pencil-width="onChangePencilWidth"
            @change-shape="setShapeTool"
            @change-text-color="onChangeTextColor"
            @comment-clicked="onCommentClicked"
            @delete-clicked="onDeleteClicked"
            @object-background-selected="onObjectBackgroundSelected"
            @pencil-annotate-clicked="onPencilAnnotateClicked"
            @redo="redoLastAction"
            @shape-mode-clicked="onShapeModeClicked"
            @type-clicked="onTypeClicked"
            @undo="undoLastAction"
            @zoom-pan-clicked="onResetZoomClicked"
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

        <div class="comparison-dock flexrow" v-if="!fullScreen && isComparing">
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
            :show-toggle="false"
            :task-type-options="taskTypeOptions"
            v-model:comparison-mode="comparisonMode"
            v-model:preview-to-compare-id="previewToCompareId"
            v-model:task-type-id="taskTypeId"
            @next-comparison-clicked="goToNextComparison"
            @previous-comparison-clicked="goToPreviousComparison"
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
import { ArrowUpRightIcon, DownloadIcon, LinkIcon } from 'lucide-vue-next'
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useFullScreen } from '@/composables/fullScreen'
import { usePanzoomSync } from '@/composables/panzoom'
import { useAnnotation } from '@/composables/players/annotation'
import { useAnnotationCursor } from '@/composables/players/annotationCursor'
import { useComparison } from '@/composables/players/comparison'
import { usePreviewShortcuts } from '@/composables/players/previewShortcuts'
import { getEntityPath } from '@/lib/path'
import localPreferences from '@/lib/preferences'
import {
  buildAnnotationSnapshotFilename,
  buildAnnotationSnapshotTitle,
  drawSnapshotTitle,
  isModelPreview,
  isMoviePreview,
  isPicturePreview,
  isSoundPreview
} from '@/lib/preview'
import {
  floorToFrame,
  formatFrame,
  formatTime,
  roundToFrame
} from '@/lib/video'

import AnnotationCanvas from '@/components/players/annotations/AnnotationCanvas.vue'
import BrowsingBar from '@/components/players/bars/BrowsingBar.vue'
import PlayerAnnotationBar from '@/components/players/bars/PlayerAnnotationBar.vue'
import PlayerComparisonBar from '@/components/players/bars/PlayerComparisonBar.vue'
import PlayerPlaybackBar from '@/components/players/bars/PlayerPlaybackBar.vue'
// eslint-disable-next-line no-unused-vars
import PreviewViewer from '@/components/players/viewers/PreviewViewer.vue'
import RevisionPreview from '@/components/players/headers/RevisionPreview.vue'
import VideoProgress from '@/components/players/progress/VideoProgress.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'

const FRAME_DELAY = 20
const SYNC_DELAY = 200
const RESIZE_DELAY = 500

const TaskInfo = defineAsyncComponent(
  () => import('@/components/sides/TaskInfo.vue')
)

const store = useStore()
const { t } = useI18n()

// Props

const props = defineProps({
  big: {
    type: Boolean,
    default: false
  },
  canvasId: {
    type: String,
    default: 'annotation-canvas'
  },
  entityPreviewFiles: {
    type: Object,
    default: () => ({})
  },
  entityType: {
    type: String
  },
  extraWide: {
    type: Boolean,
    default: false
  },
  fps: {
    type: Number,
    default: null
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
  previews: {
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
  task: {
    type: Object,
    default: () => ({})
  },
  taskTypeMap: {
    type: Map,
    default: () => new Map()
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

// State

// — Template refs
const container = useTemplateRef('container')
const mainAnnotationCanvas = useTemplateRef('main-annotation-canvas')
const comparisonAnnotationCanvas = useTemplateRef(
  'comparison-annotation-canvas'
)
const previewViewer = useTemplateRef('preview-viewer')
const comparisonViewer = useTemplateRef('comparison-preview-viewer')
const previewContainer = useTemplateRef('preview-container')
const commentContainer = useTemplateRef('task-info-player')

const canvasWrapper = computed(() => mainAnnotationCanvas.value?.overlay)

const mainMediaElement = computed(
  () => previewViewer.value?.currentMediaElement || null
)
const comparisonMediaElement = computed(
  () => comparisonViewer.value?.currentMediaElement || null
)
const progress = useTemplateRef('progress')
const revisionPreviews = useTemplateRef('revision-previews')

// — Non-reactive
let lastIndex = 1
let scrubbing = false
let scrubStartX = 0

// — Reactive

const annotations = ref([])
const available3DAnimations = ref([])
const current3DAnimation = ref(null)
const currentBackground = ref(null)
const currentFrame = ref(0)
const currentIndex = ref(1)
const currentTime = ref('00:00:00:00')
const currentTimeRaw = ref(0)
const is3DAnimation = ref(false)
const isAnnotationsDisplayed = ref(true)
const isCommentsHidden = ref(true)
const isDrawing = ref(false)
const isEnvironmentSkybox = ref(false)
const isHd = ref(false)
const isMuted = ref(false)
const isObjectBackground = ref(false)
const isOrdering = ref(true)
const isPlaying = ref(false)
const isRepeating = ref(false)
const isTyping = ref(false)
const isWireframe = ref(false)
const maxDuration = ref('00:00:00:00')
const movieDimensions = ref({ width: 1920, height: 1080 })
const objectBackgroundUrl = ref(null)
const pencilPalette = ref(['huge', 'big', 'medium', 'small', 'tiny'])
const speed = ref(3)
const videoDuration = ref(0)
const volume = ref(50)
const width = ref(0)

// Vuex getters
// Declared before `useAnnotation` so the composable can consume them; the
// rest of the computeds live under the `// Computed` section below.

const assetMap = computed(() => store.getters.assetMap)
const isCurrentUserArtist = computed(() => store.getters.isCurrentUserArtist)
const isTVShow = computed(() => store.getters.isTVShow)
const organisation = computed(() => store.getters.organisation)
const productionMap = computed(() => store.getters.productionMap)
const selectedConcepts = computed(() => store.getters.selectedConcepts)
const userId = computed(() => store.getters.user?.id)

// Panzoom transform sync — the main viewer drives both the
// annotation canvases (via applyPanzoomTo) and the comparison
// viewer's underlying panzoom (via setPanZoom). Comparison viewer's
// own panzoom stays paused; it only reflects the main viewer's
// transform.

const { panzoomTransform, onPanzoomChanged, resetPanzoomTransform } =
  usePanzoomSync()

// The annotation overlay always captures pointer events so the user
// can select / move / draw / type annotations. Holding Alt turns
// it transparent so the underlying media receives the drag and pans.
// Shift is reserved for fabric.js's straight-line drawing constraint.
// Wheel keeps zooming regardless (the overlay forwards wheel to the
// media via the wheelTarget prop).
const isOverlayInteractive = computed(() => !isAltHeld.value)

// Annotation composable
// Callbacks are wrapped in closures so they can reference functions defined later.

const annotation = useAnnotation({
  mainCanvasComponent: mainAnnotationCanvas,
  comparisonCanvasComponent: comparisonAnnotationCanvas,
  canvasWrapper,
  annotations,
  isCurrentUserArtist,
  userId,
  store,
  emit,
  getCurrentTime: () => getCurrentTime(),
  getCurrentFrame: () => getCurrentFrame(),
  saveAnnotationsCb: () => saveAnnotations(),
  onCanvasMouseMovedCb: event => onCanvasMouseMoved(event),
  onCanvasReleasedCb: event => onCanvasReleased(event)
})

const {
  notSaved,
  pencilColor,
  pencilWidth,
  textColor,
  addText,
  addTypeArea,
  removeTypeArea,
  currentShape,
  deleteSelection,
  isShapeMode,
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
  clearComparisonCanvas,
  copyAnnotations,
  copyAnnotationCanvas,
  compositeLiveAnnotationsOntoCanvas,
  pasteAnnotations,
  setAnnotationDrawingMode,
  setShapeTool,
  startAnnotationSaving,
  endAnnotationSaving,
  confirmAnnotationsSaved,
  restoreFailedAnnotations,
  toggleShapeMode
} = annotation

// Computed

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

// Comparison state, options and selection actions. Side-effects
// (sync the comparison viewer, load the comparison annotation) stay
// in the watchers below where they have access to the viewer refs
// and the annotation composable.
const {
  isComparing,
  taskTypeId,
  previewToCompareId,
  previewToCompare,
  comparisonPreviewIndex,
  comparisonMode,
  comparisonModeOptions,
  comparisonPreview,
  comparisonPreviewLength,
  comparisonAnnotations,
  taskTypeOptions,
  previewFileOptions,
  isComparisonOverlay,
  overlayOpacity,
  toggleComparison,
  setDefaultComparisonTaskType,
  setDefaultComparisonPreview,
  goToPreviousComparison,
  goToNextComparison,
  toggleFullOverlay,
  resetPreviewFileMap,
  resolvePreviewToCompare
} = useComparison({
  entityPreviewFiles: computed(() => props.entityPreviewFiles),
  currentPreview,
  taskTypeMap: computed(() => props.taskTypeMap),
  t
})

// Apply the initial task type from props, matching the previous
// inline ref initializer.
if (props.entityPreviewFiles) {
  taskTypeId.value = Object.keys(props.entityPreviewFiles)[0] ?? ''
}

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

const fps = computed(
  () => props.fps || parseFloat(currentProduction.value?.fps) || 25
)

const frameDuration = computed(
  () => Math.round((1 / fps.value) * 10000) / 10000
)

const extension = computed(() =>
  currentPreview.value ? currentPreview.value.extension : ''
)

const isConcept = computed(() => props.entityType === 'Concept')
const isReady = computed(
  () => !currentPreview.value?.status || currentPreview.value.status === 'ready'
)
const isPicture = computed(() => isPicturePreview(extension.value))
const isMovie = computed(() => isMoviePreview(extension.value))
const is3DModel = computed(() => isModelPreview(extension.value))
const isSound = computed(() => isSoundPreview(extension.value))

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

const isComparisonEnabled = computed(() => fullScreen.value || props.extraWide)

const nbFrames = computed(() => {
  const duration =
    currentPreview.value && currentPreview.value.duration
      ? currentPreview.value.duration
      : videoDuration.value
  return Math.round(duration * fps.value)
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

const getClientX = event =>
  event.touches?.[0]?.clientX ??
  event.changedTouches?.[0]?.clientX ??
  event.clientX

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
  jumpToAnnotationFrame(getPreviousAnnotationTime(currentTimeRaw.value))
}

const goNextDrawing = () => {
  jumpToAnnotationFrame(getNextAnnotationTime(currentTimeRaw.value))
}

const jumpToAnnotationFrame = annotation => {
  if (annotation) {
    // Jump by the annotation's time, not its stored frame. The find and
    // the on-screen display both key off time, whereas annotation.frame
    // can be stale or off by a frame (sometimes even a zero-padded
    // string), which landed 1-2 frames past the drawing and lost the
    // next step.
    const frame = Math.round(annotation.time / frameDuration.value)
    clearCanvas()
    setCurrentFrame(frame)
    syncComparisonViewer()
  }
}

const syncComparisonViewer = () => {
  if (comparisonViewer.value && isComparing.value) {
    comparisonViewer.value.setCurrentFrame(currentFrame.value)
  }
}

const loadComparisonAnnotationAtCurrentFrame = () => {
  if (!isComparing.value || isComparisonOverlay.value) return
  if (isMovie.value) {
    loadComparisonAnnotation(currentFrame.value * frameDuration.value)
  } else if (isPicture.value) {
    loadComparisonAnnotation(0)
  }
}

const realignComparisonCanvas = () => {
  previewViewer.value?.resize()
  comparisonViewer.value?.resize()
  comparisonAnnotationCanvas.value?.updateBounds()
  loadComparisonAnnotationAtCurrentFrame()
}

const onComparisonVideoLoaded = () => {
  syncComparisonViewer()
  // The comparison canvas position and size are derived from the
  // comparison media element's on-screen rect, which is only final once
  // the 0.3s side-by-side layout transition has settled — and the
  // comparison viewer's left edge depends on the main viewer's width.
  // Draw once after RESIZE_DELAY rather than on nextTick: painting before
  // the transition settles places the annotation at a mid-transition
  // position, so it visibly jumps when corrected.
  setTimeout(realignComparisonCanvas, RESIZE_DELAY)
}

const onComparisonCanvasResized = () => {
  loadComparisonAnnotationAtCurrentFrame()
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

// Toggle play/pause without touching focus, so the Alt+P shortcut
// can fire from inside the comment textarea without losing the
// caret. The click handler below adds the focus reset.
const togglePlayPause = () => {
  if (!isPlaying.value) play()
  else pause()
}

const onPlayPauseClicked = () => {
  clearFocus()
  togglePlayPause()
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

// Screen

const { fullScreen, toggle: toggleFullScreen } = useFullScreen({
  container,
  onChange: nowFullScreen => {
    endAnnotationSaving()
    if (!nowFullScreen) {
      isComparing.value = false
      isCommentsHidden.value = true
    }
    nextTick(() => {
      clearFocus()
      previewViewer.value?.resize()
      comparisonViewer.value?.resize()
      if (!nowFullScreen) loadAnnotation()
    })
    // Fallback resize once the browser has fully settled the layout
    // transition, which nextTick can miss.
    setTimeout(() => {
      previewViewer.value?.resize()
      comparisonViewer.value?.resize()
      // Exiting fullscreen can move the media without changing its size (e.g.
      // back into the narrow task-info panel), and the AnnotationCanvas
      // ResizeObserver only fires on size changes — so the overlay stays at its
      // fullscreen rect until a manual resize. Recompute the bounds explicitly,
      // which is what that manual resize would have done.
      mainAnnotationCanvas.value?.updateBounds()
      comparisonAnnotationCanvas.value?.updateBounds()
    }, RESIZE_DELAY)
  }
})

const onFullscreenClicked = () => {
  if (fullScreen.value) {
    removeTypeArea()
  } else {
    addTypeArea()
  }
  toggleFullScreen()
}

// Comparison

const onCompareClicked = () => {
  clearFocus()
  if (!isComparing.value) isDrawing.value = false
  toggleComparison()
}

const onResetZoomClicked = () => {
  clearFocus()
  previewViewer.value?.resetZoom()
  comparisonViewer.value?.resetZoom()
  resetPanzoomTransform()
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
    isShapeMode.value = false
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
    isShapeMode.value = false
    isTyping.value = true
  }
}

const onShapeModeClicked = () => {
  // toggleShapeMode flips isShapeMode and clears fabricCanvas.isDrawingMode.
  // We also need to clear the PreviewPlayer-owned mode refs.
  toggleShapeMode()
  if (isShapeMode.value) {
    isDrawing.value = false
    isTyping.value = false
    if (!isAnnotationsDisplayed.value) isAnnotationsDisplayed.value = true
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
  clearComparisonCanvas()
  previewToCompare.value = resolvePreviewToCompare(previewToCompareId.value)
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

const extractAnnotationSnapshots = async ({ withLabel = false } = {}) => {
  if (isPicture.value) return extractPicturePreviewSnapshots({ withLabel })
  return extractVideoAnnotationSnapshots({ withLabel })
}

const snapshotIdentity = ({ revision, frame, index } = {}) => ({
  production: currentProduction.value?.name,
  entity: props.task?.entity_name,
  taskType: props.taskTypeMap.get(props.task?.task_type_id)?.name,
  revision,
  frame,
  index
})

const snapshotFilename = identity =>
  buildAnnotationSnapshotFilename(snapshotIdentity(identity))

const snapshotTitle = identity =>
  buildAnnotationSnapshotTitle(snapshotIdentity(identity))

// Video preview: one PNG per annotation, each captured at the
// annotation's frame with its drawing composited on top.
const extractVideoAnnotationSnapshots = async ({ withLabel = false } = {}) => {
  const files = []
  const sortedAnnotations = annotations.value.sort((a, b) => {
    return parseInt(b.frame) < parseInt(a.frame) ? 1 : -1
  })
  const revision = currentPreview.value?.revision
  for (const annotation of sortedAnnotations) {
    const canvas = document.getElementById('annotation-snapshot')
    const frame = Math.round(
      roundToFrame(annotation.time, fps.value) / frameDuration.value
    )
    await extractVideoFrame(canvas, frame)
    await copyAnnotationCanvas(canvas, annotation)
    if (withLabel) drawSnapshotTitle(canvas, snapshotTitle({ revision, frame }))
    files.push(
      await getFileFromCanvas(canvas, snapshotFilename({ revision, frame }))
    )
  }
  previewViewer.value.setCurrentFrame(currentFrame.value - 1)
  nextTick(() => {
    clearCanvas()
  })
  return files
}

// Picture revisions can hold several preview files. Walk them all and
// emit one PNG per picture preview, with that preview's annotations
// composited on top. Briefly switches the displayed preview file in
// order to reuse the live extract/composite pipeline.
const extractPicturePreviewSnapshots = async ({ withLabel = false } = {}) => {
  const savedIndex = currentIndex.value
  const picturePreviews = props.previews
    .map((preview, index) => ({ preview, index: index + 1 }))
    .filter(({ preview }) => isPicturePreview(preview.extension))

  const files = []
  for (const { preview, index } of picturePreviews) {
    if (currentIndex.value !== index) {
      currentIndex.value = index
      // Wait for the picture to swap and annotations to reload. The
      // chain is async (image load -> resetPlayerPositions ->
      // AnnotationCanvas resized -> reloadAnnotations) so a single tick
      // isn't enough.
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    const canvas = document.getElementById('annotation-snapshot')
    previewViewer.value.extractPicture(canvas)
    await compositeLiveAnnotationsOntoCanvas(canvas)
    if (withLabel) {
      drawSnapshotTitle(
        canvas,
        snapshotTitle({ revision: preview.revision, index })
      )
    }
    files.push(
      await getFileFromCanvas(
        canvas,
        snapshotFilename({ revision: preview.revision, index })
      )
    )
  }
  if (currentIndex.value !== savedIndex) {
    currentIndex.value = savedIndex
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  nextTick(() => clearCanvas())
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

const { isAltHeld } = usePreviewShortcuts({
  // Escape is not wired — the browser exits fullscreen on it and the
  // useFullScreen listener picks up the resulting fullscreenchange.
  onDelete: () => deleteSelection(),
  onPrevFrame: () => goPreviousFrame(),
  onNextFrame: () => goNextFrame(),
  onPlayPause: () => {
    // Don't toggle play/pause while a shared playlist modal is open.
    const playlistModal = document.getElementById('temp-playlist-modal')
    const styles = playlistModal && window.getComputedStyle(playlistModal)
    if (!styles || styles.display === 'none') togglePlayPause()
  },
  onPrevAnnotation: () => goPreviousDrawing(),
  onNextAnnotation: () => goNextDrawing(),
  onAnnotate: () => {
    container.value.focus()
    onPencilAnnotateClicked()
  },
  onUndo: () => undoLastAction(),
  onRedo: () => redoLastAction(),
  onPrevPreview: () => onPreviousClicked(),
  onNextPreview: () => onNextClicked(),
  onCopy: () => copyAnnotations(),
  onPaste: () => pasteAnnotations(),
  onToggleOverlay: () => toggleFullOverlay()
})

const { cursor: annotationCursor } = useAnnotationCursor({
  isAltHeld,
  isDrawing,
  isTyping,
  isShapeMode
})

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

const resetPlayerPositions = () => {
  previewViewer.value?.resize()
  comparisonViewer.value?.resize()
  previewViewer.value?.resetZoom()
  comparisonViewer.value?.resetZoom()
  resetPanzoomTransform()
}

const onPreviewLoaded = () => {
  if (isMovie.value) {
    movieDimensions.value = {
      width: currentPreview.value.width,
      height: currentPreview.value.height
    }
    setCurrentFrame(0)
    progress.value.updateProgressBar(0)
  }
  // Replay the same sequence that fires on a comparison toggle: it
  // forces a resetPicture/mountVideo round-trip on the viewers, which
  // re-applies the picture style.width/height and reliably triggers
  // the AnnotationCanvas to realign its bounds. Annotation (re)loading
  // is driven from @resized on AnnotationCanvas so it only runs once
  // the annotation canvas has been resized — otherwise scale
  // multipliers would be computed against a stale (or zero) width.
  nextTick(() => {
    resetPlayerPositions()
  })
}

const onMainCanvasResized = () => {
  reloadAnnotations()
  loadAnnotation()
}

const configureEvents = () => {
  window.addEventListener('beforeunload', onWindowsClosed)
}

const removeEvents = () => {
  window.removeEventListener('beforeunload', onWindowsClosed)
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

// Canvas events (right-click drag scrubs the movie timeline)

const onCanvasMouseMoved = event => {
  if (!isMovie.value || !scrubbing) return
  const x = getClientX(event.e)
  if (x - scrubStartX < 0) {
    goPreviousFrame()
  } else {
    goNextFrame()
  }
  scrubStartX = x
}

const onCanvasClicked = event => {
  if (event.button > 1 && isMovie.value) {
    scrubbing = true
    scrubStartX = getClientX(event)
  }
  return false
}

const onCanvasReleased = () => {
  if (isMovie.value && scrubbing) scrubbing = false
  return false
}

// Revision previews

const onRevisionPreviewSelected = index => {
  currentIndex.value = index
}

const onRevisionPreviewDropped = ({ previousIndex, newIndex }) => {
  const preview = props.previews[previousIndex]
  store
    .dispatch('updateRevisionPreviewPosition', {
      previousIndex,
      newIndex,
      revision: currentPreview.value.revision,
      taskId: currentPreview.value.task_id,
      previewId: preview.id
    })
    .catch(console.error)
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
  // Wipe the fabric canvas before the new preview's annotations are
  // re-loaded — otherwise switching between tasks (or between
  // previews on the same task) leaves the previous task's strokes
  // visible until the new video reaches frame 0.
  clearCanvas()
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
    previewViewer.value?.resize()
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
    previewToCompare.value = resolvePreviewToCompare(previewToCompareId.value)
    if (isComparing.value) {
      syncComparisonViewer()
      setTimeout(() => {
        syncComparisonViewer()
      }, SYNC_DELAY)
      pause()
      if (isPicture.value) {
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
    resetPlayerPositions()
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
  setAnnotationDrawingMode(isDrawing.value)
  if (isDrawing.value) {
    isAnnotationsDisplayed.value = true
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

// Drive the comparison viewer's underlying panzoom from the main one so
// both stay visually synced. The annotation canvases pick up the
// transform directly via their panzoom-transform prop.
watch(
  panzoomTransform,
  transform => {
    if (isComparing.value) {
      comparisonViewer.value?.setPanZoom(
        transform.x,
        transform.y,
        transform.scale
      )
    }
  },
  { deep: true }
)

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

  resetPreviewFileMap()
  initPreferences()

  resetPencilConfiguration()
  if (is3DModel.value) {
    currentBackground.value =
      productionBackgrounds.value.find(isDefaultBackground) || null
    onObjectBackgroundSelected()
  }

  if (isMuted.value) {
    previewViewer.value.setVolume(0)
  } else {
    volume.value =
      localPreferences.getPreference('player:volume') || volume.value
    previewViewer.value.setVolume(volume.value)
  }

  reloadAnnotations()
  loadAnnotation()

  // Zoom-pan inputs are always active on the main viewer. The
  // comparison viewer's panzoom stays paused (set by setupPanZoom in
  // PictureViewer/VideoViewer) so it can only mirror the main
  // viewer's transform through the panzoom-changed sync.
  previewViewer.value?.resumeZoom()

  new ResizeObserver(() => {
    resetPlayerPositions()
    if (isPicture.value || isMovie.value) loadAnnotation()
  }).observe(container.value)
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
  currentPreview,
  extractAnnotationSnapshots,
  setCurrentFrame,
  getCurrentFrame,
  getCurrentTime,
  displayFirst,
  displayLast,
  focus,
  notSaved,
  pause,
  play,
  reloadAnnotations,
  saveAnnotations,
  loadAnnotation,
  onCanvasMouseMoved,
  onCanvasReleased,
  isValidPreviewModification,
  confirmAnnotationsSaved,
  restoreFailedAnnotations
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
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  font-variant-numeric: tabular-nums;
  height: 32px;
  position: relative;
}

// Out of fullscreen the comparison panel lives in a separate dock so
// it can't push the buttons row out of layout. Anchored to the bottom
// of .buttons via top: 100%, it overlaps whatever sits underneath the
// player. A border + extra padding visually detach the dock from the
// main button row.
.comparison-dock {
  background: $dark-grey-2;
  border: 1px solid $dark-grey-strong;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  left: 0;
  padding: 0.4rem 0.75rem;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 5;
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
  background: var(--background-tag-button);
  border-radius: 5px;
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

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-player {
  background: $dark-grey-light;
  // Container query anchor so child components (PlayerPlaybackBar etc.)
  // can react to the player's own width rather than the viewport.
  container-name: preview-player;
  container-type: inline-size;
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
  overflow: hidden;
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
