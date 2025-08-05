<template>
  <div class="software-licenses page fixed-page">
    <list-page-header
      :title="$t('software_licenses.title')"
      :new-entry-label="$t('software_licenses.new_software_license')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <software-license-list
      class="software-license-list"
      :entries="softwareLicensesList"
      :is-loading="loading.list"
      :is-error="errors.list"
      :remaining-software-licenses="remainingSoftwareLicenses"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-software-license-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :software-license-to-edit="softwareLicenseToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditSoftwareLicense"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('software_licenses.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteSoftwareLicense"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditSoftwareLicenseModal from '@/components/modals/EditSoftwareLicenseModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import SoftwareLicenseList from '@/components/lists/SoftwareLicenseList.vue'

export default {
  name: 'software-licenses',

  components: {
    DeleteModal,
    EditSoftwareLicenseModal,
    ListPageHeader,
    RouteTabs,
    SoftwareLicenseList
  },

  data() {
    return {
      activeTab: 'active',
      linkedSoftwareLicenses: {},
      softwareLicenseToDelete: null,
      softwareLicenseToEdit: {},
      choices: [],
      errors: {
        del: false,
        edit: false,
        list: false
      },
      modals: {
        del: false,
        edit: false
      },
      loading: {
        del: false,
        edit: false,
        list: false
      },
      tabs: [
        {
          name: 'active',
          label: this.$t('main.active')
        },
        {
          name: 'archived',
          label: this.$t('main.archived')
        }
      ]
    }
  },

  async mounted() {
    this.activeTab = this.$route.query.tab || 'active'
    this.linkedSoftwareLicenses = await this.loadLinkedSoftwareLicenses()
  },

  computed: {
    ...mapGetters([
      'activePeople',
      'softwareLicenses',
      'archivedSoftwareLicenses'
    ]),

    isActiveTab() {
      return this.activeTab === 'active'
    },

    softwareLicensesList() {
      return this.isActiveTab
        ? this.softwareLicenses
        : this.archivedSoftwareLicenses
    },

    usedAmounts() {
      const usedAmounts = {}
      this.activePeople.forEach(person => {
        person.departments.forEach(departmentId => {
          const departmentItems =
            this.linkedSoftwareLicenses[departmentId] || []
          departmentItems.forEach(item => {
            if (!usedAmounts[item.id]) {
              usedAmounts[item.id] = 0
            }
            usedAmounts[item.id] += 1
          })
        })
      })
      return usedAmounts
    },

    remainingSoftwareLicenses() {
      const remainingAmounts = {}
      this.softwareLicenses.forEach(license => {
        remainingAmounts[license.id] =
          license.inventory_amount - (this.usedAmounts[license.id] || 0)
      })
      return remainingAmounts
    },

    deleteText() {
      const softwareLicense = this.softwareLicenseToDelete
      if (softwareLicense) {
        return this.$t('software_licenses.delete_text', {
          name: softwareLicense.name
        })
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions([
      'deleteSoftwareLicense',
      'editSoftwareLicense',
      'newSoftwareLicense',
      'loadLinkedSoftwareLicenses'
    ]),

    confirmEditSoftwareLicense(form) {
      let action = 'newSoftwareLicense'
      if (this.softwareLicenseToEdit && this.softwareLicenseToEdit.id) {
        action = 'editSoftwareLicense'
        form.id = this.softwareLicenseToEdit.id
      }

      this.loading.edit = true
      this.errors.edit = false
      this[action](form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteSoftwareLicense() {
      this.loading.del = true
      this.errors.del = false
      this.deleteSoftwareLicense(this.softwareLicenseToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.del = false
        })
        .catch(err => {
          console.error(err)
          this.errors.del = true
          this.loading.del = false
        })
    },

    onExportClicked() {
      const name = stringHelpers.slugify(this.$t('software_licenses.title'))
      const headers = [
        this.$t('main.type'),
        this.$t('software_licenses.fields.name'),
        this.$t('software_licenses.fields.short_name'),
        this.$t('software_licenses.fields.extension'),
        this.$t('software_licenses.fields.version'),
        this.$t('software_licenses.fields.monthly_cost'),
        this.$t('software_licenses.fields.inventory_amount')
      ]
      const entries = [headers].concat(
        this.softwareLicenses.map(softwareLicense => [
          softwareLicense.type,
          softwareLicense.name,
          softwareLicense.short_name,
          softwareLicense.file_extension,
          softwareLicense.version,
          softwareLicense.monthly_cost,
          softwareLicense.inventory_amount
        ])
      )
      csv.buildCsvFile(name, entries)
    },

    onNewClicked() {
      this.softwareLicenseToEdit = {}
      this.errors.edit = false
      this.modals.edit = true
    },

    onEditClicked(softwareLicense) {
      this.softwareLicenseToEdit = softwareLicense
      this.errors.edit = false
      this.modals.edit = true
    },

    onDeleteClicked(softwareLicense) {
      this.softwareLicenseToDelete = softwareLicense
      this.errors.del = false
      this.modals.del = true
    }
  },

  watch: {
    '$route.query.tab'() {
      this.activeTab = this.$route.query.tab || 'active'
    }
  },

  head() {
    return {
      title: `${this.$t('software_licenses.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.software-license-list {
  margin-top: 0;
}
</style>
