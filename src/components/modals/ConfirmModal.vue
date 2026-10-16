<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>
    <div class="modal-content">
      <div class="box">
        <p class="text">{{ text }}</p>
        <div class="progress-wrapper" v-if="progress !== null">
          <div class="progress" :style="{ width: `${progress}%` }"></div>
        </div>
        <p class="is-danger has-text-right" v-if="isError">{{ errorText }}</p>
        <p class="has-text-right">
          <a
            :class="{
              button: true,
              'is-primary': !isDanger,
              'is-danger': isDanger,
              'is-loading': isLoading
            }"
            role="button"
            tabindex="0"
            @click="$emit('confirm')"
            @keydown.enter.prevent="$emit('confirm')"
            @keydown.space.prevent="$emit('confirm')"
          >
            {{ confirmButtonText || $t('main.confirmation') }}
          </a>
          <button class="button is-link" @click="$emit('cancel')">
            {{ $t('main.cancel') }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRef } from 'vue'

import { useModal } from '@/composables/modal'

const props = defineProps({
  active: { type: Boolean, default: false },
  confirmButtonText: { type: String, default: '' },
  errorText: { type: String, default: '' },
  isDanger: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  // percentage of a long confirmation, null for none
  progress: { type: Number, default: null },
  text: { type: String, required: true }
})

const emit = defineEmits(['cancel', 'confirm'])

useModal(toRef(props, 'active'), emit)
</script>

<style lang="scss" scoped>
.modal-content .box {
  padding: 2em;
}
.modal-content .box p.text {
  margin-bottom: 1em;
}

// same bar as the file uploads
.progress-wrapper {
  border-radius: 5px;
  background: var(--background-alt);
  height: 5px;
  margin-bottom: 1em;
}

.progress {
  height: 5px;
  background-color: $light-green;
}
</style>
