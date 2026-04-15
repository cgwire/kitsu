<template>
  <tr class="datatable-row" :key="taskType.id">
    <td class="grab">
      <grip-vertical-icon class="grab" />
    </td>
    <task-type-cell :task-type="taskType" />
    <td class="short-name">
      {{ taskType.short_name }}
    </td>
    <td class="remove">
      <button
        class="button"
        @click="$emit('remove', { scheduleItem, taskType })"
      >
        {{ $t('main.remove') }}
      </button>
    </td>
  </tr>
</template>

<script setup>
import moment from 'moment'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { parseDate } from '@/lib/time'
import { GripVerticalIcon } from 'lucide-vue-next'

import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'

const props = defineProps({
  taskType: { required: true, type: Object },
  scheduleItem: { required: true, type: Object }
})

const emit = defineEmits(['date-changed', 'remove'])

const store = useStore()

const startDate = ref(null)
const endDate = ref(null)
const silent = ref(true)

const currentProduction = computed(() => store.getters.currentProduction)

// eslint-disable-next-line no-unused-vars
const productionTimeRange = computed(() => ({
  to: parseDate(currentProduction.value.start_date).toDate(),
  from: parseDate(currentProduction.value.end_date).toDate()
}))

// eslint-disable-next-line no-unused-vars
const endDateTimeRange = computed(() => ({
  to: startDate.value,
  from: parseDate(currentProduction.value.end_date).toDate()
}))

onMounted(() => {
  startDate.value = parseDate(props.scheduleItem.start_date).toDate()
  endDate.value = parseDate(props.scheduleItem.end_date).toDate()
  nextTick(() => {
    silent.value = false
  })
})

watch(startDate, () => {
  if (silent.value) return
  const start = moment(startDate.value)
  let end = moment(endDate.value)
  silent.value = true
  if (end.isBefore(start)) {
    end = start.clone().add(1, 'days')
    endDate.value = end.toDate()
  }
  const data = { ...props.scheduleItem, startDate: start, endDate: end }
  emit('date-changed', data)
  nextTick(() => {
    silent.value = false
  })
})

watch(endDate, () => {
  if (silent.value) return
  let start = moment(startDate.value)
  const end = moment(endDate.value)
  silent.value = true
  if (end.isBefore(start)) {
    start = end.clone().add(-1, 'days')
    startDate.value = start.toDate()
  }
  const data = { ...props.scheduleItem, startDate: start, endDate: end }
  emit('date-changed', data)
  nextTick(() => {
    silent.value = false
  })
})

watch(
  () => props.scheduleItem,
  () => {
    silent.value = true
    startDate.value = parseDate(props.scheduleItem.start_date).toDate()
    endDate.value = parseDate(props.scheduleItem.end_date).toDate()
    nextTick(() => {
      silent.value = false
    })
  }
)
</script>

<style lang="scss" scoped>
.field {
  margin-bottom: 0;
  width: 105px;
}

.priority {
  padding-left: 2rem;
}

.grab {
  cursor: grab;
  margin: 0;
  width: 30px;
  color: $grey;
  margin-top: 0.3em;
}
</style>
