<template>
  <base-modal
    :active="active"
    :title="isEditing ? $t('budget.edit_budget_entry') : $t('budget.add_entry')"
    @cancel="$emit('cancel')"
  >
    <form @submit.prevent>
      <combobox-department
        ref="departmentField"
        :label="$t('budget.fields.department')"
        v-model="form.department_id"
        @enter="runConfirmation"
        v-focus
      />

      <people-field
        class="mt2"
        :label="$t('budget.fields.person')"
        :people="departmentPeople"
        @select="onPersonChanged"
        @enter="runConfirmation"
        v-model="form.person"
      />

      <combobox
        class="mt2"
        :label="$t('budget.fields.position')"
        :options="positionOptions"
        locale-key-prefix="people.position."
        v-model="form.position"
        @enter="runConfirmation"
      />

      <combobox
        class="mt2"
        :label="$t('budget.fields.seniority')"
        :options="seniorityOptions"
        locale-key-prefix="people.seniority."
        v-model="form.seniority"
        @enter="runConfirmation"
      />

      <div class="flexrow">
        <month-field
          class="mr1"
          :label="$t('budget.fields.start_date')"
          :min-date="projectStartDate"
          :max-date="projectEndDate"
          v-model="form.start_date"
        />

        <text-field
          class="month-duration"
          type="number"
          :min="1"
          :max="maxDuration"
          :label="$t('budget.fields.months_duration')"
          v-model="form.months_duration"
          @enter="runConfirmation"
        />

        <text-field
          class="month-duration"
          type="number"
          :min="0"
          :label="$t('budget.fields.daily_salary')"
          v-model="form.daily_salary"
          @enter="runConfirmation"
        />
      </div>
      <div class="mt0">
        <span class="salary-label">{{ $t('budget.fields.start_date') }}</span>
        <span class="salary-value">{{
          formatDate(form.start_date).substring(0, 7)
        }}</span>
        <br />
        <span class="salary-label">{{ $t('budget.fields.end_date') }}</span>
        <span class="salary-value">{{ endMonth }}</span>
        <br />
        <span class="salary-label">
          {{ $t('budget.fields.monthly_salary') }}
        </span>
        <span class="salary-value">{{ monthlySalary }}</span>
        <br />
        <span class="salary-label">{{ $t('budget.fields.total_salary') }}</span>
        <span class="salary-value">{{ totalSalary }}</span>
      </div>
    </form>

    <modal-footer
      :error-text="$t('budget.create_budget_error')"
      :is-error="isError"
      :is-loading="isLoading"
      :is-disabled="isDisabled"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'
import { parseSimpleDate, formatSimpleDate } from '@/lib/time'

