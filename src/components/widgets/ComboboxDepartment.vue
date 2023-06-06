<template>
  <div>
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <div
      :class="{
        'department-combo': true,
        opened: showDepartmentList,
        rounded: rounded
      }"
      v-bind:style="{
        width: width + 'px'
      }"
    >
      <div class="flexrow" @click="toggleDepartmentList">
        <div
          class="selected-department-line flexrow-item"
          v-if="currentDepartment"
        >
          <department-name :department="currentDepartment" />
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div
        class="select-input"
        ref="select"
        v-bind:style="{
          'max-height': maxHeightSelectInput + 'px',
          width: width + 'px',
          top: rounded ? '30px' : '37px'
        }"
        v-if="showDepartmentList"
      >
        <div
          class="department-line"
          v-for="department in departmentList.filter(
            departement => departement.id !== this.value
          )"
          @click="selectDepartment(department)"
          :key="department.id"
        >
          <department-name :department="department" />
        </div>
      </div>
    </div>
    <combobox-mask
      :displayed="showDepartmentList"
      @click="toggleDepartmentList"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ChevronDownIcon } from 'vue-feather-icons'

import ComboboxMask from '@/components/widgets/ComboboxMask'
import DepartmentName from '@/components/widgets/DepartmentName'

export default {
  name: 'combobox-department',
  components: {
    ChevronDownIcon,
    ComboboxMask,
    DepartmentName
  },

  data() {
    return {
      showDepartmentList: false
    }
  },

  props: {
    label: {
      default: '',
      type: String
    },
    value: {
      default: '',
      type: String
    },
    selectableDepartments: {
      type: Array,
      required: false
    },
    maxHeightSelectInput: {
      default: 200,
      type: Number
    },
    width: {
      default: 250,
      type: Number
    },
    dispayAllAndMyDepartments: {
      default: false,
      type: Boolean
    },
    rounded: {
      default: false,
      type: Boolean
    }
  },

  mounted() {},

  computed: {
    ...mapGetters([
      'departmentMap',
      'departments',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'user'
    ]),

    departmentsToTakeAccount() {
      const departments = this.selectableDepartments
        ? [...this.selectableDepartments]
        : [...this.departments]
      return departments.sort((a, b) => a.name.localeCompare(b.name))
    },

    departmentList() {
      if (this.dispayAllAndMyDepartments) {
        const departmentFilter = [
          {
            name: this.$t('tasks.combobox_departments.all_departments'),
            id: 'ALL',
            color: '#CCC'
          }
        ]
        if (!this.isCurrentUserManager && this.user.departments.length > 0) {
          departmentFilter.unshift({
            name: this.$t('tasks.combobox_departments.my_departments'),
            id: 'MY_DEPARTMENTS',
            color: '#000000'
          })
        }
        return [...departmentFilter, ...this.departmentsToTakeAccount]
      } else if (
        this.isCurrentUserSupervisor &&
        this.user.departments.length > 0
      ) {
        return [...this.departmentsToTakeAccount]
      } else {
        return [
          { name: '---', id: null, color: '#000000' },
          ...this.departmentsToTakeAccount
        ]
      }
    },

    currentDepartment() {
      if (this.value) {
        const departmentMapped = this.departmentMap.get(this.value)
        if (departmentMapped) {
          return departmentMapped
        } else {
          return this.departmentList.find(d => d.id === this.value)
        }
      } else {
        return this.departmentList[0]
      }
    }
  },

  methods: {
    selectDepartment(department) {
      this.$emit('input', department.id)
      this.showDepartmentList = false
    },

    toggleDepartmentList() {
      this.showDepartmentList = !this.showDepartmentList
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .selected-department-line,
  .department-line,
  .department-combo {
    background: $dark-grey-light;
    border-color: $dark-grey;
  }

  .department-line:hover {
    background: $dark-purple;
  }
}

.department-line {
}

.department-combo {
  background: $white;
  border: 1px solid $light-grey-light;
  user-select: none;
  cursor: pointer;
  border-radius: 10px;
  margin: 0;
  padding: 0.15em;
  position: relative;
}

.department-combo:hover {
  border: 1px solid $green;
}

.selected-department-line {
  background: $white;
  padding: 0.2em;
  flex: 1;
}

.department-line {
  background: $white;
  cursor: pointer;
  padding: 0.2em;
  margin: 0;

  &:hover {
    background: $purple;
  }
}

.down-icon {
  width: 15px;
  min-width: 15px;
  margin-right: 0.4em;
  color: $green;
  cursor: pointer;
}

.select-input {
  background: $white;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  position: absolute;
  border: 1px solid $light-grey-light;
  z-index: 300;
  margin-left: -1px;
  max-height: 200px;
  overflow-y: auto;
  left: 0;
}

.field .label {
  padding-top: 5px;
}

.rounded {
  border-radius: 20px;

  &.opened {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .selected-department-line {
    padding-top: 0px;

    padding-bottom: 0px;
    border-radius: 50px;
  }
}
</style>
