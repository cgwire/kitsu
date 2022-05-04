<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>
  <div class="new-window">
    <a target="_blank" :href="previewPath">
      <arrow-up-right-icon />
    </a>
  </div>

  <div
    class="modal-content"
    @click="$emit('cancel')"
  >
    <img :src="previewPath">
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'

import { ArrowUpRightIcon } from 'vue-feather-icons'

export default {
  name: 'preview-modal',
  mixins: [modalMixin],

  components: {
    ArrowUpRightIcon
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    previewFileId: {
      type: String,
      default: ''
    }
  },

  mounted () {
  },

  data () {
    return {
    }
  },

  computed: {
    ...mapGetters([
    ]),

    previewPath () {
      const id = this.previewFileId
      return this.active && this.previewFileId
        ? '/api/pictures/originals/preview-files/' + id + '.png'
        : ''
    }
  },

  methods: {
    ...mapActions([
    ])
  },

  watch: {
  }
}
</script>

<style lang="scss" scoped>
.error {
  margin-top: 1em;
}

.new-window {
  color: $grey;
  position: absolute;
  right: 1em;
  top: 1em;
}

.modal-content {
  width: 100%;
  text-align: center;

  img {
    max-height: 100vh;
  }
}
</style>
