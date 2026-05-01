<template>
  <td>
    <department-name
      :key="department.id"
      :department="department"
      v-for="department in sortedDepartments"
    />
  </td>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { sortByName } from '@/lib/sorting'

import DepartmentName from '@/components/widgets/DepartmentName.vue'

const store = useStore()

const props = defineProps({
  departments: { type: Array, default: () => [] }
})

const departmentMap = computed(() => store.getters.departmentMap)

const sortedDepartments = computed(() =>
  sortByName(
    props.departments
      .map(departmentId => departmentMap.value.get(departmentId))
      .filter(Boolean)
  )
)
</script>
