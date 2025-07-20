<template>
  <div class="columns">
    <div class="column column-departments">
      <label class="label">{{ $t('departments.title') }}</label>
      <ul class="element-list">
        <li
          :class="{
            selected: selectedDepartment && selectedDepartment.id === dept.id
          }"
          v-for="dept in departments"
          :key="dept.id"
          @click="selectDepartment(dept)"
        >
          <department-name :department="dept" />
        </li>
      </ul>
    </div>
    <div class="column column-middle">
      <label class="label">
        {{ $t('departments.linked_items') }}
      </label>
      <ul class="element-list">
        <li v-if="selectedDepartment === null">
          {{ $t('departments.select_department') }}
        </li>
        <li v-else-if="linkedItems.length === 0">
          {{ $t('departments.no_items_linked') }}
        </li>
        <template v-else>
          <li
            :key="item.id"
            v-for="item in departmentLinkedItems"
            @click="removeItem(item)"
          >
            <div class="item-info">
              {{ item.name }}
            </div>
          </li>
        </template>
      </ul>
    </div>
    <div class="column column-hardware">
      <label class="label">
        {{ $t('departments.available_items') }}
      </label>
      <ul class="element-list">
        <li
          :key="item.id"
          v-for="item in availableItems"
          @click="selectItem(item)"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'

import DepartmentName from '@/components/widgets/DepartmentName.vue'

const store = useStore()
const props = defineProps({
  type: {
    type: String,
    required: true
  },
  linkedItems: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    required: true,
    default: () => []
  }
})
const emit = defineEmits(['link-item', 'unlink-item'])

// Data

const selectedDepartment = ref(null)
const departmentLinkedItems = ref([])

// Hooks

onMounted(async () => {})

// Computed

const departments = computed(() => {
  return store.getters.departments
})

const availableItems = computed(() => {
  const itemIds = departmentLinkedItems.value.map(item => item.id)
  return props.items.filter(item => !itemIds.includes(item.id))
})

// Methods

const selectDepartment = department => {
  if (selectedDepartment.value === department) {
    selectedDepartment.value = null
  } else {
    selectedDepartment.value = department
  }
}

const selectItem = item => {
  if (!selectedDepartment.value) return
  emit('link-item', {
    departmentId: selectedDepartment.value.id,
    itemId: item.id
  })
  if (!departmentLinkedItems.value) {
    departmentLinkedItems.value = []
  }
  departmentLinkedItems.value.push(item)
}

const removeItem = item => {
  if (!selectedDepartment.value) return
  emit('unlink-item', {
    departmentId: selectedDepartment.value.id,
    itemId: item.id
  })
  departmentLinkedItems.value = departmentLinkedItems.value.filter(
    i => i.id !== item.id
  )
}

// Watchers

watch(selectedDepartment, newVal => {
  if (selectedDepartment.value === null) {
    departmentLinkedItems.value = []
  } else {
    departmentLinkedItems.value = props.linkedItems[newVal.id] || []
  }
})
</script>

<style scoped>
.columns {
  display: flex;
  gap: 2rem;
  flex: 1;
}

.column {
  flex: 1;
  min-width: 0;
  overflow-y: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.column-departments,
.column-hardware {
  border-radius: 8px;
}

ul.element-list {
  padding: 0;
  border: 1px solid var(--border-alt);
  border-radius: 8px;
  flex: 1;
  margin: 0;
  overflow-y: auto;
  list-style: none;

  li {
    border-bottom: 1px solid var(--border-alt);
    cursor: pointer;
    margin-bottom: 0;
    padding: 0.5rem;

    &:hover {
      background-color: var(--background-selectable);
    }

    &.selected {
      background-color: var(--background-selected);
    }
  }
}
</style>
