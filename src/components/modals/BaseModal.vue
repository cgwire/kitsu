<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="onBackgroundClicked"></div>

    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ title }}
        </h1>
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
/*
 */
import { modalMixin } from './base_modal'

export default {
  name: 'base-modal',

  mixins: [modalMixin],

  emits: ['cancel'],

  components: {},

  props: {
    active: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },

  data() {
    return {}
  },

  methods: {
    onBackgroundClicked() {
      this.$emit('cancel')
    }
  },

  watch: {}
}
</script>

<style scoped>
.modal {
  display: none;

  &.is-active {
    display: flex;
  }
}
</style>
