<template>
  <base-modal :active="active" @cancel="$emit('cancel')">
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
        @click="confirm"
        @keydown.enter.prevent="confirm"
        @keydown.space.prevent="confirm"
      >
        {{ confirmButtonText || $t('main.confirmation') }}
      </a>
      <button class="button is-link" @click="$emit('cancel')">
        {{ $t('main.cancel') }}
      </button>
    </p>
  </base-modal>
</template>

<script setup>
import BaseModal from '@/components/modals/BaseModal.vue'

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

// the loading look only stops the mouse (pointer-events: none): Enter and
// Space still reach the button
const confirm = () => {
  if (!props.isLoading) emit('confirm')
}
</script>

<style lang="scss" scoped>
:deep(.box) {
  padding: 2em;
}

.text {
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
