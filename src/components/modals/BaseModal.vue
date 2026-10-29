<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="onBackgroundClicked"></div>

    <div
      ref="contentRef"
      class="modal-content"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <div class="box">
        <h2 class="title">
          {{ title }}
        </h2>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRef } from 'vue'

import { useModal } from '@/composables/modal'

const props = defineProps({
  active: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['cancel'])

const contentRef = ref(null)

useModal(toRef(props, 'active'), emit, contentRef)

const onBackgroundClicked = () => {
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.modal {
  display: none;

  &.is-active {
    display: flex;
  }
}

@media screen and (max-width: 768px) {
  // Centred on the screen; the max height keeps a tall dialog clear of
  // the 60px topbar, since centring then leaves 70px above it.
  .modal {
    align-items: center;
  }

  .modal-content {
    margin: 0 0.5em;
    max-height: calc(100vh - 140px);
  }

  .box {
    padding: 1.5em;
  }

  .title {
    font-size: 1.5em;
  }
}
</style>
