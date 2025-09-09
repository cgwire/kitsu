<template>
  <div class="custom-actions page fixed-page">
    <list-page-header
      :title="$t('custom_actions.title')"
      :new-entry-label="$t('custom_actions.new_custom_action')"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <custom-action-list
      :entries="customActions"
      :is-loading="loading.list"
      :is-error="errors.list"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-custom-action-modal
      active
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :custom-action-to-edit="customActionToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditCustomAction"
      v-if="modals.edit"
    />

    <delete-modal
      active
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('custom_actions.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteCustomAction"
      v-if="modals.del"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import CustomActionList from '@/components/lists/CustomActionList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditCustomActionModal from '@/components/modals/EditCustomActionModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'

export default {
  name: 'custom-actions',

  components: {
    CustomActionList,
    DeleteModal,
    EditCustomActionModal,
    ListPageHeader
  },

  data() {
    return {
      modals: {
        edit: false,
        del: false
      },
      loading: {
        edit: false,
        del: false,
        list: false
      },
      errors: {
        edit: false,
        del: false,
        list: false
      },
      customActionToDelete: null,
      customActionToEdit: null
    }
  },

  computed: {
    ...mapGetters(['customActions']),

    deleteText() {
      const customAction = this.customActionToDelete
      if (customAction) {
        return this.$t('custom_actions.delete_text', {
          name: customAction.name
        })
      } else {
        return ''
      }
    }
  },

  async created() {
    this.loading.list = true
    this.errors.list = false
    try {
      await this.loadCustomActions()
    } catch {
      this.errors.list = true
    } finally {
      this.loading.list = false
    }
  },

  methods: {
    ...mapActions([
      'deleteCustomAction',
      'editCustomAction',
      'loadCustomActions',
      'newCustomAction'
    ]),

    confirmEditCustomAction(form) {
      let action = 'newCustomAction'
      if (this.customActionToEdit && this.customActionToEdit.id) {
        action = 'editCustomAction'
        form.id = this.customActionToEdit.id
      }

      this.loading.edit = true
      this.errors.edit = false
      this[action](form)
        .then(() => {
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          this.errors.edit = true
          this.modals.isNewDisplayed = false
        })
        .finally(() => {
          this.loading.edit = false
        })
    },

    confirmDeleteCustomAction() {
      this.loading.del = true
      this.errors.del = false
      this.deleteCustomAction(this.customActionToDelete)
        .then(() => {
          this.modals.del = false
        })
        .catch(err => {
          console.error(err)
          this.errors.del = true
        })
        .finally(() => {
          this.loading.del = false
        })
    },

    onExportClicked() {
      const name = stringHelpers.slugify(this.$t('custom_actions.title'))
      const headers = [
        this.$t('main.type'),
        this.$t('custom_actions.fields.name'),
        this.$t('custom_actions.fields.url'),
        this.$t('custom_actions.fields.entity_type'),
        this.$t('custom_actions.fields.is_ajax')
      ]
      const entries = [headers].concat(
        this.customActions.map(customAction => [
          customAction.type,
          customAction.name,
          customAction.url,
          customAction.entity_type,
          customAction.is_ajax
        ])
      )
      csv.buildCsvFile(name, entries)
    },

    onNewClicked() {
      this.customActionToEdit = {}
      this.errors.edit = false
      this.modals.edit = true
    },

    onEditClicked(customAction) {
      this.customActionToEdit = customAction
      this.errors.edit = false
      this.modals.edit = true
    },

    onDeleteClicked(customAction) {
      this.customActionToDelete = customAction
      this.errors.del = false
      this.modals.del = true
    }
  },

  head() {
    return {
      title: `${this.$t('custom_actions.title')} - Kitsu`
    }
  }
}
</script>
