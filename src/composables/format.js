/*
 * Composition API counterpart of `src/components/mixins/format.js`.
 * New `<script setup>` components should use `useFormat()` (or the
 * pure-function named exports below). The legacy mixin stays in place
 * so existing Options API components keep working — they can migrate
 * one by one to this composable.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import {
  formatDate as libFormatDate,
  formatDisplayDate as libFormatDisplayDate,
  formatDuration as libFormatDuration,
  formatFullDate,
  formatSimpleDate
} from '@/lib/time'

// Pure helpers — re-exported / defined here so callers that don't need
// the reactive parts can import them directly without instantiating the
// composable.

export { libFormatDate as formatDate, formatFullDate, formatSimpleDate }

export const formatPrioritySymbol = priority => {
  const clamped = Math.max(0, Math.min(priority, 3))
  return '!'.repeat(clamped)
}

// Number-typed TextFields emit valueAsNumber, so both sanitizers must
// accept numbers as well as user-typed strings.
export const sanitizeInteger = value => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.trunc(value) : 0
  }
  if (typeof value !== 'string') return 0
  const digits = value.replace(/\D/g, '')
  return digits.length > 0 ? parseInt(digits) || 0 : 0
}

export const sanitizeIntegerLight = value => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.trunc(value) : null
  }
  if (typeof value !== 'string') return null
  const digits = value.replace(/\D/g, '')
  return digits.length > 0 ? parseInt(digits) || null : null
}

export const useFormat = () => {
  const { t } = useI18n()
  const store = useStore()

  const organisation = computed(() => store.getters.organisation)
  const isDurationInHours = computed(
    () => organisation.value.format_duration_in_hours
  )

  const dateFormat = computed(() => store.getters.dateFormat)
  const use12HourClock = computed(() => store.getters.use12HourClock)

  const formatBoolean = value => (value ? t('main.yes') : t('main.no'))

  // unlike the pure export above, this one applies the user preferences,
  // matching the legacy mixin's formatDate
  const formatDate = date =>
    libFormatDate(date, dateFormat.value, use12HourClock.value)

  const formatDisplayDate = date => libFormatDisplayDate(date, dateFormat.value)

  const formatDuration = (minutes, toLocale = true) =>
    libFormatDuration(organisation.value, minutes, toLocale)

  const formatPriority = priority => {
    if (priority === 0) return 'normal'
    if (priority === 1) return t('tasks.priority.high')
    if (priority === 2) return t('tasks.priority.very_high')
    if (priority === 3) return t('tasks.priority.emergency')
    return String(priority)
  }

  return {
    organisation,
    isDurationInHours,
    dateFormat,
    use12HourClock,
    formatBoolean,
    formatDate,
    formatDisplayDate,
    formatFullDate,
    formatSimpleDate,
    formatDuration,
    formatPriority,
    formatPrioritySymbol,
    sanitizeInteger,
    sanitizeIntegerLight
  }
}
