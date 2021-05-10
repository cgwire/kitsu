/*
 * Set of functions to facilitate usage of a date and timezones.
 */
import moment from 'moment-timezone'

import { formatFullDateWithTimezone } from '@/lib/time'

export const timeMixin = {

  created () {
  },

  mounted () {
  },

  beforeDestroy () {
  },

  computed: {
    timezone () {
      return this.user.timezone || moment.tz.guess()
    },

    today () {
      return moment().toDate()
    }
  },

  methods: {
    formatDate (eventDate) {
      return formatFullDateWithTimezone(eventDate, this.timezone)
    }
  }
}
