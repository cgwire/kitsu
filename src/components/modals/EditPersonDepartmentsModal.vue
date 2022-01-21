<template>

<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
    <div class="box">

      <h1 class="title" v-if="personToEdit.id !== undefined">
        {{ $t("people.edit_department_title") }} {{ personName }}
      </h1>

      <form v-on:submit.prevent>
        <div class="departments">
          <h2 class="subtitle">{{ $t('person.fields.departments') }}</h2>
          <div class="department-element" :key="departmentId"
            v-for="departmentId in form.departments" @click="removeDepartment(departmentId)">
            <department-name
              :department="departmentMap.get(departmentId)"
            />
          </div>
          <div class="field">
            <combobox-department
              :label="$t('task_types.fields.department')"
              :selectableDepartments="selectableDepartments"
              @enter="confirmClicked"
              v-model="selectedDepartment"
              v-if="selectableDepartments.length > 0"
            />
            <button
              :class="{
                button: true,
                'is-success': true,
                'is-disabled': selectedDepartment === null
              }"
              @click="addDepartment"
              v-if="selectableDepartments.length > 0"
            >
              {{ $t('main.add')}}
            </button>
          </div>
        </div>
      </form>

      <p class="has-text-right">
        <button
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isUpdateDepartmentLoading
          }"
          @click=""
        >
          {{ $t('people.create_invite') }}
        </button>
      </p>

      <div
        class="success has-text-right mt1"
        v-if="isInvitationSuccess"
      >
        {{ $t('people.update_departments_success') }}
      </div>
      <div
        class="error has-text-right mt1"
        v-if="isUpdateDepartmentsError"
      >
        {{ $t('people.update_departments_error') }}
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'

import ComboboxDepartment from '../widgets/ComboboxDepartment'
import DepartmentName from '../widgets/DepartmentName'

export default {
  name: 'edit-person-departments-modal',
  mixins: [modalMixin],
  props: [
    'isLoading',
    'isUpdateDepartmentsError',
    'isUpdateDepartmentsLoading',
    'personToEdit'
  ],

  data () {
    return {
      form: {
        departments: []
      },
      selectedDepartment: null
    }
  },

  components: {
    ComboboxDepartment,
    DepartmentName
  },

  computed: {
    ...mapGetters([
      'departmentMap',
      'departments'
    ]),

    selectableDepartments () {
      return this.departments.filter(departement => {
        return this.form.departments.findIndex(
          selectedDepartment => selectedDepartment === departement.id
        ) === -1
      })
    },

    personName () {
      if (this.personToEdit !== undefined) {
        return this.personToEdit.first_name + ' ' + this.personToEdit.last_name
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions([]),

    confirmClicked () {
      this.$emit('confirm', form)
    },

    addDepartment () {
      this.form.departments.push(this.selectedDepartment)
      this.selectedDepartment = null
    },

    removeDepartment (idToRemove) {
      const departmentIndex = this.form.departments.indexOf(idToRemove)
      if (departmentIndex >= 0) {
        this.form.departments.splice(departmentIndex, 1)
      }
    },

    resetForm () {
      if (this.personToEdit) {
        this.form = {
          departments: (this.personToEdit.departments)
            ? this.personToEdit.departments
            : []
        }
      } else {
        this.form = {
          departments: []
        }
      }
    }
  },

  watch: {
    personToEdit () {
      this.resetForm()
    },

    active () {
      if (this.active) {
        this.resetForm()
        setTimeout(() => {
          this.$refs['name-field'].focus()
        }, 100)
      }
    },

    'form.email' () {
      this.checkEmailValidity()
    }
  }
}
</script>

<style lang="scss" scoped>
.department-element {
  display: inline-block;
  margin: 0.1em;
}
.modal-content .box p.text {
  margin-bottom: 1em;
}
.is-danger {
  color: #ff3860;
  font-style: italic;
}
</style>
