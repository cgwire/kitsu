<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
    <div class="box content">
      <h1 class="title" v-if="descriptorToEdit.id">
        {{ $t('productions.metadata.edit_title') }}
      </h1>
      <h1 class="title" v-else>
        {{ $t('productions.metadata.title') }}
      </h1>

      <text-field
        ref="nameField"
        :label="$t('assets.fields.name')"
        v-model="form.name"
        @enter="confirm"
        v-focus
      />

      <combobox
        ref="typeField"
        :label="$t('assets.fields.type')"
        v-model="type"
        :options="typeOptions"
        @enter="confirm"
        v-focus
      />

      <div v-if="type === 'choices'">
        <p class="strong">
          {{ $t('productions.metadata.available_values') }}
        </p>

        <div
          ref="valueList"
          class="choice-value-wrapper"
          v-if="form.values.length > 0"
        >
          <p
            class="choice-value"
            :key="value"
            v-for="value in form.values"
          >
            <span>
              {{ value }}
            </span>
            <span
              class="remove-button pull-right"
              @click="removeValue(value)"
            >
             x
            </span>
          </p>
        </div>
        <div v-else>
          {{ $t('productions.metadata.add_new_values') }}
        </div>

        <text-field
          ref="addChoiceField"
          v-model="valueToAdd"
          :button-label="$t('Add value')"
          @enter="addValue"
          v-focus
        />
      </div>

      <div v-if="type === 'checklist'">
        <p class="strong">
          {{ $t('productions.metadata.checklist') }}
        </p>

        <div class="checklist-wrapper">
          <checklist
            :checklist="checklist"
            @add-item="onAddChecklistItem"
            @remove-task="removeTask"
            v-if="checklist.length > 0"
          />
          <button-simple
            :class="{
              'button': true,
              'active': checklist.length !== 0
            }"
            icon="plus"
            :title="$t('comments.add_checklist')"
            @click="addChecklistEntry(-1)"
          >
          </button-simple>
        </div>
      </div>

      <div
        class="departments"
      >
        <label class="label">{{ $t('people.fields.departments') }}</label>
        <div
          class="department-element mb1"
          :key="departmentId"
          @click="removeDepartment(departmentId)"
          v-for="departmentId in form.departments"
        >
          <department-name
            :department="departmentMap.get(departmentId)"
            v-if="departmentId"
          />
        </div>
        <div class="flexrow">
          <combobox-department
            class="flexrow-item"
            :selectable-departments="selectableDepartments"
            :max-height-select-input="160"
            v-model="selectedDepartment"
            v-if="selectableDepartments.length > 0"
          />
          <button
            class="button is-success flexrow-item mb2"
            :class="{
              'is-disabled': selectedDepartment === null
            }"
            @click="addDepartment"
            v-if="selectableDepartments.length > 0"
          >
            {{ $t('main.add')}}
          </button>
        </div>
      </div>

      <combobox-boolean
        ref="hiddenField"
        :label="$t('assets.fields.hidden_from_client')"
        v-model="form.for_client"
        @enter="confirm"
        v-focus
      />

      <modal-footer
        :error-text="$t('productions.metadata.error')"
        :is-loading="isLoading"
        :is-disabled="!isFormFilled"
        @confirm="confirm"
        @cancel="$emit('cancel')"
      />
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'
import { descriptorMixin } from '../mixins/descriptors'
import { remove } from '../../lib/models'

import Combobox from '../widgets/Combobox'
import ComboboxBoolean from '../widgets/ComboboxBoolean'
import ModalFooter from './ModalFooter'
import TextField from '../widgets/TextField'
import ComboboxDepartment from '../widgets/ComboboxDepartment'
import DepartmentName from '../widgets/DepartmentName'
import ButtonSimple from '../widgets/ButtonSimple'
import Checklist from '../widgets/Checklist'

