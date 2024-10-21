<template>
  <td class="departments">
    <span
      class="departments-element"
      :key="'department-' + department.id"
      v-for="department in sortDepartments(departments)"
    >
      <department-name :department="department" v-if="department" />
    </span>
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
    ...mapGetters(['departmentMap'])
  },

  methods: {
    sortDepartments(departmentIds = []) {
      return sortByName(
        departmentIds.map(departmentId => this.departmentMap.get(departmentId))
      )
    }
  }
}
</script>
