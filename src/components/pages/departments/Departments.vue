<template>
  <div class="departments page fixed-page">
    <list-page-header
      :title="$t('departments.title')"
      :new-entry-label="$t('departments.new_departments')"
      @new-clicked="onNewClicked"
    />

    <department-list
      :entries="departments"
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
import DepartmentList from '@/components/lists/DepartmentList.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader'
import EditDepartmentsModal from '@/components/modals/EditDepartmentsModal'
import DeleteModal from '@/components/modals/DeleteModal'

export default {
  name: 'departments',
  components: {
    DeleteModal,
    DepartmentList,
    EditDepartmentsModal,
    ListPageHeader
  },

  props: {},

  data() {
    return {
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
      departmentToEdit: null,
      departmentToDelete: null
    }
  },

  computed: {
    ...mapGetters(['departments']),
    deleteText() {
      if (this.departmentToDelete) {
        return this.$t('departments.delete_text', {
          name: this.departmentToDelete.name
        })
      } else {
        return ''
      }
    }
  },

  mounted() {
    this.loading.departments = true
    this.errors.departments = false
    this.loadDepartments()
      .then(() => {
        this.loading.departments = false
        this.errors.departments = false
      })
      .catch(() => {
        this.loading.departments = false
        this.errors.departments = true
      })
  },

  methods: {
    ...mapActions(['deleteDepartment', 'loadDepartments', 'newDepartement']),

    onNewClicked() {
      this.departmentToEdit = { name: '', color: '#999999' }
      this.modals.edit = true
    },

    onEditClicked(department) {
      this.departmentToEdit = department
      this.modals.edit = true
    },

    confirmEditDepartment(form) {
      let action = 'newDepartement'
      if (this.departmentToEdit && this.departmentToEdit.id) {
        action = 'editDepartement'
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
  }
}
</script>

<style lang="scss" scoped></style>
