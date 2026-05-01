<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        ref="nameField"
        :label="$t('assets.fields.name')"
        v-model.trim="form.name"
        @enter="runConfirmation"
        v-focus
      />
      <color-field :label="$t('main.color')" v-model="form.color" />

      <boolean-field
        class="mt1"
        :label="$t('main.is_shared')"
        v-model="form.is_shared"
        v-if="isCurrentUserManager && currentProduction"
      />

      <combobox-department
        class="mt2"
        :label="$t('main.department')"
        v-model="form.department_id"
        :top="true"
        v-if="form.is_shared === 'true'"
      />
    </form>

    <div v-if="groupToEdit?.id" class="mt2">
      {{ $t('main.created_by') }}:
      <people-name :person="personMap.get(groupToEdit.person_id)" />
    </div>

    <modal-footer
      :error-text="$t('main.filter_group_error')"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
/*
 * Modal used to edit filter group information.
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'
import ColorField from '@/components/widgets/ColorField.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  groupToEdit: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({ color: '', name: '', is_shared: 'false' })
const nameField = ref(null)

// Computed

const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const personMap = computed(() => store.getters.personMap)

const modalTitle = computed(() =>
  props.groupToEdit?.id
    ? `${t('main.filter_group_edit')} "${props.groupToEdit.name}"`
    : t('main.filter_group_add')
)

// Functions

const runConfirmation = event => {
  if (!form.value.name.length) {
    nameField.value?.focus()
    return
  }
  if (!event || event.keyCode === 13 || !event.keyCode) {
    emit('confirm', {
      ...form.value,
      is_shared: form.value.is_shared === 'true'
    })
  }
}

// Watchers

watch(
  () => props.groupToEdit,
  group => {
    const {
      id,
      color = '',
      name = '',
      is_shared = false,
      department_id = null
    } = group?.id ? group : {}
    form.value = {
      id,
      color,
      name,
      is_shared: is_shared ? 'true' : 'false',
      department_id
    }
  }
)

watch(
  () => props.active,
  active => {
    if (active) {
      setTimeout(() => {
        nameField.value?.focus()
      }, 100)
    }
  }
)
</script>
