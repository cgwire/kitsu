<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
      <img :src="previewPath">
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'

export default {
  name: 'preview-modal',
  mixins: [modalMixin],

  components: {
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    entity: {
      type: Object,
      default: () => {}
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
      const previewFileId = this.entity ? this.entity.preview_file_id : ''
      return this.active && this.entity
        ? '/api/pictures/originals/preview-files/' + previewFileId + '.png'
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
</style>
