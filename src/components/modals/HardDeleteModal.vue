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
        <p>
          <input
            type="text"
            ref="confirmationName"
            class="input"
            v-model="userLockText"
          />
        </p>
        <p class="is-danger" v-if="isError">{{ errorText }}</p>
        <div class="has-text-right flexrow">
          <div class="filler"></div>
          <combobox
            class="flexrow-item"
            :options="selectionOptions"
            :with-margin="false"
            v-model="selectionOnly"
            v-if="selectionOption"
          />
          <a
            :class="{
              button: true,
              'is-danger': true,
              'is-loading': isLoading
            }"
            :disabled="isLocked || null"
            @click="$emit('confirm', selectionOnly === 'true')"
          >
            {{ $t('main.confirmation') }}
          </a>
          <button @click="$emit('cancel')" class="button is-link">
            {{ $t('main.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useModal } from '@/composables/modal'

import Combobox from '@/components/widgets/Combobox.vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  errorText: { type: String, default: '' },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  lockText: { type: String, default: 'locked' },
  selectionOption: { type: Boolean, default: false },
  text: { type: String, default: '' }
})

const emit = defineEmits(['cancel', 'confirm'])

const { t } = useI18n()

useModal(toRef(props, 'active'), emit)

const confirmationName = ref(null)
const selectionOnly = ref('true')
const userLockText = ref('')

const selectionOptions = [
  { label: t('tasks.for_selection'), value: 'true' },
  { label: t('tasks.for_project'), value: 'false' }
]

const isLocked = computed(
  () => props.lockText === 'locked' || props.lockText !== userLockText.value
)

watch(
  () => props.active,
  isActive => {
    if (isActive) {
      userLockText.value = ''
      nextTick(() => confirmationName.value?.focus())
    }
  }
)
</script>

<style lang="scss" scoped>
.flexrow {
  align-items: center;
  justify-content: center;
}

.input {
  margin-bottom: 1em;
  border-radius: 10px;
}
</style>