import BaseModal from '@/components/modals/BaseModal.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import MonthField from '@/components/widgets/MonthField.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'edit-budget-entry-modal',

  mixins: [modalMixin],

  components: {
    BaseModal,
    Combobox,
    ComboboxDepartment,
    ModalFooter,
    MonthField,
    PeopleField,
    TextField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    budgetEntryToEdit: {
      type: Object,
      default: () => {}
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    salaryScale: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        department_id: '',
        person: null,
        position: 'artist',
        seniority: 'junior',
        start_date: null,
        months_duration: 1
      },
      positionOptions: [
        { label: 'artist', value: 'artist' },
        { label: 'supervisor', value: 'supervisor' },
        { label: 'lead', value: 'lead' }
      ],
      refreshKeys: {
        endMonth: 0,
        monthlySalary: 0,
        totalSalary: 0
      },
      seniorityOptions: [
        { label: 'junior', value: 'junior' },
        { label: 'mid', value: 'mid' },
        { label: 'senior', value: 'senior' }
      ]
    }
  },

  mounted() {
    this.resetForm()
  },

  computed: {
    ...mapGetters(['activePeople', 'currentProduction', 'personMap']),

    isDisabled() {
      return !this.form.department_id || this.form.months_duration < 1
    },

    isEditing() {
      return this.budgetEntryToEdit && this.budgetEntryToEdit.id
    },

    projectStartDate() {
      return parseSimpleDate(this.currentProduction.start_date).toDate()
    },

    projectEndDate() {
      return parseSimpleDate(this.currentProduction.end_date).toDate()
    },

    endMonth() {
      this.refreshKeys.endMonth
      const startDate = parseSimpleDate(this.form.start_date)
      const projectEndDate = parseSimpleDate(this.currentProduction.end_date)
      let endDate = startDate.add(this.form.months_duration, 'months')
      endDate = moment.min(endDate, projectEndDate)
      return endDate.format('YYYY-MM')
    },

    dailySalary() {
      if (!this.form.department_id) {
        return 0
      } else if (!this.form.person || !this.form.person.daily_salary) {
        const departmentScale = this.salaryScale[this.form.department_id]
        return departmentScale[this.form.position || 'artist'][
          this.form.seniority || 'junior'
        ].salary
      } else {
        return this.form.person.daily_salary
      }
    },

    monthlySalary() {
      return this.dailySalary * 20
    },

    totalSalary() {
      if (!this.form.department_id) {
        return 0
      } else {
        const duration = Math.min(this.form.months_duration, this.maxDuration)
        return this.monthlySalary * duration
      }
    },

    maxDuration() {
      const startDate = parseSimpleDate(this.form.start_date)
      const projectEndDate = parseSimpleDate(
        this.currentProduction.end_date
      ).endOf('month')
      const maxDuration = projectEndDate.diff(startDate, 'months')
      return maxDuration > 0 ? maxDuration : 1
    },

    departmentPeople() {
      if (this.form.department_id) {
        return this.activePeople.filter(person =>
          person.departments.includes(this.form.department_id)
        )
      } else {
        return this.activePeople
      }
    }
  },

  methods: {
    ...mapActions(['']),

    runConfirmation() {
      this.$emit('confirm', {
        ...this.form,
        person_id: this.form.person?.id,
        duration: Math.min(this.form.months_duration, this.maxDuration),
        salary: this.monthlySalary,
        total_salary: this.totalSalary
      })
    },

    onPersonChanged(person) {
      if (person) {
        this.form.position = person.position || 'artist'
        this.form.seniority = person.seniority || 'junior'
      } else {
        this.form.position = 'artist'
        this.form.seniority = 'junior'
      }
    },

    formatDate(date) {
      return formatSimpleDate(date)
    },

    resetForm() {
      if (this.isEditing) {
        const person = this.personMap.get(this.budgetEntryToEdit.person_id)
        Object.assign(this.form, {
          id: this.budgetEntryToEdit.id,
          department_id: this.budgetEntryToEdit.department_id,
          person,
          position: this.budgetEntryToEdit.position || 'artist',
          seniority: this.budgetEntryToEdit.seniority || 'junior',
          start_date: parseSimpleDate(
            this.budgetEntryToEdit.start_date
          ).toDate(),
          months_duration: this.budgetEntryToEdit.months_duration,
          daily_salary: this.budgetEntryToEdit.daily_salary
        })
        this.form.person = person
        // Needed to bypass watcher
        this.$nextTick(() => {
          this.form.daily_salary = this.budgetEntryToEdit.daily_salary
        })
      } else {
        this.form = {
          id: null,
          department_id: '',
          person: null,
          position: 'artist',
          seniority: 'junior',
          start_date: parseSimpleDate(this.currentProduction.start_date)
            .startOf('month')
            .toDate(),
          months_duration: 1,
          daily_salary: 0
        }
      }
    }
  },

  watch: {
    active() {
      if (this.active) {
        this.resetForm()
        setTimeout(() => {
          this.$refs.departmentField.focus()
        }, 100)
      }
    },

    dailySalary() {
      this.form.daily_salary = this.dailySalary
    },

    budgetEntryToEdit() {
      this.resetForm()
    }
  }
}
</script>

<style lang="scss" scoped>
.salary-label {
  display: inline-block;
  font-weight: bold;
  width: 120px;
}

.salary-value {
  display: inline-block;
  text-align: right;
  width: 80px;
}

.month-duration {
  margin-left: 1em;
  width: 160px;
}
</style>
