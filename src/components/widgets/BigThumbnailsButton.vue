<template>
  <button
    :class="{
      'level-item': true,
      button: true,
      'is-toggle': true,
      'is-on': isBigThumbnails
    }"
    :title="
      $t(isBigThumbnails ? 'tasks.small_thumbnails' : 'tasks.big_thumbnails')
    "
    @click="toggleBigThumbnails"
  >
    <grid-icon class="icon is-small" />
  </button>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { GridIcon } from 'vue-feather-icons'

export default {
  name: 'big-thumbnails-button',
  components: {
    GridIcon
  },

  props: {},

  computed: {
    ...mapGetters(['isBigThumbnails'])
  },

  methods: {
    ...mapActions(['setBigThumbnails', 'setSmallThumbnails']),

    toggleBigThumbnails() {
      if (this.isBigThumbnails) {
        this.setSmallThumbnails()
      } else {
        this.setBigThumbnails()
      }
    }
  },

  mounted() {
    if (localStorage.getItem('big-thumbnails') === 'true') {
      this.setBigThumbnails()
    } else {
      this.setSmallThumbnails()
    }
  },

  watch: {
    isBigThumbnails() {
      localStorage.setItem('big-thumbnails', this.isBigThumbnails, {
        expires: '1M'
      })
    }
  }
}
</script>
