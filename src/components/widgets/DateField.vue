<template>
  <div :class="{ field: withMargin }" ref="rootRef">
    <label class="label" v-if="label">{{ label }}</label>
    <vue-date-picker
      auto-apply
      class="datepicker"
      :class="{ range }"
      :dark="isDark || isDarkTheme"
      :disabled="disabled"
      :filters="{ weekDays: weekDaysDisabled ? [6, 0] : [] }"
      :floating="fullScreenContainer ? { strategy: 'fixed' } : {}"
      :key="fullScreenContainer ? 'full-screen' : 'page'"
      :formats="{ input: inputFormat }"
      :input-attrs="{ clearable: canDelete, hideInputIcon: true }"
      :locale="dateFnsLocale"
      :model-type="modelType"
      :min-date="pickerMinDate"
      :max-date="pickerMaxDate"
      :placeholder="placeholder"
      :range="range ? { partialRange: false } : false"
      :teleport="!fullScreenContainer"
      :time-config="{ enableTimePicker: false }"
      ref="pickerRef"
      v-model="localValue"
      v-if="isPickerLoaded"
    >
    </vue-date-picker>
    <!-- The markup of the picker input, which the app styles address -->
    <div
      :class="[
        'dp--main',
        isDark || isDarkTheme ? 'dp--theme-dark' : 'dp--theme-light',
        'datepicker',
        { range }
      ]"
      v-else
    >
      <div @click="loadPicker">
        <div class="dp--input-wrap">
          <input
            aria-expanded="false"
            aria-haspopup="dialog"
            :aria-disabled="disabled || undefined"
            :aria-label="PICKER_INPUT_LABEL"
            autocomplete="off"
            :class="inputClasses"
            :disabled="disabled"
            inputmode="none"
            :placeholder="placeholder"
            role="combobox"
            :value="inputText"
            @blur="isInputFocused = false"
            @focus="isInputFocused = true"
            @input="onInput"
            @keydown="onInputKeydown"
          />
          <div></div>
          <button
            :aria-label="PICKER_CLEAR_LABEL"
            class="dp--clear-btn"
            type="button"
            @click.prevent.stop="clear"
            @keydown.enter.prevent.stop="clear"
            @keydown.space.prevent.stop="clear"
            v-if="canDelete && inputText && !disabled"
          >
            <svg
              aria-hidden="true"
              class="dp--icon dp--input-icons"
              fill="currentColor"
              role="img"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23.057 7.057l-16 16c-0.52 0.52-0.52 1.365 0 1.885s1.365 0.52 1.885 0l16-16c0.52-0.52 0.52-1.365 0-1.885s-1.365-0.52-1.885 0z"
              ></path>
              <path
                d="M7.057 8.943l16 16c0.52 0.52 1.365 0.52 1.885 0s0.52-1.365 0-1.885l-16-16c-0.52-0.52-1.365-0.52-1.885 0s-0.52 1.365 0 1.885z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-unused-vars */
import { VueDatePicker } from '@vuepic/vue-datepicker'
/* eslint-enable no-unused-vars */
import '@vuepic/vue-datepicker/dist/main.css'

import { format as formatDate, isValid, parse as parseDate } from 'date-fns'
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
import { computed, nextTick, ref } from 'vue'
import { useStore } from 'vuex'

import { useFullScreenContainer } from '@/composables/fullScreen'
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

// The default labels of the picker
const PICKER_INPUT_LABEL = 'Datepicker input'
const PICKER_CLEAR_LABEL = 'Clear value'

const store = useStore()

const rootRef = ref(null)
// The calendar opens in <body>, behind an element in full screen: it opens
// in place there, fixed on the screen. The picker reads its floating options
// once, so a new one comes as the full screen starts or ends.
const fullScreenContainer = useFullScreenContainer(() => rootRef.value)

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
  // Shows the input alone and loads the picker when the field is used: a
  // list can hold a field per row.
  lazy: {
    default: false,
    type: Boolean
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

// Until the picker loads, the field shows the input of the picker as the
// picker would render it, and behaves as it does.
const isPickerLoaded = ref(!props.lazy)
const isInputFocused = ref(false)
const pickerRef = ref(null)

const inputClasses = computed(() => ({
  'dp--pointer': !props.disabled,
  'dp--disabled': props.disabled,
  'dp--input-readonly': true,
  'dp--input': true,
  'dp--input-not-clearable': !props.canDelete,
  'dp--input-focus': isInputFocused.value,
  'dp--input-reg': true
}))

// A model of a model type is a string in that format.
const toShownDate = value => {
  if (typeof value !== 'string') return value
  return props.modelType
    ? parseDate(value, props.modelType, new Date())
    : new Date(value)
}

// The picker shows no text for a value it cannot read.
const inputText = computed(() => {
  const value = localValue.value
  if (!value) return ''
  const dates = (props.range ? value : [value]).map(toShownDate)
  if (dates.length !== (props.range ? 2 : 1) || !dates.every(isValid)) {
    return ''
  }
  if (props.range) return inputFormat.value(dates)
  return formatDate(dates[0], props.format, { locale: dateFnsLocale.value })
})

// The picker input keeps its clicks and Enter away from the page, a list row
// included.
const loadPicker = event => {
  event.stopPropagation()
  if (props.disabled) return
  isPickerLoaded.value = true
  nextTick(() => {
    rootRef.value?.querySelector('input')?.focus({ preventScroll: true })
    pickerRef.value?.openMenu()
  })
}

const onInputKeydown = event => {
  if (event.key === 'Enter') loadPicker(event)
  if (event.code !== 'Tab') event.preventDefault()
}

const clear = () => {
  localValue.value = null
}

// Cut, Delete, a paste, or a drop change the text with no key: the picker
// clears an emptied input, and reads any other text, once loaded.
const onInput = event => {
  const text = event.target.value
  if (!text) {
    clear()
    return
  }
  loadPicker(event)
  if (!isPickerLoaded.value) return
  nextTick(() => {
    const input = rootRef.value.querySelector('input')
    input.value = text
    input.dispatchEvent(new Event('input'))
  })
}
</script>

<style lang="scss" scoped>
.datepicker {
  display: inline-flex;
  max-width: 200px;
}
</style>
