<template>
  <tr class="datatable-row" :key="taskType.id">
    <td class="grab">
      <grip-vertical-icon class="grab" />
    </td>
    <task-type-cell :task-type="taskType" />
    <td class="short-name">
      {{ taskType.short_name }}
    </td>
    <td class="bitrate" v-for="key in BITRATE_KEYS" :key="key">
      <input
        class="input"
        type="number"
        min="1"
        :max="bitrateCeiling(key)"
        :placeholder="currentProduction[key] || ''"
        :title="$t(`productions.fields.${key}`)"
        :value="link[key] ?? ''"
        @change="onBitrateChange(key, $event.target.value)"
      />
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

import { MAX_MOVIE_BITRATE, clampBitrates } from '@/lib/productions'
import { parseDate } from '@/lib/time'
import { GripVerticalIcon } from 'lucide-vue-next'

import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'

const props = defineProps({
  taskType: { required: true, type: Object },
  scheduleItem: { required: true, type: Object }
})

const emit = defineEmits(['bitrates-changed', 'date-changed', 'remove'])

const BITRATE_KEYS = ['hd_bitrate_compression', 'ld_bitrate_compression']

const store = useStore()

const startDate = ref(null)
const endDate = ref(null)
const silent = ref(true)

const currentProduction = computed(() => store.getters.currentProduction)
const link = computed(
  () => currentProduction.value.task_type_links?.[props.taskType.id] || {}
)

const bitrateCeiling = key =>
  key === 'hd_bitrate_compression'
    ? MAX_MOVIE_BITRATE
    : link.value.hd_bitrate_compression ||
      currentProduction.value.hd_bitrate_compression ||
      MAX_MOVIE_BITRATE

const onBitrateChange = (key, value) => {
  const bitrates = clampBitrates(
    { ...link.value, [key]: value },
    currentProduction.value.hd_bitrate_compression
  )
  emit('bitrates-changed', { taskType: props.taskType, ...bitrates })
}

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

.bitrate {
  min-width: 120px;
  width: 120px;

  input {
    width: 100px;
  }
}

.grab {
  cursor: grab;
  margin: 0;
  width: 30px;
  color: $grey;
  margin-top: 0.3em;
}
</style>
