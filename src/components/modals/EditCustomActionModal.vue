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
        <h1 class="title" v-if="isEditing">
          {{ $t('custom_actions.edit_title') }} {{ customActionToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('custom_actions.new_custom_action') }}
        </h1>

        <form @submit.prevent>
          <text-field
            ref="nameField"
            :errored="errors.name"
            :label="$t('custom_actions.fields.name')"
            v-model.trim="form.name"
            v-focus
            @enter="confirmClicked"
          />

          <text-field
            ref="urlField"
            :errored="errors.url"
            :label="$t('custom_actions.fields.url')"
            placeholder="https://..."
            type="url"
            v-model.trim="form.url"
            @enter="confirmClicked"
          />

          <combobox
            :label="$t('custom_actions.fields.entity_type')"
            :options="entityTypeOptions"
            locale-key-prefix="custom_actions.entity_types."
            v-model="form.entityType"
            @enter="confirmClicked"
          />

          <combobox-boolean
            :label="$t('custom_actions.fields.is_ajax')"
            v-model="form.isAjax"
            @enter="confirmClicked"
          />
        </form>

        <modal-footer
          :error-text="$t('custom_actions.create_error')"
          :is-loading="isLoading"
          :is-error="isError"
          @confirm="confirmClicked"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref, toRef, watch } from 'vue'

import { useModal } from '@/composables/modal'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  customActionToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm'])

useModal(toRef(props, 'active'), emit)

// Constants

const entityTypeOptions = [
  { label: 'all', value: 'all' },
  { label: 'asset', value: 'asset' },
  { label: 'shot', value: 'shot' },
  { label: 'sequence', value: 'sequence' },
  { label: 'edit', value: 'edit' },
  { label: 'episode', value: 'episode' }
]

// State

const nameField = ref(null)
const urlField = ref(null)

const form = reactive({
  name: '',
  url: '',
  entityType: 'all',
  isAjax: 'false'
})

const errors = reactive({ name: false, url: false })

// Computed

const isEditing = computed(() => Boolean(props.customActionToEdit?.id))

// Functions

const confirmClicked = () => {
  errors.name = false
  errors.url = false
  if (!form.name) {
    errors.name = true
    nameField.value.focus()
    return
  }
  if (!form.url) {
    errors.url = true
    urlField.value.focus()
    return
  }
  emit('confirm', { ...form })
}

// Watchers

watch(
  () => props.customActionToEdit,
  () => {
    if (!props.customActionToEdit) return
    Object.assign(form, {
      name: props.customActionToEdit.name || '',
      url: props.customActionToEdit.url || '',
      entityType: props.customActionToEdit.entity_type || 'all',
      isAjax: String(props.customActionToEdit.is_ajax === true)
    })
  },
  { immediate: true }
)

watch(
  () => props.active,
  isActive => {
    if (!isActive) return
    nextTick(() => nameField.value?.focus())
  },
  { immediate: true }
)
</script>
