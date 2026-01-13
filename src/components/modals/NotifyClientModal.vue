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
      ref="studioField"
      all-studios-label
      :label="$t('main.studio')"
      v-model="form.studio_id"
    />

    <combobox-department
      class="mt1 mb1"
      ref="departmentField"
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

<script>
import { mapGetters } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import BaseModal from '@/components/modals/BaseModal.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'

export default {
  name: 'notify-client-modal',

  mixins: [modalMixin],

  components: {
    BaseModal,
    ComboboxDepartment,
    ComboboxStudio,
    ModalFooter,
    PeopleAvatar,
    PeopleName
  },

  props: {
    active: {
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
    },
    isSuccess: {
      type: Boolean,
      default: false
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        studio_id: '',
        department_id: ''
      }
    }
  },

  computed: {
    ...mapGetters(['currentProduction', 'personMap']),

    clients() {
      return this.currentProduction.team
        .map(personId => this.personMap.get(personId))
        .filter(person => person?.role === 'client')
        .filter(
          person =>
            !this.form.studio_id || person.studio_id === this.form.studio_id
        )
        .filter(
          person =>
            !this.form.department_id ||
            (person.departments &&
              person.departments.includes(this.form.department_id))
        )
    }
  },

  methods: {
    runConfirmation() {
      this.$emit('confirm', {
        studio_id: this.form.studio_id,
        department_id: this.form.department_id
      })
    }
  }
}
</script>
