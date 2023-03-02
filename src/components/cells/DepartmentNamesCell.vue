<template>
<td class="departments">
  <span
    class="departments-element"
    v-for="department in sortDepartments(departments)"
    :key="'department-' + department.id"
  >
    <department-name
      :department="department"
      v-if="department"
    />
  </span>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { sortByName } from '@/lib/sorting'

import DepartmentName from '@/components/widgets/DepartmentName'

export default {
  name: 'department-names-cell',
  data () {
    return {
    }
  },

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
    ...mapGetters([
      'departmentMap'
    ])
  },

  methods: {
    ...mapActions([
    ]),

    sortDepartments (departmentIds = []) {
      return sortByName(departmentIds
        .map(departmentId => this.departmentMap.get(departmentId)))
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
