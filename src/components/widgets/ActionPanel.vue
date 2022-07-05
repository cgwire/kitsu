<template>
  <div :class="{
    'action-panel': true,
    'block': true,
    'hidden': !active
  }">
  toto
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'action-panel',

  props: {
    active: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
    }
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
    ]),

    toggle () {
      const mainEl = this.$refs.main
      if (mainEl.className === 'comment-menu') {
        mainEl.className = 'comment-menu hidden'
      } else {
        mainEl.className = 'comment-menu'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .comment-menu {
  background-color: $dark-grey-light;
  box-shadow: 0px 2px 6px $dark-grey-light;
  color: $light-grey-light;
}

.comment-menu {
  position: absolute;
  background: white;
  width: 118px;
  box-shadow: 0px 2px 6px $light-grey;
  top: 20px;
  left: -90px;
  z-index: 100;
}

.comment-menu div {
  cursor: pointer;
}

.comment-menu div {
  padding: 0.5em;
}
</style>
