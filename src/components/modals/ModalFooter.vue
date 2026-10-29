<template>
  <div class="modal-footer">
    <p class="has-text-right">
      <a
        :class="{
          button: true,
          'is-primary': true,
          'is-loading': isLoading,
          'is-disabled': isDisabled
        }"
        role="button"
        :aria-disabled="isDisabled"
        :tabindex="isDisabled ? -1 : 0"
        @click="confirm"
        @keydown.enter.prevent="confirm"
        @keydown.space.prevent="confirm"
      >
        {{ confirmLabel || $t('main.confirmation') }}
      </a>
      <button @click="$emit('cancel')" class="button is-link">
        {{ cancelLabel || $t('main.cancel') }}
      </button>
    </p>
    <p class="error mt1 has-text-left" v-if="isError">
      {{ errorText }}
    </p>
    <p class="success mt1 has-text-left" v-if="isSuccess">
      {{ successText }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  cancelLabel: { type: String, default: '' },
  confirmLabel: { type: String, default: '' },
  errorText: { type: String, default: '' },
  isDisabled: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  isSuccess: { type: Boolean, default: false },
  successText: { type: String, default: '' }
})

const emit = defineEmits(['cancel', 'confirm'])

// The disabled and loading looks only stop the mouse (pointer-events: none):
// Enter and Space still reach the button.
const confirm = () => {
  if (!props.isDisabled && !props.isLoading) emit('confirm')
}
</script>

<style lang="scss" scoped>
.modal-footer {
  margin-top: 3em;
}

.button {
  border-radius: 5px;
}

.error {
  margin-top: 1em;
}

.success {
  margin-top: 1em;
  color: $green;
}
</style>
