/*
 * Set of functions to facilitate usage of a date and timezones.
 */
import { computed } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment-timezone'

import { formatFullDateWithTimezone } from '@/lib/time'

export function useTime() {
  const store = useStore()

  const timezone = computed(
    () => store.getters.user?.timezone || moment.tz.guess()
  )

  const today = computed(() => moment().toDate())

  function formatDate(eventDate) {
    return formatFullDateWithTimezone(eventDate, timezone.value)
  }

  return { timezone, today, formatDate }
}
