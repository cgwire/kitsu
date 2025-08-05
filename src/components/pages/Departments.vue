<template>
  <div class="departments page fixed-page">
    <list-page-header
      :title="$t('departments.title')"
      :new-entry-label="$t('departments.new_departments')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="tabs" :active-tab="activeTab" :tabs="tabs" />

    <department-list
      class="department-list"
      :entries="departmentList"
      :is-loading="loading.departments"
      :is-error="errors.departments"
      :linked-hardware-items="linkedHardwareItems"
      :linked-software-licenses="linkedSoftwareLicenses"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
      v-if="activeTab === 'active' || activeTab === 'archived'"
    />

    <department-links
      :type="activeTab"
      :linked-items="linkedItems"
      :items="items"
      @link-item="onLinkItem"
      @unlink-item="onUnlinkItem"
      v-if="activeTab === 'linked-hardware' || activeTab === 'linked-software'"
    />

    <edit-departments-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :department-to-edit="departmentToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditDepartment"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('departments.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteDepartment"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import DepartmentLinks from '@/components/pages/departments/DepartmentLinks.vue'
import DepartmentList from '@/components/lists/DepartmentList.vue'
import EditDepartmentsModal from '@/components/modals/EditDepartmentsModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

export default {
  name: 'departments',

  components: {
    DeleteModal,
    DepartmentLinks,
    DepartmentList,
    EditDepartmentsModal,
    ListPageHeader,
    RouteTabs
  },

  data() {
    return {
      activeTab: 'active',
      departmentToEdit: null,
      departmentToDelete: null,
      linkedHardwareItems: {},
      linkedSoftwareLicenses: {},
      errors: {
        departments: false,
        edit: false,
        del: false
      },
      loading: {
        departments: false,
        edit: false,
        del: false
      },
      modals: {
        del: false,
        edit: false
      },
      tabs: [
        {
          name: 'active',
          label: this.$t('main.active')
        },
        {
          name: 'archived',
          label: this.$t('main.archived')
        },
        {
          name: 'linked-hardware',
          label: this.$t('departments.linked_hardware')
        },
        {
          name: 'linked-software',
          label: this.$t('departments.linked_software')
        }
      ]
    }
  },

  async mounted() {
    this.activeTab = this.$route.query.tab || 'active'
    this.loading.departments = true
    this.errors.departments = false
    try {
      await this.loadDepartments()
      await this.loadHardwareItems()
      await this.loadSoftwareLicenses()
      this.linkedHardwareItems = await this.loadLinkedHardwareItems()
      this.linkedSoftwareLicenses = await this.loadLinkedSoftwareLicenses()
    } catch (error) {
      console.error(error)
      this.errors.departments = true
    }
    this.loading.departments = false
  },

  computed: {
    ...mapGetters([
      'departments',
      'archivedDepartments',
      'hardwareItems',
      'softwareLicenses'
    ]),

    isActiveTab() {
      return this.activeTab === 'active'
    },

    departmentList() {
      return this.isActiveTab ? this.departments : this.archivedDepartments
    },

    deleteText() {
      return this.departmentToDelete
        ? this.$t('departments.delete_text', {
            name: this.departmentToDelete.name
          })
        : ''
    },

    linkedItems() {
      return this.activeTab === 'linked-hardware'
        ? this.linkedHardwareItems
        : this.linkedSoftwareLicenses
    },

    items() {
      return this.activeTab === 'linked-hardware'
        ? this.hardwareItems
        : this.softwareLicenses
    }
  },

  methods: {
    ...mapActions([
      'deleteDepartment',
      'linkHardwareItem',
      'linkSoftwareLicense',
      'loadDepartments',
      'loadHardwareItems',
      'loadSoftwareLicenses',
      'loadLinkedHardwareItems',
      'loadLinkedSoftwareLicenses',
      'unlinkHardwareItem',
      'unlinkSoftwareLicense'
    ]),

    onExportClicked() {
      const name = stringHelpers.slugify(this.$t('departments.title'))
      const headers = [
        this.$t('main.type'),
        this.$t('departments.fields.name'),
        this.$t('departments.fields.color')
      ]
      const entries = [headers].concat(
        this.departments.map(department => [
          department.type,
          department.name,
          department.color
        ])
      )
      csv.buildCsvFile(name, entries)
    },

    onNewClicked() {
      this.departmentToEdit = { name: '', color: '#999999' }
      this.modals.edit = true
    },

    onEditClicked(department) {
      this.departmentToEdit = department
      this.modals.edit = true
    },

    confirmEditDepartment(form) {
      let action = 'newDepartment'
      if (this.departmentToEdit && this.departmentToEdit.id) {
        action = 'editDepartment'
        form.id = this.departmentToEdit.id
      }
      this.loading.edit = true
      this.errors.edit = false
      this.$store
        .dispatch(action, form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch(() => {
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    onDeleteClicked(department) {
      this.departmentToDelete = department
      this.modals.del = true
    },

    async confirmDeleteDepartment() {
      this.loading.del = true
      this.errors.del = false
      try {
        await this.deleteDepartment(this.departmentToDelete)
        this.loading.del = false
        this.modals.del = false
      } catch (e) {
        this.loading.del = false
        this.errors.del = true
      }
    },

    onLinkItem(data) {
      if (this.activeTab === 'linked-hardware') {
        this.linkHardwareItem({
          hardwareItemId: data.itemId,
          departmentId: data.departmentId
        })
        const item = this.hardwareItems.find(i => i.id === data.itemId)
        if (!this.linkedHardwareItems[data.departmentId]) {
          this.linkedHardwareItems[data.departmentId] = []
        }
        this.linkedHardwareItems[data.departmentId].push(item)
      } else if (this.activeTab === 'linked-software') {
        this.linkSoftwareLicense({
          softwareLicenseId: data.itemId,
          departmentId: data.departmentId
        })
        const item = this.softwareLicenses.find(i => i.id === data.itemId)
        if (!this.linkedSoftwareLicenses[data.departmentId]) {
          this.linkedSoftwareLicenses[data.departmentId] = []
        }
        this.linkedSoftwareLicenses[data.departmentId].push(item)
      }
    },

    onUnlinkItem(data) {
      if (this.activeTab === 'linked-hardware') {
        this.unlinkHardwareItem({
          hardwareItemId: data.itemId,
          departmentId: data.departmentId
        })
        this.linkedHardwareItems[data.departmentId] = this.linkedHardwareItems[
          data.departmentId
        ].filter(i => i.id !== data.itemId)
      } else if (this.activeTab === 'linked-software') {
        this.unlinkSoftwareLicense({
          softwareLicenseId: data.itemId,
          departmentId: data.departmentId
        })
        this.linkedSoftwareLicenses[data.departmentId] =
          this.linkedSoftwareLicenses[data.departmentId].filter(
            i => i.id !== data.itemId
          )
      }
    }
  },

  watch: {
    '$route.query.tab'() {
      this.activeTab = this.$route.query.tab || 'active'
    }
  },

  head() {
    return {
      title: `${this.$t('departments.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.department-list {
  margin-top: 0;
}

.tabs {
  min-height: 30px;
  margin-top: 1em;
}
</style>
