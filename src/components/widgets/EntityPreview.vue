<template>
  <div class="preview-wrapper preview-video" v-if="isMovie">
    <video-viewer
      ref="video-viewer"
      :is-repeating="true"
      :default-height="height"
      :preview="{
        id: entity.preview_file_id,
        extension: entity.preview_file_extension
      }"
      @click.native="onVideoClicked()"
    />
    <button-simple
      class="button-play"
      icon="play"
      ref="button-play"
      :title="$t('playlists.actions.play')"
      @click="onVideoClicked()"
    />
  </div>
  <a
    class="preview-wrapper preview-picture"
    target="_blank"
    :style="{
      width: emptyWidth + 'px',
      'min-width': emptyWidth + 'px',
      height: emptyHeight + 'px',
      cursor: 'zoom-in'
    }"
    @click="onPictureClicked()"
    v-else
  >
    <img
      class="thumbnail-picture"
      :style="{
        width: 'auto',
        'max-height': emptyHeight + 'px'
      }"
      :width="width || ''"
      v-lazy="thumbnailPath"
      :key="thumbnailKey"
    />
  </a>
</template>

<script>
import ButtonSimple from '@/components/widgets/ButtonSimple'
import VideoViewer from '@/components/previews/VideoViewer'

export default {
  name: 'entity-preview',

  components: {
    ButtonSimple,
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
    square: {
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
    maxWidth: {
      default: null,
      type: Number
    },
    maxHeight: {
      default: null,
      type: Number
    },
    emptyHeight: {
      default: 30,
      type: Number
    },
    emptyWidth: {
      default: 50,
      type: Number
    },
    previewFileId: {
      default: null,
      type: String
    }
  },

  computed: {
    isMovie() {
      return this.entity.preview_file_extension === 'mp4'
    },

    isPreview() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return previewFileId && previewFileId.length > 0
    },

    thumbnailPath() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return '/api/pictures/previews/preview-files/' + previewFileId + '.png'
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
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
}

a {
  background: $black;
  display: flex;
  align-items: center;
  justify-content: center;
}

img {
  display: block;
  border: 0;
  border-radius: 0;
}

span.thumbnail-empty {
  background: $white-grey;
  display: block;
  margin: 0;
}

.thumbnail-picture.square {
  width: 100px;
  height: 100px;
}
</style>
