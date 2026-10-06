<template>
  <div class="preview-wrapper preview-video" v-if="isMovie && showMovie">
    <video-viewer
      ref="videoViewerRef"
      :is-repeating="true"
      :default-height="height"
      :preview="{
        id: entity.preview_file_id,
        extension: entity.preview_file_extension
      }"
      :is-rounded-top-border="isRoundedTopBorder"
      role="button"
      tabindex="0"
      @click="onVideoClicked()"
      @keydown.enter.prevent="onVideoClicked()"
      @keydown.space.prevent="onVideoClicked()"
    />
    <button-simple
      class="button-play"
      icon="play"
      ref="buttonPlayRef"
      :title="$t('playlists.actions.play')"
      @click="onVideoClicked()"
    />
  </div>
  <div
    class="preview-wrapper preview-picture"
    :class="{ cover }"
    :style="{
      width: emptyWidth ? `${emptyWidth}px` : undefined,
      'min-width': emptyWidth ? `${emptyWidth}px` : undefined,
      height: emptyHeight ? `${emptyHeight}px` : undefined,
      'border-top-left-radius': isRoundedTopBorder ? '10px' : undefined,
      'border-top-right-radius': isRoundedTopBorder ? '10px' : undefined,
      'background-image': cover ? `url(${thumbnailPath})` : undefined
    }"
    v-else
  >
    <template v-if="!cover">
      <span class="thumbnail-processing" v-if="isProcessing"></span>
      <span class="preview-broken" v-else-if="isBroken">
        {{ $t('preview.broken') }}
      </span>
      <template v-else>
        <img
          class="thumbnail-picture"
          loading="lazy"
          :key="thumbnailKey"
          :src="thumbnailPath"
          :style="{
            width: 'auto',
            'max-height': `${emptyHeight}px`
          }"
          :width="width || ''"
          alt=""
        />
        <a
          class="view-icon"
          role="button"
          tabindex="0"
          v-if="!noPreview"
          @click.stop="onPictureClicked()"
          @keydown.enter.stop.prevent="onPictureClicked()"
          @keydown.space.stop.prevent="onPictureClicked()"
        >
          <eye-icon :size="18" />
        </a>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { EyeIcon } from 'lucide-vue-next'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import VideoViewer from '@/components/players/viewers/VideoViewer.vue'

const store = useStore()

const props = defineProps({
  entity: {
    default: () => {},
    type: Object
  },
  cover: {
    default: false,
    type: Boolean
  },
  width: {
    default: null,
    type: Number
  },
  height: {
    default: null,
    type: Number
  },
  emptyHeight: {
    default: null,
    type: Number
  },
  emptyWidth: {
    default: null,
    type: Number
  },
  previewFileId: {
    default: null,
    type: String
  },
  previewFileStatus: {
    default: 'ready',
    type: String
  },
  isRoundedTopBorder: {
    default: false,
    type: Boolean
  },
  showMovie: {
    default: true,
    type: Boolean
  },
  noPreview: {
    default: false,
    type: Boolean
  }
})

const isPlaying = ref(false)
const videoViewerRef = ref(null)
const buttonPlayRef = ref(null)

const isMovie = computed(() => {
  return props.entity.preview_file_extension === 'mp4'
})

// The server builds the variants in the background: asking for a picture
// that is not stored yet would only draw a broken image.
const isProcessing = computed(() => props.previewFileStatus === 'processing')

const isBroken = computed(() =>
  ['broken', 'missing'].includes(props.previewFileStatus)
)

const thumbnailPath = computed(() => {
  const previewFileId = props.previewFileId || props.entity.preview_file_id
  return `/api/pictures/previews/preview-files/${previewFileId}.png`
})

const thumbnailKey = computed(() => {
  const previewFileId = props.previewFileId || props.entity.preview_file_id
  return `preview-${previewFileId}`
})

const onPictureClicked = () => {
  if (props.noPreview) return
  const previewFileId = props.previewFileId || props.entity.preview_file_id
  if (previewFileId) {
    store.commit('SHOW_PREVIEW_FILE', previewFileId)
  }
}

const onVideoClicked = () => {
  if (isPlaying.value) {
    videoViewerRef.value.pause()
    buttonPlayRef.value.$el.style.display = 'initial'
  } else {
    videoViewerRef.value.play()
    buttonPlayRef.value.$el.style.display = 'none'
  }
  isPlaying.value = !isPlaying.value
}
</script>

<style lang="scss" scoped>
.preview-video {
  position: relative;
  width: 300px;
  min-height: 200px;
  cursor: pointer;
}

.button-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 40px;
  width: 40px;
  padding-left: 13px;
  line-height: initial;
  opacity: 0.75;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.preview-picture {
  position: relative;
  background: $black;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;

  .thumbnail-picture {
    display: block;
    border: 0;
    border-radius: 0;
  }

  .view-icon {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    color: $light-grey-light;
    display: none;
    padding: 0.4rem;
    height: 30px;
    position: absolute;
    right: 10px;
    top: 10px;
    width: 30px;
    transition: all 0.2s ease-in-out;

    &:hover {
      background: rgba(0, 0, 0, 0.75);
      color: $white;
    }
  }

  &:hover .view-icon {
    display: block;
  }

  .thumbnail-processing,
  .preview-broken {
    // longhand: the background shorthand would drop the shimmer gradient
    background-color: var(--background-tag);
    height: 100%;
    width: 100%;
  }

  .preview-broken {
    align-items: center;
    color: var(--text-strong);
    display: flex;
    font-size: 0.85em;
    justify-content: center;
    padding: 0 1em;
    text-align: center;
  }
}

// The variants are still being built: a slow shimmer reads as "on its
// way", where the plain empty block reads as "no preview at all".
.thumbnail-processing {
  background-image: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0) 35%,
    rgba(255, 255, 255, 0.65) 50%,
    rgba(255, 255, 255, 0) 65%
  );
  background-repeat: no-repeat;
  background-size: 250% 100%;
  animation: thumbnail-processing-shimmer 1.6s ease-in-out infinite;
}

.dark .thumbnail-processing {
  background-image: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0) 35%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0) 65%
  );
}

@keyframes thumbnail-processing-shimmer {
  from {
    background-position: 175% 0;
  }
  to {
    background-position: -75% 0;
  }
}

// The dark rule outranks a lone class, and its gradient left still would
// draw a band on the placeholder.
@media (prefers-reduced-motion: reduce) {
  .thumbnail-processing,
  .dark .thumbnail-processing {
    animation: none;
    background-image: none;
  }
}

.cover {
  background-size: cover;
}
</style>
