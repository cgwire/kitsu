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
        <p class="is-danger has-text-right" v-if="isError">{{ errorText }}</p>
        <p class="has-text-right">
          <a
            :class="{
              button: true,
              'is-loading': isLoading
            }"
            @click="$emit('confirm')"
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

<script>
import { modalMixin } from '@/components/modals/base_modal'

export default {
  name: 'confirm-modal',

  mixins: [modalMixin],

  props: {
    text: {
      required: true,
      type: String
    },
    active: {
      default: false,
      type: Boolean
    },
    isLoading: {
      default: false,
      type: Boolean
    },
    isError: {
      default: false,
      type: Boolean
    },
    errorText: {
      default: '',
      type: String
    },
    confirmButtonText: {
      default: '',
      type: String
    }
  },

  emits: ['cancel', 'confirm']
}
</script>

<style lang="scss" scoped>
.modal-content .box {
  padding: 2em;
}
.modal-content .box p.text {
  margin-bottom: 1em;
}
</style>
