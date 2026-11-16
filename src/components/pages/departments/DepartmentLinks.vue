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
          role="button"
          tabindex="0"
          @click="selectDepartment(dept)"
          @keydown.enter.prevent="onDepartmentKey($event, dept)"
          @keydown.space.prevent="onDepartmentKey($event, dept)"
        >
          <department-name :department="dept" />
        </li>
      </ul>
    </div>
    <div class="column column-middle">
      <label class="label">
        {{ $t('departments.linked_items') }}
      </label>
      <div class="element-list">
        <p class="list-line" v-if="selectedDepartment === null">
          {{ $t('departments.select_department') }}
        </p>
        <p class="list-line" v-else-if="departmentLinkedItems.length === 0">
          {{ $t('departments.no_items_linked') }}
        </p>
        <template v-else>
          <transfer-list-item
            action="remove"
            :key="item.id"
            @remove="removeItem(item)"
            v-for="item in departmentLinkedItems"
          >
            {{ item.name }}
          </transfer-list-item>
        </template>
      </div>
    </div>
    <div class="column column-hardware">
      <label class="label">
        {{ $t('departments.available_items') }}
      </label>
      <div class="element-list">
        <template v-if="selectedDepartment">
          <transfer-list-item
            :key="item.id"
            @add="selectItem(item)"
            v-for="item in availableItems"
          >
            {{ item.name }}
          </transfer-list-item>
        </template>
        <template v-else>
          <p class="list-line" :key="item.id" v-for="item in availableItems">
            {{ item.name }}
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import DepartmentName from '@/components/widgets/DepartmentName.vue'
import TransferListItem from '@/components/widgets/TransferListItem.vue'

const store = useStore()

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  linkedItems: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['link-item', 'unlink-item'])

// Data

const selectedDepartment = ref(null)

// Computed

const departments = computed(() => {
  return store.getters.departments
})

const departmentLinkedItems = computed(() => {
  return props.linkedItems[selectedDepartment.value?.id] || []
})

const availableItems = computed(() => {
  const itemIds = departmentLinkedItems.value.map(item => item.id)
  return props.items.filter(item => !itemIds.includes(item.id))
})

// Methods

const selectDepartment = department => {
  selectedDepartment.value =
    selectedDepartment.value === department ? null : department
}

// A held key repeats, and each repeat would toggle the selection again.
const onDepartmentKey = (event, department) => {
  if (!event.repeat) selectDepartment(department)
}

const selectItem = item => {
  if (!selectedDepartment.value) return
  emit('link-item', {
    departmentId: selectedDepartment.value.id,
    itemId: item.id
  })
}

const removeItem = item => {
  if (!selectedDepartment.value) return
  emit('unlink-item', {
    departmentId: selectedDepartment.value.id,
    itemId: item.id
  })
}
</script>

<style lang="scss" scoped>
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

.element-list {
  padding: 0;
  border: 1px solid var(--border-alt);
  border-radius: 8px;
  flex: 1;
  margin: 0;
  overflow-y: auto;
  list-style: none;

  li,
  .list-line,
  .transfer-list-item {
    border-bottom: 1px solid var(--border-alt);
    margin: 0;
    padding: 0.5rem;
  }

  li {
    cursor: pointer;

    &:hover {
      background-color: var(--background-selectable);
    }

    &.selected {
      background-color: var(--background-selected);
    }
  }

  // Square rows flush with each other, like the department ones.
  .transfer-list-item {
    border-radius: 0;

    & + .transfer-list-item {
      margin-top: 0;
    }
  }
}

@media screen and (max-width: 768px) {
  .columns {
    flex-direction: column;
    gap: 1rem;
  }

  .column-hardware {
    display: none;
  }
}
</style>
