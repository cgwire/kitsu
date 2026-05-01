<template>
  <base-modal
    :active="active"
    :title="$t('playlists.notify_clients')"
    @cancel="$emit('cancel')"
  >
    <p class="mb2">
      {{ $t('playlists.notify_clients_description') }}
    </p>

    <combobox-studio
      class="mt1 mb1"
      all-studios-label
      :label="$t('main.studio')"
      v-model="form.studio_id"
    />

    <combobox-department
      class="mt1 mb1"
      all-departments-label
      :label="$t('people.fields.departments')"
      v-model="form.department_id"
    />

    <div class="mt2">
      <em v-if="!clients.length">
        {{ $t('playlists.no_clients_to_notify') }}
      </em>
      <template v-else>
        <label class="label mb1">
          {{ $t('playlists.clients_to_notify') }}
        </label>
        <div :key="client.id" class="flexrow mb05" v-for="client in clients">
          <people-avatar
            class="flexrow-item"
            :person="client"
            :size="30"
            :is-link="false"
          />
          <people-name class="flexrow-item" :person="client" :is-link="false" />
        </div>
      </template>
    </div>

    <modal-footer
      :error-text="$t('playlists.notify_clients_error')"
      :is-error="isError"
      :is-loading="isLoading"
      :is-success="isSuccess"
      :success-text="$t('playlists.notify_clients_success')"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'

const store = useStore()

// Props / Emits

defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  isSuccess: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({ studio_id: '', department_id: '' })

// Computed

const currentProduction = computed(() => store.getters.currentProduction)
const personMap = computed(() => store.getters.personMap)

const clients = computed(() =>
  currentProduction.value.team
    .map(personId => personMap.value.get(personId))
    .filter(person => person?.role === 'client')
    .filter(
      person =>
        !form.value.studio_id || person.studio_id === form.value.studio_id
    )
    .filter(
      person =>
        !form.value.department_id ||
        person.departments?.includes(form.value.department_id)
    )
    .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
)

// Functions

const runConfirmation = () => {
  emit('confirm', {
    studio_id: form.value.studio_id,
    department_id: form.value.department_id
  })
}
</script>
