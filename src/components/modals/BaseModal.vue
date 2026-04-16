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

<script setup>
import { toRef } from 'vue'

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

useModal(toRef(props, 'active'), emit)

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
  .modal-content {
    margin: 0 0.5em;
    max-height: calc(100vh - 40px);
  }

  .box {
    padding: 1.5em;
  }

  .title {
    font-size: 1.5em;
  }
}
</style>
