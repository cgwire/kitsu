<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label">{{ label }}</label>
    <vue-date-picker
      auto-apply
      class="datepicker"
      range
      :dark="isDark || isDarkTheme"
      :disabled="disabled"
      :formats="{ input: format }"
      :input-attrs="{ clearable: canDelete, hideInputIcon: true }"
      :locale="dateFnsLocale"
      :min-date="minDate"
      :max-date="maxDate"
      :placeholder="placeholder"
      :teleport="true"
      :time-config="{ enableTimePicker: false }"
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
  // Array of two dates, [start, end]. An empty range is null.
  modelValue: {
    default: null,
    type: Array
  },
  placeholder: {
    default: null,
    type: String
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
    // The picker emits [start, null] while the user is still choosing the
    // second date. Only a complete range is worth propagating, otherwise
    // every first click would trigger a reload.
    const range = value?.filter(Boolean) ?? []
    const isComplete = range.length === 2
    if (value?.length && !isComplete) return

    const normalized = isComplete ? range : null
    normalized?.[0].setHours(0, 0, 0, 0)
    normalized?.[1].setHours(0, 0, 0, 0)
    emit('update:model-value', normalized)
    emit('change', normalized)
  }
})
</script>

<style lang="scss" scoped>
.datepicker {
  display: inline-flex;
  max-width: 260px;
}
</style>
