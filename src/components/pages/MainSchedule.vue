<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="flexrow project-dates">
        <div class="flexrow-item">
          <label class="label">
            {{ $t('main.start_date') }}
          </label>
          <date-field week-days-disabled v-model="selectedStartDate" />
        </div>
        <div class="flexrow-item field">
          <label class="label">
            {{ $t('main.end_date') }}
          </label>
          <date-field week-days-disabled v-model="selectedEndDate" />
        </div>
        <combobox-number
          class="flexrow-item zoom-level"
          :label="$t('schedule.zoom_level')"
          :options="zoomOptions"
          v-model="zoomLevel"
        />
      </div>

      <schedule
        :end-date="endDate"
        :hierarchy="scheduleItems"
        :is-loading="loading.schedule"
        :is-error="errors.schedule"
        :start-date="startDate"
        :zoom-level="zoomLevel"
        :hide-man-days="true"
        :with-milestones="false"
        @item-changed="onScheduleItemChanged"
        @root-element-expanded="expandProductionElement"
      />
    </div>
  </div>
</template>

<script>
/*
 * Page to manage the schedule of the big steps of the production. It allows
 * to set milestones too.
 */
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import { getProductionSchedulePath } from '@/lib/path'

import {
  getFirstStartDate,
  getLastEndDate,
  getStartDateFromString,
  getEndDateFromString
} from '@/lib/time'
import colors from '@/lib/colors'

import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import DateField from '@/components/widgets/DateField.vue'
import Schedule from '@/components/widgets/Schedule.vue'

export default {
  name: 'main-schedule',

  components: {
    ComboboxNumber,
    DateField,
    Schedule
  },

  data() {
    return {
      endDate: moment().add(6, 'months'),
      scheduleItems: [],
      startDate: moment(),
      selectedStartDate: null,
      selectedEndDate: null,
      zoomLevel: 0,
      zoomOptions: [
        { label: 'Week', value: 0 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 }
      ],
      loading: {
        schedule: false
      },
      errors: {
        schedule: false
      }
    }
  },

  mounted() {
    let zoom = parseInt(this.$route.query.zoom)
    zoom = isNaN(zoom) ? 1 : zoom
    this.zoomLevel = Math.min(Math.max(zoom, 0), 3)

    this.init()
  },

  computed: {
    ...mapGetters(['openProductions', 'taskTypeMap', 'user'])
  },

  methods: {
    ...mapActions(['editProduction', 'loadScheduleItems', 'saveScheduleItem']),

    init() {
      if (!this.openProductions.length) {
        return
      }
      this.scheduleItems = this.convertScheduleItems(this.openProductions)
      this.startDate = getFirstStartDate(this.scheduleItems)
      this.endDate = getLastEndDate(this.scheduleItems)
      this.selectedStartDate = this.startDate.toDate()
      this.selectedEndDate = this.endDate.toDate()
    },

    convertScheduleItems(scheduleItems) {
      return scheduleItems.map(item => {
        const startDate = getStartDateFromString(item.start_date)
        const endDate = getEndDateFromString(startDate, item.end_date)
        return {
          ...item,
          avatar: item.type === 'Project',
          color: item.color || colors.fromString(item.name, true),
          startDate: startDate,
          endDate: endDate,
          expanded: false,
          loading: false,
          editable: true,
          route: getProductionSchedulePath(item.id),
          children: []
        }
      })
    },

    convertTaskTypeScheduleItems(scheduleItems) {
      return scheduleItems.map(item => {
        const startDate = getStartDateFromString(item.start_date)
        const endDate = getEndDateFromString(startDate, item.end_date)
        const taskType = this.taskTypeMap.get(item.task_type_id)

        return {
          ...item,
          name: taskType.name,
          color: taskType.color,
          startDate: startDate,
          endDate: endDate,
          expanded: false,
          loading: false,
          editable: true,
          children: []
        }
      })
    },

    expandProductionElement(productionElement) {
      if (!productionElement.expanded) {
        productionElement.loading = true
        productionElement.expanded = true
        this.loadScheduleItems(productionElement).then(scheduleItems => {
          scheduleItems = this.convertTaskTypeScheduleItems(scheduleItems)
          productionElement.children = scheduleItems
          productionElement.loading = false
        })
      } else {
        productionElement.expanded = false
      }
    },

    onScheduleItemChanged(item) {
      if (item.type !== 'Project') {
        this.saveScheduleItem(item)
      } else {
        this.editProduction({
          id: item.id,
          start_date: item.startDate.format('YYYY-MM-DD'),
          end_date: item.endDate.format('YYYY-MM-DD')
        })
      }
    },

    updateRoute({ zoom }) {
      const query = { ...this.$route.query }

      if (zoom !== undefined) {
        query.zoom = String(zoom)
      }

      if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
        this.$router.push({ query })
      }
    }
  },

  watch: {
    zoomLevel(value) {
      this.updateRoute({ zoom: value })
    }
  },

  head() {
    return {
      title: `${this.$t('schedule.title_main')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .project-dates {
    color: $white-grey;
    border-bottom: 1px solid $grey;
  }
}

.project-dates {
  border-bottom: 1px solid #eee;
  padding-bottom: 1em;

  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .overall-man-days {
    width: 120px;
    font-size: 0.9em;
    margin-right: 1em;
  }
}

.fixed-page {
  padding: 1em;
  padding-top: 90px;
  padding-left: 2em;
}

.main-column {
  display: flex;
  border: 0;
  overflow: hidden;
  flex-direction: column;
}

.zoom-level {
  margin-top: -10px;
}
</style>
