<template>
  <th
    scope="col"
    class="metadata-descriptor"
    :class="{'datatable-row-header': isStick}"
    :style="{'left': left}"
  >
    <div class="flexrow">
      <department-name
        :key="department.id"
        :department="department"
        :only-dot="true"
        :style="{'padding': '0px 0px'}"
        v-for="department in currentDepartments"
      />
      <span class="flexrow-item descriptor-name">
        {{ descriptor.name }}
      </span>
      <chevron-down-icon
        @click="$emit('show-metadata-header-menu', $event)"
        class="header-icon flexrow-item"
      />
    </div>
  </th>
</template>

<script>
import {
  ChevronDownIcon
} from 'vue-feather-icons'

import { mapGetters } from 'vuex'
import DepartmentName from '@/components/widgets/DepartmentName'

export default {
  name: 'MetadataHeader',
  props: {
    descriptor: Object,
    isStick: {
      type: Boolean,
      default: false
    },
    left: {
      type: String,
      default: '0px'
    }
  },
  components: { ChevronDownIcon, DepartmentName },
  computed: {
    ...mapGetters([
      'departmentMap',
      'taskTypeMap'
    ]),

    currentDepartments () {
      const departemts = this.descriptor.departments || []
      return departemts.map(
        departmentId => this.departmentMap.get(departmentId)
      )
    }
  }
}

</script>

<style lang="scss" scoped>

th.metadata-descriptor {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  overflow-wrap: break-word;
  hyphens: auto;
}

</style>
