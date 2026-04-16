<template>
  <a
    class="thumbnail-wrapper thumbnail-picture"
    target="_blank"
    :style="{
      width: emptyWidth + 'px',
      'min-width': emptyWidth + 'px',
      height: emptyHeight + 'px',
      cursor: noPreview ? 'default' : 'zoom-in'
    }"
    @click="onClicked"
    v-if="isPreview && withLink"
  >
    <img
      class="thumbnail-picture"
      loading="lazy"
      :key="thumbnailKey"
      :src="thumbnailPath"
      :style="imgStyle"
      :width="width || ''"
      alt=""
    />
  </a>

  <img
    v-else-if="isPreview && !withLink"
    class="thumbnail-picture"
    loading="lazy"
    :key="thumbnailKey"
    :src="thumbnailPath"
    :style="imgStyle"
    alt=""
  />

  <span
    :class="{
      'thumbnail-picture': true,
      'thumbnail-empty': true,
      square: square
    }"
    :style="imgStyle"
    v-else
  >
  </span>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const props = defineProps({
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
  noPreview: {
    default: false,
    type: Boolean
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
  },
  withLink: {
    default: true,
    type: Boolean
  }
})

const timer = ref('')

const isPreview = computed(() => {
  const previewFileId = props.previewFileId || props.entity?.preview_file_id
  return previewFileId?.length > 0
})

const imgStyle = computed(() => {
  const style = {}
  if (props.emptyWidth) {
    style['max-width'] = props.emptyWidth + 'px'
    style['min-width'] = props.emptyWidth + 'px'
  } else if (props.maxWidth) {
    style['max-width'] = props.maxWidth + 'px'
  } else if (props.width) {
    style.width = props.width + 'px'
    style['min-width'] = props.width + 'px'
  }
  if (props.emptyHeight) {
    style['max-height'] = props.emptyHeight + 'px'
    style['min-height'] = props.emptyHeight + 'px'
  } else if (props.maxHeight) {
    style['max-height'] = props.maxHeight + 'px'
  } else if (props.height) {
    style.height = props.height + 'px'
  }
  return style
})

const thumbnailPath = computed(() => {
  const previewFileId = props.previewFileId || props.entity.preview_file_id

  if (props.square) {
    return (
      '/api/pictures/thumbnails-square/preview-files/' + previewFileId + '.png'
    )
  } else {
    if (props.width && props.width > 150) {
      return (
        '/api/pictures/previews/preview-files/' +
        previewFileId +
        '.png' +
        timer.value
      )
    } else {
      return (
        '/api/pictures/thumbnails/preview-files/' +
        previewFileId +
        '.png' +
        timer.value
      )
    }
  }
})

const thumbnailKey = computed(() => {
  const previewFileId = props.previewFileId || props.entity.preview_file_id
  return `thumbnail-${previewFileId}`
})

const onClicked = () => {
  if (props.noPreview) return
  const previewFileId = props.previewFileId || props.entity.preview_file_id
  store.commit('SHOW_PREVIEW_FILE', previewFileId)
}

watch(
  () => props.previewFileId,
  () => {
    timer.value = '?t=' + new Date().valueOf()
  }
)

watch(
  () => props.entity?.preview_file_id,
  () => {
    timer.value = '?t=' + new Date().valueOf()
  }
)
</script>

<style lang="scss" scoped>
.dark {
  table .thumbnail-picture.thumbnail-empty {
    background: $dark-grey-lighter;
    border-color: $dark-grey-light;
  }

  .thumbnail-picture,
  span.thumbnail-empty {
    background: $dark-grey-light;
    border-color: $dark-grey;
  }
}

.thumbnail-picture {
  border-radius: 4px;
  margin: 0;
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

table .thumbnail-picture.thumbnail-empty {
  background: $white-grey;
  border: 1px solid $light-grey;
  margin: 0;
}

table .thumbnail-wrapper {
}

table .thumbnail-picture {
  background-color: black;
  border: 0;
  margin: 0;
  padding: 0;
}

.thumbnail-wrapper {
  padding: 0;
  border: 0;
  border-radius: 4px;
  display: inline-block;
}
</style>
