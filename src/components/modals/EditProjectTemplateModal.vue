<template>
  <base-modal
    :active="active"
    :title="
      isEditing
        ? `${$t('project_templates.edit_title')} ${templateToEdit.name}`
        : $t('project_templates.new_project_template')
    "
    @cancel="$emit('cancel')"
  >
    <form @submit.prevent>
      <text-field
        ref="nameField"
        :label="$t('project_templates.fields.name')"
        :maxlength="80"
        v-model="form.name"
        v-focus
        @input="isNameEmpty = false"
      />
      <p class="error" v-if="isNameEmpty">
        {{ $t('project_templates.name_required') }}
      </p>
      <p class="error" v-if="isDuplicate">
        {{ $t('project_templates.duplicate_name') }}
      </p>
      <div class="flexrow mt2">
        <combobox-styled
          class="flexrow-item"
          :options="productionTypeOptions"
          :label="$t('productions.fields.type')"
          locale-key-prefix="productions.type."
          v-model="form.production_type"
        />
        <combobox-styled
          class="flexrow-item"
          :options="productionStyleOptions"
          :label="$t('productions.fields.style')"
          locale-key-prefix="productions.style."
          v-model="form.production_style"
        />
      </div>
      <text-field
        class="mt2"
        :label="$t('project_templates.fields.description')"
        v-model="form.description"
        is-textarea
      />
    </form>
    <modal-footer
      :error-text="$t('project_templates.create_error')"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

import BaseModal from '@/components/modals/BaseModal.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'
import {
  PRODUCTION_TYPE_OPTIONS,
  PRODUCTION_STYLE_OPTIONS
} from '@/lib/productions'

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isDuplicate: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  templateToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm'])

const nameField = ref(null)
const isNameEmpty = ref(false)

const productionTypeOptions = PRODUCTION_TYPE_OPTIONS
const productionStyleOptions = PRODUCTION_STYLE_OPTIONS

const defaultForm = () => ({
  id: null,
  name: '',
  description: '',
  production_type: 'short',
  production_style: '2d3d'
})

const form = ref(defaultForm())

const isEditing = computed(() => props.templateToEdit?.id)

const runConfirmation = () => {
  isNameEmpty.value = !form.value.name || !form.value.name.trim()
  if (isNameEmpty.value) return
  emit('confirm', form.value)
}

watch(
  () => props.active,
  active => {
    if (active) {
      nextTick(() => {
        nameField.value?.focus()
      })
    }
  }
)

watch(
  () => props.templateToEdit,
  () => {
    if (isEditing.value) {
      form.value = {
        id: props.templateToEdit.id,
        name: props.templateToEdit.name || '',
        description: props.templateToEdit.description || '',
        production_type: props.templateToEdit.production_type || 'short',
        production_style: props.templateToEdit.production_style || '2d3d'
      }
    } else {
      form.value = defaultForm()
    }
  }
)
</script>

<style lang="scss" scoped>
.flexrow {
  gap: 1em;
}

.error {
  color: $red;
  font-size: 0.85em;
  margin-top: -1.4rem;
}
</style>
