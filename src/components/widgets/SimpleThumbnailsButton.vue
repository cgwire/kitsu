<template>
  <button
    :class="{
      'level-item': true,
      button: true,
      'is-toggle': true,
      'is-on': isSimpleThumbnails
    }"
    :title="
      $t(
        isSimpleThumbnails
          ? 'doodle.close_simple_thumbnails'
          : 'doodle.simple_thumbnails'
      )
    "
    @click="toggleBigThumbnails"
  >
    <kitsu-icon
      class="icon is-small"
      :title="
        $t(
          isSimpleThumbnails
            ? 'doodle.close_simple_thumbnails'
            : 'doodle.simple_thumbnails'
        )
      "
      name="newsFeed"
    />
  </button>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import KitsuIcon from '@/components/widgets/KitsuIcon'

export default {
  name: 'simple-thumbnails-button',
  components: {
    KitsuIcon
  },

  props: {},

  computed: {
    ...mapGetters(['isSimpleThumbnails'])
  },

  methods: {
    ...mapActions(['setSimpleThumbnails', 'setCloseSimpleThumbnails']),

    toggleBigThumbnails() {
      if (this.isSimpleThumbnails) {
        this.setCloseSimpleThumbnails()
      } else {
        this.setSimpleThumbnails()
      }
    }
  },

  mounted() {},

  watch: {}
}
</script>

<style scoped>
.button {
  border-radius: 10px;
}
</style>
