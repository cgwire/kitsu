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
        @click="$emit('confirm')"
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
  </div>
</template>

<script>
export default {
  name: 'modal-footer',

  props: {
    cancelLabel: {
      type: String,
      default: ''
    },
    confirmLabel: {
      type: String,
      default: ''
    },
    errorText: {
      type: String,
      default: ''
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['cancel', 'confirm']
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
</style>
