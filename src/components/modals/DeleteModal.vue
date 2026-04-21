<template>
  <div
    :class="{
      modal: true,
      'delete-modal': true,
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
              'is-danger': true,
              'is-loading': isLoading
            }"
            @click="$emit('confirm')"
          >
            {{ deleteButtonText || $t('main.confirmation') }}
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
  text: { required: true, type: String },
  active: { default: false, type: Boolean },
  isLoading: { default: false, type: Boolean },
  isError: { default: false, type: Boolean },
  errorText: { default: '', type: String },
  deleteButtonText: { default: '', type: String }
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
</style>
