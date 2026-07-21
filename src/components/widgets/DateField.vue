<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label">{{ label }}</label>
    <vue-date-picker
      auto-apply
      class="datepicker"
      :dark="isDark || isDarkTheme"
      :disabled="disabled"
      :filters="{ weekDays: weekDaysDisabled ? [6, 0] : [] }"
      :formats="{ input: format }"
      :input-attrs="{ clearable: canDelete, hideInputIcon: true }"
      :locale="dateFnsLocale"
      :model-type="modelType"
      :min-date="minDate"
      :max-date="maxDate"
      :placeholder="placeholder"
      :teleport="true"
      :time-config="{ enableTimePicker: false }"
      :timezone="utc ? 'utc' : undefined"
      v-model="localValue"
    >
    </vue-date-picker>
  </div>
</template>

<script setup>
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
  const locale = user.value.locale || 'en_US'
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
  modelValue: {
    default: () => new Date(),
    type: [Date, String]
  },
  placeholder: {
    default: null,
    type: String
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

const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    if (value?.setHours) {
      value.setHours(0, 0, 0, 0)
    }
    emit('update:model-value', value)
    emit('change', value)
  }
})
</script>

<style lang="scss" scoped>
.datepicker {
  display: inline-flex;
  max-width: 200px;
}
</style>
