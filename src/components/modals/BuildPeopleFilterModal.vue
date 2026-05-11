<template>
  <base-modal
    :active="active"
    :title="$t('entities.build_filter.title')"
    @cancel="$emit('cancel')"
  >
    <h3 class="subtitle">
      {{ $t('entities.build_filter.department') }}
    </h3>

    <div
      class="flexrow department-filter"
      :key="'task-type-' + i"
      v-for="(departmentFilter, i) in departmentFilters.values"
    >
      <combobox
        class="flexrow-item"
        :options="operatorOptions"
        @update:model-value="onDepartmentOperatorChanged(departmentFilter)"
        locale-key-prefix="entities.build_filter."
        v-model="departmentFilter.operator"
      />
      <div class="flexrow-item flexrow value-column">
        <div
          :key="`department-${index}`"
          v-for="(_, index) in departmentFilter.values"
        >
          <combobox
            class="flexrow-item"
            :options="departmentsOptions"
            v-model="departmentFilter.values[index]"
          />
        </div>
        <button-simple
          class="mt05"
          icon="plus"
          @click="addInDepartmentFilter(departmentFilter)"
          v-if="departmentFilter.operator === 'in'"
        />
      </div>
    </div>

    <modal-footer
      :error-text="$t('entities.thumbnails.error')"
      @confirm="applyFilter"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { useStore } from 'vuex'

import { getFilters } from '@/lib/filtering'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'

const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

const operatorOptions = [
  { label: 'equal', value: '=' },
  { label: 'not_equal', value: '=-' },
  { label: 'in', value: 'in' }
]

const departmentFilters = reactive({ values: [] })
let union = 'and'

const departmentMap = computed(() => store.getters.departmentMap)
const departments = computed(() => store.getters.departments)
const peopleSearchText = computed(() => store.getters.peopleSearchText)

const departmentsOptions = computed(() =>
  departments.value.map(department => ({
    label: department.name,
    value: department.id
  }))
)

const onDepartmentOperatorChanged = departmentFilter => {
  if (departmentFilter.operator !== 'in') {
    departmentFilter.values = [departmentFilter.values[0]]
  }
}

const addInDepartmentFilter = departmentFilter => {
  departmentFilter.values.push(departments.value[0].name)
}

const applyDepartmentChoice = query => {
  departmentFilters.values.forEach(departmentFilter => {
    const operator = departmentFilter.operator === '=-' ? '=[-' : '=['
    const value = departmentFilter.values
      .map(
        dId => departmentMap.value.get(dId)?.name || departments.value[0].name
      )
      .join(',')
    query += ` department${operator}${value}]`
  })
  return query
}

const applyUnionChoice = query =>
  union === 'or' ? ` +(${query.trim()})` : query

const buildFilter = () => {
  let query = ''
  query = applyDepartmentChoice(query)
  query = applyUnionChoice(query)
  return query.trim()
}

const applyFilter = () => {
  emit('confirm', buildFilter())
}

const setFiltersFromDepartmentQuery = filter => {
  let operator = '='
  if (filter.values.length > 1) operator = 'in'
  else if (filter.excluding) operator = '=-'
  departmentFilters.values.push({
    operator,
    values: filter.values.map(d => d.id)
  })
}

const setFiltersFromCurrentQuery = () => {
  if (!peopleSearchText.value) return
  departmentFilters.values = []
  const filters = getFilters({
    entryIndex: [],
    departments: departments.value,
    persons: [],
    query: peopleSearchText.value
  })
  filters.forEach(setFiltersFromDepartmentQuery)
  if (filters.union) union = 'or'
}

const reset = () => {
  departmentFilters.values = [
    {
      operator: '=',
      values: departments.value.length > 0 ? [departments.value[0].id] : []
    }
  ]
}

watch(
  () => props.active,
  active => {
    if (active) {
      reset()
      setFiltersFromCurrentQuery()
    }
  }
)

onMounted(() => {
  reset()
  setFiltersFromCurrentQuery()
})
</script>

<style lang="scss" scoped>
.modal-content {
  max-height: calc(100vh - 7rem);
  margin-top: 3rem;
}

.add-button button {
  margin-left: 0;
}

.subtitle {
  color: $grey;
  font-size: 1em;
  margin-top: 1.1em;
  text-transform: uppercase;
  margin-bottom: 0.5em;
  margin-left: 0.1em;
}

.field {
  margin-top: 0;
  margin-bottom: 0;
}

.department-filter {
  margin-bottom: 0.3em;
  align-items: flex-start;

  .descriptor-text-value {
    padding: 0;
  }
}

.value-column {
  flex-direction: column;
  align-items: flex-start;
}
</style>
