<template>
  <base-modal
    :active="active"
    :title="$t('main.search_query_edit')"
    @cancel="$emit('cancel')"
  >
    <form @submit.prevent>
      <text-field
        ref="nameField"
        :label="$t('assets.fields.name')"
        v-model.trim="form.name"
        @enter="runConfirmation"
        v-focus
      />

      <text-field
        :label="$t('main.search_query')"
        v-model.trim="form.search_query"
        @enter="runConfirmation"
      />

      <boolean-field
        :label="$t('main.is_shared')"
        v-model="form.is_shared"
        @click="form.search_filter_group_id = null"
        v-if="isCurrentUserManager && currentProduction"
      />

      <combobox-department
        class="mt2"
        :label="$t('main.department')"
        :top="true"
        v-model="form.department_id"
        v-if="form.is_shared === 'true'"
      />

      <combobox
        class="mt2"
        :label="$t('main.filter_group')"
        :options="allowedGroups"
        v-model="form.search_filter_group_id"
        v-if="isGroupEnabled && allowedGroups.length > 1"
      />
    </form>

    <div v-if="searchQueryToEdit?.id" class="mt2">
      {{ $t('main.created_by') }}:
      <people-name :person="personMap.get(searchQueryToEdit.person_id)" />
    </div>

    <modal-footer
      :error-text="$t('main.search_query_edit_error')"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
/*
 * Modal used to edit search filter information. Users prefer to rename the
 * filter label when it's too complex to read or too long.
 */
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import TextField from '@/components/widgets/TextField.vue'

const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  groupOptions: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isGroupEnabled: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  searchQueryToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({
  id: null,
  name: '',
  search_filter_group_id: null,
  search_query: '',
  is_shared: 'false'
})
const nameField = ref(null)

// Computed

const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const personMap = computed(() => store.getters.personMap)

const allowedGroups = computed(() =>
  props.groupOptions.filter(
    group =>
      group.is_shared === (form.value.is_shared === 'true') ||
      group.value === null
  )
)

// Functions

const runConfirmation = event => {
  if (!form.value.name.length) {
    nameField.value?.focus()
    return
  }
  if (!event || event.keyCode === 13 || !event.keyCode) {
    emit('confirm', {
      id: props.searchQueryToEdit.id,
      ...form.value,
      is_shared: form.value.is_shared === 'true'
    })
  }
}

// Watchers

watch(
  () => props.searchQueryToEdit,
  searchQuery => {
    if (searchQuery?.id) {
      form.value = {
        id: searchQuery.id,
        name: searchQuery.name,
        search_filter_group_id: searchQuery.search_filter_group_id,
        search_query: searchQuery.search_query,
        is_shared: searchQuery.is_shared ? 'true' : 'false',
        department_id: searchQuery.department_id
      }
    } else {
      form.value = {
        id: null,
        name: '',
        search_filter_group_id: null,
        search_query: '',
        is_shared: 'false',
        department_id: null
      }
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
