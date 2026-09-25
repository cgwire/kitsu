<template>
  <img
    class="thumbnail-picture"
    draggable="false"
    loading="lazy"
    alt=""
    :key="previewFileId"
    :src="thumbnailUrl"
    :style="{
      width,
      height,
      'max-width': maxWidth,
      'max-height': maxHeight
    }"
    v-if="isPreviewWithThumbnail"
  />
  <span
    class="thumbnail-picture thumbnail-empty"
    :class="{ 'thumbnail-processing': isProcessing }"
    :style="{
      width: emptyWidth ? emptyWidth : width,
      height: emptyHeight ? emptyHeight : height
    }"
    v-else
  >
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  previewFileId: {
    type: String
  },
  previewFileStatus: {
    type: String,
    default: 'ready'
  },
  extension: {
    type: String
  },
  width: {
    default: '150px',
    type: String
  },
  height: {
    default: '50px',
    type: String
  },
  maxHeight: {
    default: 'auto',
    type: String
  },
  maxWidth: {
    default: 'auto',
    type: String
  },
  emptyHeight: {
    type: String
  },
  emptyWidth: {
    type: String
  },
  type: {
    default: 'thumbnails',
    type: String
  },
  urlPrefix: {
    default: '',
    type: String
  }
})

// The server builds the variants in the background: asking for a picture
// that is not stored yet would only draw a broken image.
const isProcessing = computed(() => props.previewFileStatus === 'processing')

const isPreviewWithThumbnail = computed(() => {
  return (
    !isProcessing.value &&
    props.previewFileId &&
    (!props.extension || ['mp4', 'png'].includes(props.extension))
  )
})

const thumbnailUrl = computed(() => {
  const base = props.urlPrefix || '/api'
  return `${base}/pictures/${props.type}/preview-files/${props.previewFileId}.png`
})
</script>

<style lang="scss" scoped>
.dark .thumbnail-picture {
  background-color: $dark-grey-lighter;
  border-color: $dark-grey-light;
}

span.thumbnail-empty {
  background: $white-grey;
  display: block;
  flex-shrink: 0;
  margin: 0;
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

// Respect a reader who asked the system for less movement.
@media (prefers-reduced-motion: reduce) {
  .thumbnail-processing {
    animation: none;
    background-image: none;
    opacity: 0.6;
  }
}
</style>
