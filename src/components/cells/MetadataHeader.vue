<template>
  <th
    scope="col"
    class="metadata-descriptor"
    :class="{ 'datatable-row-header': isStick, resizable }"
    :style="thStyle"
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
        role="button"
        tabindex="0"
        @click="$emit('show-metadata-header-menu', $event)"
        @keydown.enter.prevent="$emit('show-metadata-header-menu', $event)"
        @keydown.space.prevent="$emit('show-metadata-header-menu', $event)"
        v-if="!noMenu"
      >
        <chevron-down-icon :size="14" />
      </span>
    </div>
    <span
      class="resize-handle"
      @mousedown.stop.prevent="startResize"
      v-if="resizable"
    ></span>
  </th>
</template>

<script setup>
import { ChevronDownIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useStore } from 'vuex'

import DepartmentName from '@/components/widgets/DepartmentName.vue'

const props = defineProps({
  descriptor: { type: Object, required: true },
  isStick: { type: Boolean, default: false },
  left: { type: String, default: '0px' },
  noMenu: { type: Boolean, default: false },
  resizable: { type: Boolean, default: false },
  width: { type: Number, default: null }
})

const emit = defineEmits(['resize', 'resize-end', 'show-metadata-header-menu'])

const store = useStore()
const departmentMap = computed(() => store.getters.departmentMap)

const currentDepartments = computed(() =>
  (props.descriptor.departments || []).map(id => departmentMap.value.get(id))
)

const thStyle = computed(() => {
  const style = { left: props.left }
  // min-width is the lever the auto table-layout actually honours; width
  // overrides the fixed 120px base so the column can shrink too.
  if (props.width) {
    style.width = `${props.width}px`
    style.minWidth = `${props.width}px`
  }
  return style
})

// Column resize: drag the right-edge handle, report the new width upward so
// the parent owns and persists it (and applies it to the body cells).
let startX = 0
let startWidth = 0

const onResizeMove = event => {
  emit('resize', Math.max(60, startWidth + event.clientX - startX))
}

const onResizeUp = () => {
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeUp)
  emit('resize-end')
}

const startResize = event => {
  startX = event.clientX
  startWidth = event.currentTarget.parentElement.offsetWidth
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeUp)
}
</script>

<style lang="scss" scoped>
th.metadata-descriptor {
  min-width: 120px;
  max-width: none;
  width: 120px;
  overflow-wrap: break-word;
  hyphens: auto;

  &.datatable-row-header {
    z-index: 1001; // above sticky cells
  }

  &.resizable {
    min-width: 60px;
    position: relative;
  }
}

.resize-handle {
  bottom: 0;
  cursor: col-resize;
  position: absolute;
  right: 0;
  top: 0;
  user-select: none;
  width: 6px;
}

th.metadata-descriptor.resizable:hover .resize-handle {
  background: var(--border);
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
