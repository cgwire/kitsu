<template>
  <div>
    <label class="label" v-if="label.length">
      {{ label }}
    </label>
    <div
      ref="combobox"
      class="department-combo"
      :class="{
        opened: showDepartmentList,
        rounded,
        top
      }"
      :style="{
        width: `${width}px`
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
        :style="listStyle"
        v-if="showDepartmentList"
      >
        <div
          class="department-line"
          :key="department.id"
          @click="selectDepartment(department)"
          v-for="department in departmentList.filter(
            ({ id }) => id !== modelValue
          )"
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

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { ChevronDownIcon } from 'lucide-vue-next'

import ComboboxMask from '@/components/widgets/ComboboxMask.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'

const { t } = useI18n()
const store = useStore()

const props = defineProps({
  displayAllAndMyDepartments: {
    default: false,
    type: Boolean
  },
  label: {
    default: '',
    type: String
  },
  maxHeightSelectInput: {
    default: 200,
    type: Number
  },
  rounded: {
    default: false,
    type: Boolean
  },
  selectableDepartments: {
    type: Array,
    required: false
  },
  modelValue: {
    default: '',
    type: String
  },
  width: {
    default: 250,
    type: Number
  },
  withEmptyChoice: {
    default: true,
    type: Boolean
  },
  top: {
    default: false,
    type: Boolean
  },
  allDepartmentsLabel: {
    default: false,
    type: Boolean
  }
})

const emit = defineEmits(['update:modelValue'])

const combobox = ref(null)
const showDepartmentList = ref(false)

const departmentMap = computed(() => store.getters.departmentMap)
const departments = computed(() => store.getters.departments)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const user = computed(() => store.getters.user)

const departmentsToTakeAccount = computed(() => {
  const deps = props.selectableDepartments
    ? [...props.selectableDepartments]
    : [...departments.value]
  return deps.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      numeric: true
    })
  )
})

const departmentList = computed(() => {
  if (props.displayAllAndMyDepartments) {
    const departmentFilter = [
      {
        name: t('tasks.combobox_departments.all_departments'),
        id: 'ALL',
        color: '#CCC'
      }
    ]
    if (!isCurrentUserManager.value && user.value.departments.length > 0) {
      departmentFilter.unshift({
        name: t('tasks.combobox_departments.my_departments'),
        id: 'MY_DEPARTMENTS',
        color: '#000000'
      })
    }
    return [...departmentFilter, ...departmentsToTakeAccount.value]
  } else if (
    isCurrentUserSupervisor.value &&
    user.value.departments.length > 0
  ) {
    return [...departmentsToTakeAccount.value]
  } else if (props.withEmptyChoice) {
    return [
      {
        color: '#AAA',
        id: null,
        name: props.allDepartmentsLabel
          ? t('departments.all_departments')
          : t('departments.no_department')
      },
      ...departmentsToTakeAccount.value
    ]
  } else {
    return [...departmentsToTakeAccount.value]
  }
})

const currentDepartment = computed(() => {
  if (props.modelValue) {
    const departmentMapped = departmentMap.value.get(props.modelValue)
    if (departmentMapped) {
      return departmentMapped
    } else {
      return departmentList.value.find(d => d.id === props.modelValue)
    }
  } else {
    return departmentList.value[0]
  }
})

const listStyle = computed(() => {
  const data = {
    'max-height': `${props.maxHeightSelectInput}px`,
    width: `${props.width}px`,
    top: props.rounded ? '31px' : '37px',
    left: '0'
  }
  if (props.top) {
    Object.assign(data, {
      top: '-200px',
      bottom: '-90px',
      'border-top-left-radius': '10px',
      'border-top-right-radius': '10px',
      'border-bottom-left-radius': '0',
      'border-bottom-right-radius': '0'
    })
  }

  return data
})

const selectDepartment = department => {
  emit('update:modelValue', department.id)
  showDepartmentList.value = false
}

const toggleDepartmentList = () => {
  showDepartmentList.value = !showDepartmentList.value
}

const focus = () => {
  combobox.value.focus()
}

defineExpose({ focus })
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

.department-combo {
  background: $white;
  border: 1px solid $light-grey-light;
  user-select: none;
  cursor: pointer;
  border-radius: 10px;
  margin: 0;
  padding: 0.15em;
  position: relative;

  &.opened {
    &.top {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
    &:not(.top) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
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
  border-radius: 10px;

  &.opened {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .selected-department-line {
    padding-top: 0;
    padding-bottom: 0;
    border-radius: 50px;
  }
}
</style>
