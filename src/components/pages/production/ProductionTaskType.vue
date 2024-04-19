<template>
  <tr class="datatable-row" :key="taskType.id">
    <task-type-cell :task-type="taskType" />
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

<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'

import TaskTypeCell from '@/components/cells/TaskTypeCell'

import { parseDate } from '@/lib/time'

export default {
  name: 'production-task-type',

  components: {
    TaskTypeCell
  },

  props: {
    taskType: {
      required: true,
      type: Object
    },
    scheduleItem: {
      required: true,
      type: Object
    }
  },

  data() {
    return {
      startDate: null,
      endDate: null,
      silent: true
    }
  },

  computed: {
    ...mapGetters(['currentProduction', 'getTaskTypePriority']),

    productionTimeRange() {
      const dates = {
        to: parseDate(this.currentProduction.start_date).toDate(),
        from: parseDate(this.currentProduction.end_date).toDate()
      }
      return dates
    },

    endDateTimeRange() {
      const dates = {
        to: this.startDate,
        from: parseDate(this.currentProduction.end_date).toDate()
      }
      return dates
    }
  },

  mounted() {
    this.startDate = parseDate(this.scheduleItem.start_date).toDate()
    this.endDate = parseDate(this.scheduleItem.end_date).toDate()
    this.$nextTick(() => {
      this.silent = false
    })
  },

  methods: {
    ...mapActions([])
  },

  watch: {
    startDate() {
      if (this.silent) return
      const startDate = moment(this.startDate)
      let endDate = moment(this.endDate)
      this.silent = true
      if (endDate.isBefore(startDate)) {
        endDate = startDate.clone().add(1, 'days')
        this.endDate = endDate.toDate()
      }
      const data = { ...this.scheduleItem }
      data.startDate = startDate
      data.endDate = endDate
      this.$emit('date-changed', data)
      this.$nextTick(() => {
        this.silent = false
      })
    },

    endDate() {
      if (this.silent) return
      let startDate = moment(this.startDate)
      const endDate = moment(this.endDate)
      this.silent = true
      if (endDate.isBefore(startDate)) {
        startDate = endDate.clone().add(-1, 'days')
        this.startDate = startDate.toDate()
      }
      const data = { ...this.scheduleItem }
      data.startDate = startDate
      data.endDate = endDate
      this.$emit('date-changed', data)
      this.$nextTick(() => {
        this.silent = false
      })
    },

    scheduleItem() {
      this.silent = true
      this.startDate = parseDate(this.scheduleItem.start_date).toDate()
      this.endDate = parseDate(this.scheduleItem.end_date).toDate()
      this.$nextTick(() => {
        this.silent = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.field {
  margin-bottom: 0;
  width: 105px;
}
.priority {
  padding-left: 2rem;
}
</style>
