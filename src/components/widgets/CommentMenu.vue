<template>
  <div class="comment-menu hidden" ref="main">
    <div
      @click="onPinClicked"
      v-show="!isEmpty"
    >
      <span v-if="isPinned">
        {{ $t('comments.unpin') }}
      </span>
      <span v-else>{{ $t('comments.pin') }}</span>
    </div>
    <div
      @click="$emit('edit-clicked')"
      v-if="isEditable"
    >
      {{ $t('main.edit')}}
    </div>
    <div
      class="error"
      @click="$emit('delete-clicked')"
      v-if="isEditable"
    >
      {{ $t('main.delete')}}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'comment-menu',

  props: {
    isPinned: {
      type: Boolean,
      default: false
    },
    isCurrentUserAdmin: {
      type: Boolean,
      default: false
    },
    isEditable: {
      type: Boolean,
      default: true
    },
    isEmpty: {
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
    },

    onPinClicked () {
      this.$emit('pin-clicked')
      this.toggle()
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
