<template>
  <div class="departments page fixed-page">
    <list-page-header
      :title="$t('departments.title')"
      :new-entry-label="$t('departments.new_departments')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <department-list
      class="department-list"
      :entries="departmentList"
      :is-loading="loading.departments"
      :is-error="errors.departments"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
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
import DepartmentList from '@/components/lists/DepartmentList.vue'
import EditDepartmentsModal from '@/components/modals/EditDepartmentsModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

export default {
  name: 'departments',

  components: {
    DeleteModal,
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
    } catch (error) {
      console.error(error)
      this.errors.departments = true
    }
    this.loading.departments = false
  },

  computed: {
    ...mapGetters(['departments', 'archivedDepartments']),

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
    }
  },

  methods: {
    ...mapActions(['deleteDepartment', 'loadDepartments', 'newDepartment']),

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

    // Delete
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
    }
  },

  watch: {
    $route() {
      this.activeTab = this.$route.query.tab
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
</style>