export default {
  name: 'add-metadata-modal',
  mixins: [descriptorMixin, modalMixin],

  components: {
    Combobox,
    ComboboxBoolean,
    ComboboxDepartment,
    DepartmentName,
    ModalFooter,
    TextField,
    ButtonSimple,
    Checklist
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    descriptorToEdit: {
      type: Object,
      default: () => {}
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    entityType: {
      type: String,
      default: 'Asset'
    }
  },

  data () {
    return {
      form: {
        name: '',
        for_client: 'false',
        values: [],
        departments: []
      },
      valueToAdd: '',
      checklist: [],
      type: 'free',
      typeOptions: [
        {
          label: this.$t('productions.metadata.free'),
          value: 'free'
        },
        {
          label: this.$t('productions.metadata.choices'),
          value: 'choices'
        },
        {
          label: this.$t('productions.metadata.checklist'),
          value: 'checklist'
        }
      ],
      selectedDepartment: null
    }
  },

  mounted () {
    this.reset()
  },

  computed: {
    ...mapGetters([
      'departments',
      'departmentMap',
      'currentProduction',
      'taskTypeMap',
      'isCurrentUserSupervisor',
      'user'
    ]),

    selectableDepartments () {
      let departments = this.currentProduction.task_types
        .map(taskTypeId => {
          const taskType = this.taskTypeMap.get(taskTypeId)
          return (taskType.for_entity === this.entityType)
            ? this.departmentMap.get(taskType.department_id) : false
        })
        .filter((department, index, self) =>
          department && (self.indexOf(department) === index) &&
          this.form.departments.findIndex(
            selectedDepartment => selectedDepartment === department.id) === -1)
      if (this.isCurrentUserSupervisor && this.user.departments.length > 0) {
        departments = departments.filter((department) => this.user.departments.indexOf(department.id) >= 0)
      }
      return departments
    },

    isFormFilled () {
      return this.form.name.length > 0 &&
        (
          this.type === 'free' ||
          (this.form.values.length > 0 && this.type === 'choices') ||
          (
            this.checklist.filter(x => x.text.trim() !== '').length > 0 &&
            this.type === 'checklist'
          )
        ) && (!this.isCurrentUserSupervisor ||
        this.user.departments.length === 0 ||
        this.form.departments.length > 0)
    },

    valueList () {
      return this.$refs.valueList
    }
  },

  methods: {
    ...mapActions([
    ]),

    addValue () {
      const newValue = this.$refs.addChoiceField.value
      if (!this.form.values.find(v => v === newValue) && newValue) {
        this.form.values.push(newValue)
        this.valueToAdd = ''
        this.$nextTick(() => {
          this.valueList.scrollTop = this.valueList.scrollHeight
        })
      }
      return newValue
    },

    confirm () {
      if (this.type === 'free') this.form.values = []
      if (this.type === 'checklist') {
        this.form.values = this.checklist.filter(
          value => value.text.trim() !== ''
        ).map(
          x => (x.checked ? '[x] ' : '[ ] ') + x.text
        )
      }
      return this.$emit('confirm', this.form)
    },

    removeValue (valueToRemove) {
      this.form.values = remove(this.form.values, valueToRemove)
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

    addChecklistEntry (index) {
      if (index === -1 || index === this.checklist.length - 1) {
        this.checklist.push({
          text: '',
          checked: false
        })
      }
    },

    onAddChecklistItem (item) {
      this.checklist[item.index].text = this.checklist[item.index].text.trim()
      delete item.index
      this.checklist.push(item)
    },

    removeTask (entry) {
      this.checklist = remove(this.checklist, entry)
    },

    reset () {
      this.form = {
        name: '',
        values: [],
        departments: []
      }
      this.checklist = []
      this.valueToAdd = ''
      if (this.descriptorToEdit.name) {
        this.form = {
          id: this.descriptorToEdit.id,
          name: `${this.descriptorToEdit.name}`,
          values: [...this.descriptorToEdit.choices],
          for_client: this.descriptorToEdit.for_client ? 'true' : 'false',
          departments: [...this.descriptorToEdit.departments]
        }
        this.checklist = this.getDescriptorChecklistValues(this.descriptorToEdit)
      }
      if (this.form.values.length > 0) {
        if (this.checklist.length === this.form.values.length) {
          this.form.values = []
          this.type = 'checklist'
        } else {
          this.checklist = []
          this.type = 'choices'
        }
      } else {
        this.type = 'free'
      }
    }
  },

  watch: {
    active () {
      if (this.active) {
        this.reset()
        this.$nextTick(() => { this.$refs.nameField.focus() })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark  .content .choice-value {
  border-color: $grey-strong;
}

.dark .remove-button:hover {
  background: $grey-strong;
}

.modal-content .box p.text {
  margin-bottom: 1em;
}

.error {
  margin-top: 1em;
}

.description {
  margin-bottom: 1em;
}

.choice-value-wrapper {
  max-height: 120px;
  overflow-y: auto;
}

.content .choice-value {
  border: 1px solid $light-grey;
  border-bottom: 0;
  margin: 0;
  padding: 0.5em;
}

.content .choice-value:last-child{
  border-bottom: 1px solid $light-grey;
}

.remove-button {
  color: $grey;
  width: 20px;
  text-align: center;
  padding: 0;
  cursor: pointer;
}

.remove-button:hover {
  background: $white-grey;
  border-radius: 50%;
}

.department-element {
  display: inline-block;
  margin-right: 0.2em;
  cursor: pointer;
}

.checklist-wrapper{
  margin-bottom: 1em;
}

.checklist-wrapper .button{
  margin: 0.5em 0.2em;
}

</style>

<style lang="scss">
.checklist-entry.checked .checklist-text {
  text-decoration: none !important;
}
</style>
