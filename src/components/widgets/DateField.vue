<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label">{{ label }}</label>
    <vue-date-picker
      auto-apply
      class="datepicker"
      :class="{ range }"
      :dark="isDark || isDarkTheme"
      :disabled="disabled"
      :filters="{ weekDays: weekDaysDisabled ? [6, 0] : [] }"
      :formats="{ input: inputFormat }"
      :input-attrs="{ clearable: canDelete, hideInputIcon: true }"
      :locale="dateFnsLocale"
      :model-type="modelType"
      :min-date="pickerMinDate"
      :max-date="pickerMaxDate"
      :placeholder="placeholder"
      :range="range ? { partialRange: false } : false"
      :teleport="true"
      :time-config="{ enableTimePicker: false }"
      v-model="localValue"
    >
    </vue-date-picker>
  </div>
</template>

<script setup>
/* eslint-disable no-unused-vars */
import { VueDatePicker } from '@vuepic/vue-datepicker'
/* eslint-enable no-unused-vars */
import '@vuepic/vue-datepicker/dist/main.css'

import { format as formatDate } from 'date-fns'
import {
  da,
  de,
  enUS,
  es,
  faIR,
  fr,
  hu,
  it,
  ja,
  ko,
  nl,
  pl,
  pt,
  ru,
  zhCN,
  zhTW
} from 'date-fns/locale'
import { computed } from 'vue'
import { useStore } from 'vuex'

import { localDayToUtcDate, utcDayToLocalDate } from '@/lib/time'

// date-fns locales matching src/locales/, keyed by two-letter code.
const DATE_FNS_LOCALES = {
  da,
  de,
  en: enUS,
  es,
  fa: faIR,
  fr,
  hu,
  it,
  ja,
  ko,
  nl,
  pl,
  pt,
  ru,
  zh: zhCN
}

const store = useStore()
const isDarkTheme = computed(() => store.getters.isDarkTheme)
const user = computed(() => store.getters.user)

const dateFnsLocale = computed(() => {
  const locale = user.value?.locale || 'en_US'
  if (locale.startsWith('zh_Hant')) return zhTW
  return DATE_FNS_LOCALES[locale.substring(0, 2)] || enUS
})

const props = defineProps({
  canDelete: {
    default: true,
    type: Boolean
  },
  disabled: {
    default: false,
    type: Boolean
  },
  format: {
    default: 'yyyy-MM-dd',
    type: String
  },
  isDark: {
    default: false,
    type: Boolean
  },
  label: {
    default: '',
    type: String
  },
  minDate: {
    default: null,
    type: [Date, String]
  },
  maxDate: {
    default: null,
    type: [Date, String]
  },
  // Null keeps vue-date-picker's default Date model. Set to a format string
  // (e.g. "yyyy-MM-dd") to make v-model that formatted string instead.
  modelType: {
    default: null,
    type: String
  },
  // A Date, or an array of two dates when range is set. An empty range is
  // null.
  modelValue: {
    default: () => new Date(),
    type: [Date, String, Array]
  },
  placeholder: {
    default: null,
    type: String
  },
  range: {
    default: false,
    type: Boolean
  },
  utc: {
    default: false,
    type: Boolean
  },
  weekDaysDisabled: {
    default: false,
    type: Boolean
  },
  withMargin: {
    default: true,
    type: Boolean
  }
})

const emit = defineEmits(['update:model-value', 'change'])

// In range mode, formats.input receives [start, end]: a same-day range is collapsed to a single date in the input.
const inputFormat = computed(() => {
  if (!props.range) return props.format
  return ([start, end]) => {
    const fmt = date => formatDate(date, props.format)
    if (fmt(start) === fmt(end)) return fmt(start)
    return `${fmt(start)} - ${fmt(end)}`
  }
})

// A utc field holds each day as the Date at UTC midnight of that day, while
// the picker shows and returns local dates.
const toPickerDate = date => (props.utc ? utcDayToLocalDate(date) : date)

const toModelDate = date => {
  if (props.utc) return localDayToUtcDate(date)
  date.setHours(0, 0, 0, 0)
  return date
}

const pickerMinDate = computed(() => toPickerDate(props.minDate))
const pickerMaxDate = computed(() => toPickerDate(props.maxDate))

const localValue = computed({
  get() {
    if (props.utc && Array.isArray(props.modelValue)) {
      return props.modelValue.map(utcDayToLocalDate)
    }
    return toPickerDate(props.modelValue)
  },
  set(value) {
    if (props.range) {
      // partialRange is disabled in the template: combined with auto-apply,
      // the picker would otherwise apply [start, null] and close the menu on
      // the very first click. This filter is a backstop so an incomplete
      // range can never reach the parent and trigger a reload.
      const dates = value?.filter(Boolean) ?? []
      if (value?.length && dates.length !== 2) return
      const range = dates.length === 2 ? dates.map(toModelDate) : null
      emit('update:model-value', range)
      emit('change', range)
      return
    }
    const date = value?.setHours ? toModelDate(value) : value
    emit('update:model-value', date)
    emit('change', date)
  }
})
</script>

<style lang="scss" scoped>
.datepicker {
  display: inline-flex;
  max-width: 200px;
}
</style>
