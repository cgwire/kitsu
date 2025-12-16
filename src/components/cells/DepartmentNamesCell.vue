<template>
  <td>
    <department-name
      :key="department.id"
      :department="department"
      v-for="department in sortedDepartments"
    />
  </td>
</template>

<script>
import { mapGetters } from 'vuex'

import { sortByName } from '@/lib/sorting'

import DepartmentName from '@/components/widgets/DepartmentName.vue'

export default {
  name: 'department-names-cell',

  components: {
    DepartmentName
  },

  props: {
    departments: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    ...mapGetters(['departmentMap']),

    sortedDepartments() {
      return sortByName(
        this.departments
          .map(departmentId => this.departmentMap.get(departmentId))
          .filter(Boolean)
      )
    }
  }
}
</script>
