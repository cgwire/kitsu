<template>
  <th
    scope="col"
    class="metadata-descriptor"
    :class="{ 'datatable-row-header': isStick }"
    :style="{ left }"
  >
    <div class="flexrow metadata-wrapper-header">
      <department-name
        :key="department.id"
        :department="department"
        no-padding
        only-dot
        v-for="department in currentDepartments"
      />
      <span
        class="flexrow-item ellipsis descriptor-name"
        :title="descriptor.name"
      >
        {{ descriptor.name }}
      </span>

      <span
        class="metadata-menu-button header-icon pointer"
        @click="$emit('show-metadata-header-menu', $event)"
        v-if="!noMenu"
      >
        <chevron-down-icon :size="14" />
      </span>
    </div>
  </th>
</template>

<script>
import { mapGetters } from 'vuex'
import { ChevronDownIcon } from 'lucide-vue-next'

import DepartmentName from '@/components/widgets/DepartmentName.vue'

export default {
  name: 'metadata-header',

  props: {
    descriptor: Object,
    isStick: {
      type: Boolean,
      default: false
    },
    left: {
      type: String,
      default: '0px'
    },
    noMenu: {
      type: Boolean,
      default: false
    }
  },

  components: {
    ChevronDownIcon,
    DepartmentName
  },

  emits: ['show-metadata-header-menu'],

  computed: {
    ...mapGetters(['departmentMap']),

    currentDepartments() {
      const departemts = this.descriptor.departments || []
      return departemts.map(departmentId =>
        this.departmentMap.get(departmentId)
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

.metadata-wrapper-header {
  position: relative;
}

.metadata-menu-button {
  background: var(--background-alt);
  border-radius: 50%;
  height: 16px;
  width: 16px;
  padding: 1px;
  position: absolute;
  right: 0;
}
</style>
