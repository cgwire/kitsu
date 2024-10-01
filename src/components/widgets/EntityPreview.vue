<template>
  <div class="preview-wrapper preview-video" v-if="isMovie && showMovie">
    <video-viewer
      ref="video-viewer"
      :is-repeating="true"
      :default-height="height"
      :preview="{
        id: entity.preview_file_id,
        extension: entity.preview_file_extension
      }"
      :is-rounded-top-border="isRoundedTopBorder"
      @click="onVideoClicked()"
    />
    <button-simple
      class="button-play"
      icon="play"
      ref="button-play"
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
      <a class="view-icon" @click.stop="onPictureClicked()">
        <eye-icon :size="18" />
      </a>
    </template>
  </div>
</template>

<script>
import { EyeIcon } from 'lucide-vue-next'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import VideoViewer from '@/components/previews/VideoViewer.vue'

export default {
  name: 'entity-preview',

  components: {
    ButtonSimple,
    EyeIcon,
    VideoViewer
  },

  data() {
    return {
      isPlaying: false
    }
  },

  props: {
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
    isRoundedTopBorder: {
      default: false,
      type: Boolean
    },
    showMovie: {
      default: true,
      type: Boolean
    }
  },

  computed: {
    isMovie() {
      return this.entity.preview_file_extension === 'mp4'
    },

    thumbnailPath() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return `/api/pictures/previews/preview-files/${previewFileId}.png`
    },

    thumbnailKey() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return `preview-${previewFileId}`
    }
  },

  methods: {
    onPictureClicked() {
      if (this.noPreview) return
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      if (previewFileId) {
        this.$store.commit('SHOW_PREVIEW_FILE', previewFileId)
      }
    },
    onVideoClicked() {
      if (this.isPlaying) {
        this.$refs['video-viewer'].pause()
        this.$refs['button-play'].$el.style.display = 'initial'
      } else {
        this.$refs['video-viewer'].play()
        this.$refs['button-play'].$el.style.display = 'none'
      }
      this.isPlaying = !this.isPlaying
    }
  }
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
}

.cover {
  background-size: cover;
}
</style>
