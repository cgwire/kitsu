<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        ref="nameField"
        :label="$t('assets.fields.name')"
        :maxlength="NAME_MAX_LENGTH"
        v-model.trim="form.name"
        @enter="runConfirmation"
        v-focus
      />

      <text-field
        ref="queryField"
        :errored="isQueryTooLong"
        :error-text="
          $t('main.search_query_too_long', { count: QUERY_MAX_LENGTH })
        "
        :label="$t('main.search_query')"
        :maxlength="QUERY_MAX_LENGTH"
        v-model.trim="form.search_query"
        @enter="runConfirmation"
      />

      <boolean-field
        :label="$t('main.is_shared')"
        v-model="form.is_shared"
        @click="form.search_filter_group_id = null"
        v-if="isCurrentUserManager && productionId"
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
      :error-text="
        searchQueryToEdit?.id
          ? $t('main.search_query_edit_error')
          : $t('main.search_query_add_error')
      "
      :is-disabled="isQueryTooLong"
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
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import stringHelpers from '@/lib/string'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import TextField from '@/components/widgets/TextField.vue'

// The lengths of the Zou columns.
const NAME_MAX_LENGTH = 200
const QUERY_MAX_LENGTH = 500

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  groupOptions: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isGroupEnabled: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  productionId: { type: String, default: null },
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
const queryField = ref(null)

// Computed

const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const personMap = computed(() => store.getters.personMap)

const modalTitle = computed(() =>
  props.searchQueryToEdit?.id
    ? t('main.search_query_edit')
    : t('main.search_query_add')
)

const isQueryTooLong = computed(
  () => Array.from(form.value.search_query).length > QUERY_MAX_LENGTH
)

const allowedGroups = computed(() =>
  props.groupOptions.filter(
    group =>
      group.is_shared === (form.value.is_shared === 'true') ||
      group.value === null
  )
)

// Functions

// The Enter key of a field does not go through the footer, which stops a
// confirmation during a save.
const runConfirmation = event => {
  if (props.isLoading || isQueryTooLong.value) return
  if (!form.value.name.length) {
    nameField.value?.focus()
    return
  }
  if (!form.value.search_query.length) {
    queryField.value?.focus()
    return
  }
  if (!event || event.keyCode === 13 || !event.keyCode) {
    const isShared = form.value.is_shared === 'true'
    emit('confirm', {
      id: props.searchQueryToEdit.id,
      ...form.value,
      is_shared: isShared,
      department_id: isShared ? form.value.department_id : null
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
      const name = searchQuery?.name || ''
      form.value = {
        id: null,
        // A max length does not hold on a value set by script.
        name: stringHelpers.cutToLength(name, NAME_MAX_LENGTH).trim(),
        search_filter_group_id: null,
        search_query: searchQuery?.search_query || '',
        is_shared: 'false',
        department_id: null
      }
    }
  },
  { immediate: true }
)

watch(
  () => props.active,
  active => {
    if (active) {
      setTimeout(() => {
        nameField.value?.focus()
      }, 100)
    }
  },
  { immediate: true }
)
</script>
