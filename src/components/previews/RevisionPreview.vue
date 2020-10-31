<template>
<div class="wrapper flexrow">
  <drag @drag="onDragged" :transfer-data="index">
    <div
      :class="{
        'flerow-item': true,
        'revision-preview': true,
        selected: isSelected
      }"
      @click.prevent="onSelected"
    >
      <light-entity-thumbnail
        width="150px"
        height="103px"
        :preview-file-id="previewFile.id"
        v-if="hasThumbnail"
      />
      <span :title="originalName" v-else>
        .{{ previewFile.extension }}
      </span>
    </div>
  </drag>
  <drop @drop="onDropped">
    <div class="drop-area flexrow-item" ref="drop-area"></div>
  </drop>
</div>
</template>

<script>
/*
 * Widget to display a preview listed in a revision. It allows to select a
 * given file for current revision.
 * It fires events about drag'n'drop reordering too.
 */
import { mapGetters } from 'vuex'

import LightEntityThumbnail from '@/components/widgets/LightEntityThumbnail'

export default {
  name: 'revision-preview',

  components: {
    LightEntityThumbnail
  },

  data () {
    return {}
  },

  props: {
    index: {
      required: true,
      type: Number
    },
    isSelected: {
      default: false,
      type: Boolean
    },
    previewFile: {
      required: true,
      type: Object
    }
  },

  mounted () {
    this.setListeners()
  },

  computed: {
    ...mapGetters([
      'isCurrentUserManager'
    ]),

    dropArea () {
      return this.$refs['drop-area']
    },

    hasThumbnail () {
      return ['mp4', 'png'].includes(this.previewFile.extension)
    },

    originalName () {
      return `${this.previewFile.original_name}.${this.previewFile.extension}`
    }
  },

  methods: {
    onSelected () {
      this.$emit('selected', this.index)
    },

    setListeners () {
      this.dropArea.addEventListener('dragover', this.onDragover)
      this.dropArea.addEventListener('dragleave', this.onDragleave)
    },

    onDragged () {
    },

    onDragleave () {
      this.dropArea.style.background = 'transparent'
      this.dropArea.style.width = '15px'
    },

    onDragover () {
      this.dropArea.style.width = '60px'
    },

    onDropped (previousIndex) {
      this.dropArea.style.background = 'transparent'
      this.dropArea.style.width = '15px'
      this.$emit('preview-dropped', {
        previousIndex,
        newIndex: this.index
      })
    }
  },

  watch: {
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  align-items: stretch;

  .flexrow-item {
    margin: 0;
  }
}

.drop-area {
  width: 15px;
  height: 100%;
  transition: width 0.3s ease;
}

.revision-preview {
  border-top: 3px solid transparent;
  border-radius: 5px;
  border: 3px solid transparent;
  box-shadow: 2px 2px 2px $dark-grey-strong;
  background: $dark-grey-lighter;
  height: 109px;
  min-width: 150px;
  position: relative;
  cursor: pointer;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  &.selected {
    border: 3px solid $green;
  }

  img {
    border-radius: 5px;
    margin: 0;
  }

  span {
    text-align: center;
    font-weight: bold;
    color: $white-grey;
  }
}
</style>
