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
        <h1 class="title">
          {{ $t('main.search_query_edit') }}
        </h1>

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
      </div>
    </div>
  </div>
</template>

<script>
/*
 * Modal used to edit search filter information. Users prefer to rename the
   filter label when it's too complex to read or too long.
 */
import { mapGetters } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import BooleanField from '@/components/widgets/BooleanField.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'edit-search-filter-modal',

  mixins: [modalMixin],

  components: {
    BooleanField,
    Combobox,
    ComboboxDepartment,
    ModalFooter,
    PeopleName,
    TextField
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
    isGroupEnabled: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    searchQueryToEdit: {
      type: Object,
      default: () => {}
    },
    groupOptions: {
      type: Array,
      default: () => []
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        id: null,
        name: '',
        search_filter_group_id: null,
        search_query: '',
        is_shared: 'false'
      }
    }
  },

  computed: {
    ...mapGetters(['currentProduction', 'isCurrentUserManager', 'personMap']),

    allowedGroups() {
      return this.groupOptions.filter(
        group =>
          group.is_shared === (this.form.is_shared === 'true') ||
          group.value === null
      )
    }
  },

  methods: {
    runConfirmation(event) {
      if (!this.form.name.length) {
        this.$refs.nameField.focus()
        return
      }

      if (!event || event.keyCode === 13 || !event.keyCode) {
        const data = {
          id: this.searchQueryToEdit.id,
          ...this.form,
          is_shared: this.form.is_shared === 'true'
        }
        this.$emit('confirm', data)
      }
    }
  },

  watch: {
    searchQueryToEdit() {
      if (this.searchQueryToEdit?.id) {
        this.form = {
          id: this.searchQueryToEdit.id,
          name: this.searchQueryToEdit.name,
          search_filter_group_id: this.searchQueryToEdit.search_filter_group_id,
          search_query: this.searchQueryToEdit.search_query,
          is_shared: this.searchQueryToEdit.is_shared ? 'true' : 'false',
          department_id: this.searchQueryToEdit.department_id
        }
      } else {
        this.form = {
          id: null,
          name: '',
          search_filter_group_id: null,
          search_query: '',
          is_shared: 'false',
          department_id: null
        }
      }
    },

    active() {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    }
  }
}
</script>
