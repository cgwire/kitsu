<template>
  <div class="comment-menu">
    <div @click="$emit('pin-clicked')" v-if="isPinnable && !isEmpty">
      {{ isPinned ? $t('comments.unpin') : $t('comments.pin') }}
    </div>
    <div @click="$emit('edit-clicked')" v-if="isEditable">
      {{ $t('main.edit') }}
    </div>
    <div class="error" @click="$emit('delete-clicked')" v-if="isEditable">
      {{ $t('main.delete') }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'comment-menu',

  props: {
    isEditable: {
      type: Boolean,
      default: true
    },
    isEmpty: {
      type: Boolean,
      default: false
    },
    isPinnable: {
      type: Boolean,
      default: true
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  },

  emits: ['delete-clicked', 'edit-clicked', 'pin-clicked']
}
</script>

<style lang="scss" scoped>
.dark .comment-menu {
  background-color: $dark-grey-light;
  box-shadow: 0 2px 6px $dark-grey-light;
  color: $light-grey-light;
}

.comment-menu {
  border-radius: 10px;
  position: absolute;
  background: white;
  width: 118px;
  box-shadow: 0 2px 6px $light-grey;
  top: 20px;
  left: -90px;
  z-index: 100;
  overflow: hidden;

  div {
    cursor: pointer;
    padding: 0.5em;

    &:hover {
      background-color: var(--background-alt);
    }
  }
}
</style>
