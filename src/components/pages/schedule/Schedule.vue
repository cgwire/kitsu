<template>
<div
  class="schedule-wrapper"
>
  <div
    :class="scheduleClass"
    ref="schedule"
  >
    <div
      ref="entity-list"
      class="entities"
      @mousedown="startBrowsingY"
    >
      <div
        class="has-text-right total-man-days"
      >
        <span class="mr1">{{ totalManDays }}</span>
        <span>{{ $t('schedule.md') }}</span>
      </div>
      <div
        class="entity-line entity-name"
        :key="'entity-' + rootElement.id"
        :style="entityLineStyle(rootElement)"
        v-for="rootElement in hierarchy"
      >
        <span class="filler">
        {{ rootElement.name }}
        </span>
        <input
          type="number"
          placeholder="0"
          min="0"
          @input="$emit('item-changed', rootElement)"
          v-model="rootElement.man_days"
        />
        <span class="man-days-unit">
          {{ $t('schedule.md') }}
        </span>
      </div>
    </div>

    <div class="timeline">
      <div
        ref="timeline-header"
        class="timeline-header"
        @mousedown="startBrowsingX"
      >
        <div
          class="day"
          :key="'header-' + day.toISOString()"
          :style="dayStyle(day)"
          v-for="(day, index) in daysAvailable"
        >
          <span
            class="month-name"
            v-if="day.newMonth || index === 0"
          >
            {{ day.format('MMMM') }}
          </span>
          <div
            :class="dayClass(day, index)"
          >
            <span
              v-if="!day.weekend && zoomLevel > 2"
            >
              {{ day.format('ddd')[0] }} /
            </span>
            <span
              class="day-number"
              v-if="!day.weekend"
            >
              {{ day.format('DD') }}
            </span>
          </div>
        </div>
      </div>

      <div
        ref="timeline-content-wrapper"
        class="timeline-content-wrapper"
      >
        <div
          ref="timeline-content"
          class="timeline-content"
          @mousedown="startBrowsing"
          @mousewheel="$emit('change-zoom', $event)"
        >
          <div
            ref="timeline-position"
            class="timeline-position"
            :style="timelinePositionStyle"
          >
          </div>
          <div
            class="entity-line"
            :key="'entity-line-' + rootElement.id"
            :style="entityLineStyle(rootElement)"
            v-for="rootElement in hierarchy"
          >
            <div
              class="timebar"
              :style="timebarStyle(rootElement)"
            >
              <div
                :class="{
                  'timebar-left-hand': isCurrentUserAdmin
                }"
                @mousedown="moveTimebarLeftSide(rootElement, $event)"
              >
              </div>
              <div
                class="filler"
                @mousedown="moveTimebar(rootElement, $event)"
              >
              </div>
              <div
                :class="{
                  'timebar-right-hand': isCurrentUserAdmin
                }"
                @mousedown="moveTimebarRightSide(rootElement, $event)"
              >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <spinner
    class="mt1"
    v-if="true"
  />
</div>
</template>

<script>
/*
 * Component to facilitate the build of schedule pages.
 */
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'

import Spinner from '../../widgets/Spinner'

export default {
  name: 'schedule',
  components: {
    Spinner
  },

  data () {
    return {
      isBrowsingX: false,
      isBrowsingY: false,
      isChangeSize: false,
      timelineDisplayedDaysIndex: {}
    }
  },

  props: {
    endDate: {
      type: Object,
      required: true
    },
    hierarchy: {
      default: () => [],
      type: Array
    },
    startDate: {
      type: Object,
      required: true
    },
    zoomLevel: {
      type: Number,
      default: 2
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: true
    }
  },

  mounted () {
    this.resetScheduleSize()
    document.addEventListener('mouseup', this.stopBrowsing)
    document.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('resize', this.resetScheduleSize)
  },

  destroyed () {
    document.removeEventListener('mouseup', this.stopBrowsing)
    document.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('resize', this.resetScheduleSize)
    document.body.style.cursor = 'default'
  },

  computed: {
    ...mapGetters([
      'isCurrentUserAdmin'
    ]),

    cellWidth () {
      return this.zoomLevel * 20
    },

    daysAvailable () {
      const days = []
      let day = this.startDate.add(-1, 'days')
      let dayDate = day.toDate()
      let endDayDate = this.endDate.toDate()
      dayDate.isoweekday = day.isoWeekday()
      dayDate.monthday = day.month()

      while (dayDate < endDayDate) {
        let nextDay = new Date(Number(dayDate))
        nextDay.setDate(dayDate.getDate() + 1) // Add 1 day

        nextDay.isoweekday = dayDate.isoweekday + 1
        if (nextDay.isoweekday > 7) {
          nextDay.isoweekday = 1
          nextDay.newWeek = true
        }
        nextDay.monthday = dayDate.monthday + 1
        if (nextDay.monthday > 27 &&
            nextDay.getMonth() !== dayDate.getMonth()) {
          nextDay.newMonth = true
          nextDay.monthday = 1
        }
        if ([6, 7].includes(nextDay.isoweekday)) nextDay.weekend = true

        let momentDay = moment(nextDay)
        momentDay.newWeek = nextDay.newWeek
        momentDay.newMonth = nextDay.newMonth
        momentDay.weekend = nextDay.weekend
        days.push(momentDay)
        dayDate = nextDay
      }
      return days
    },

    displayedDays () {
      return this.daysAvailable.filter(day => !day.weekend)
    },

    nbDisplayedDays () {
      return this.displayedDays.length
    },

    displayedDaysIndex () {
      let index = 0
      const dayIndex = {}
      this.displayedDays.forEach((d) => {
        dayIndex[d.format('YYYY-MM-DD')] = index
        index++
      })
      return dayIndex
    },

    scheduleClass () {
      const className = {
        schedule: true,
        unselectable: true
      }
      className['zoom-level-' + this.zoomLevel] = true
      return className
    },

    timelinePositionStyle () {
      return { width: this.cellWidth + 'px' }
    },

    totalManDays () {
      return this.hierarchy.reduce((acc, timeElement) => {
        let value = acc
        if (timeElement.man_days) value = acc + timeElement.man_days
        return value
      }, 0)
    },

    // References

    entityList () {
      return this.$refs['entity-list']
    },

    schedule () {
      return this.$refs['schedule']
    },

    timelineContent () {
      return this.$refs['timeline-content']
    },

    timelineContentWrapper () {
      return this.$refs['timeline-content-wrapper']
    },

    timelineHeader () {
      return this.$refs['timeline-header']
    },

    timelinePosition () {
      return this.$refs['timeline-position']
    }
  },

  methods: {
    ...mapActions([
    ]),

    resetScheduleSize () {
      this.timelineContent.style.width =
        this.nbDisplayedDays * this.cellWidth + 'px'
      this.timelineContentWrapper.style.height =
        this.schedule.offsetHeight - 118 + 'px'
      this.entityList.style.height =
        this.schedule.offsetHeight - 118 + 'px'
    },

    onMouseMove (event) {
      if (this.isChangeStartDate) {
        this.changeStartDate(event)
      } else if (this.isChangeEndDate) {
        this.changeEndDate(event)
      } else if (this.isChangeDates) {
        this.changeDates(event)
      } else {
        if (this.isBrowsingX) this.scrollScheduleLeft(event)
        if (this.isBrowsingY) this.scrollScheduleTop(event)
      }

      this.updatePositionBarPosition(event)
    },

    updatePositionBarPosition (event) {
      let position = this.timelineContentWrapper.scrollLeft + event.clientX
      position -= 262
      position = Math.round(position / this.cellWidth) * this.cellWidth
      this.timelinePosition.style.left = position + 'px'
    },

    changeDates (event) {
      const change = event.clientX - this.initialClientX - this.cellWidth / 2
      const dayChange = Math.ceil(change / this.cellWidth)

      const startDateString = this.lastStartDate.format('YYYY-MM-DD')
      const endDateString = this.lastEndDate.format('YYYY-MM-DD')
      const startDateIndex = this.displayedDaysIndex[startDateString]
      const endDateIndex = this.displayedDaysIndex[endDateString]
      const length = endDateIndex - startDateIndex
      let currentIndex = this.displayedDaysIndex[startDateString]

      currentIndex += dayChange
      if (currentIndex < 0) currentIndex = 0

      let newStartDate = this.displayedDays[currentIndex]
      if (newStartDate) {
        let newEndDate = this.displayedDays[currentIndex + length]
        if (newEndDate) {
          this.currentElement.startDate = newStartDate
          this.currentElement.endDate = newEndDate
          this.$emit('item-changed', this.currentElement)
        }
      }
    },

    changeStartDate (event) {
      const change = event.clientX - this.initialClientX
      const dayChange = Math.floor(change / this.cellWidth)

      const startDateString = this.lastStartDate.format('YYYY-MM-DD')
      let currentIndex = this.displayedDaysIndex[startDateString]
      currentIndex += dayChange

      let newStartDate = this.displayedDays[currentIndex]
      this.currentElement.startDate = newStartDate
      this.$emit('item-changed', this.currentElement)
    },

    changeEndDate (event) {
      const change = event.clientX - this.initialClientX + this.cellWidth / 2
      const dayChange = Math.ceil(change / this.cellWidth)

      const startDateString =
        this.currentElement.startDate.format('YYYY-MM-DD')
      const endDateString = this.lastEndDate.format('YYYY-MM-DD')
      let startDateIndex = this.displayedDaysIndex[startDateString]
      let currentIndex = this.displayedDaysIndex[endDateString]

      currentIndex += dayChange - 1
      if (currentIndex < startDateIndex) currentIndex = startDateIndex + 1
      if (currentIndex > this.displayedDaysIndex.length) {
        currentIndex = this.displayedDaysIndex.length - 1
      }

      let newEndDate = this.displayedDays[currentIndex]
      this.currentElement.endDate = newEndDate
      this.$emit('item-changed', this.currentElement)
    },

    scrollScheduleLeft (event) {
      const previousLeft = this.timelineContentWrapper.scrollLeft
      let newLeft = previousLeft - event.movementX
      this.timelineContentWrapper.scrollLeft = newLeft
      this.timelineHeader.scrollLeft = newLeft
    },

    scrollScheduleTop (event) {
      const previousTop = this.timelineContentWrapper.scrollTop
      let newTop = previousTop - event.movementY
      this.timelineContentWrapper.scrollTop = newTop
      this.entityList.scrollTop = newTop
    },

    startBrowsing (event) {
      if (
        !this.isChangeStartDate &&
        !this.isChangeEndDate &&
        !this.isChangeDates
      ) {
        document.body.style.cursor = 'grabbing'
        this.isBrowsingX = true
        this.isBrowsingY = true
      }
    },

    startBrowsingX (event) {
      document.body.style.cursor = 'grabbing'
      this.isBrowsingX = true
    },

    startBrowsingY (event) {
      document.body.style.cursor = 'grabbing'
      this.isBrowsingY = true
    },

    stopBrowsing (event) {
      document.body.style.cursor = 'default'
      this.isChangeStartDate = false
      this.isChangeEndDate = false
      this.isChangeDates = false
      this.isBrowsingX = false
      this.isBrowsingY = false
    },

    moveTimebar (timeElement, event) {
      if (!this.isChangeStartDate && this.isCurrentUserAdmin) {
        this.isChangeDates = true
        this.isChangeStartDate = false
        this.isChangeEnd = false
        this.currentElement = timeElement
        this.lastStartDate = timeElement.startDate.clone()
        this.lastEndDate = timeElement.endDate.clone()
        this.initialClientX = event.clientX
        document.body.style.cursor = 'ew-resize'
      }
    },

    moveTimebarLeftSide (timeElement, event) {
      if (!this.isChangeDates && this.isCurrentUserAdmin) {
        this.isChangeDates = false
        this.isChangeStartDate = true
        this.isChangeEnd = false
        this.currentElement = timeElement
        this.lastStartDate = timeElement.startDate.clone()
        this.initialClientX = event.clientX
        document.body.style.cursor = 'w-resize'
      }
    },

    moveTimebarRightSide (timeElement, event) {
      if (!this.isChangeDates && this.isCurrentUserAdmin) {
        this.isChangeDates = false
        this.isChangeStartDate = false
        this.isChangeEndDate = true
        this.currentElement = timeElement
        this.lastEndDate = timeElement.endDate.clone()
        this.initialClientX = event.clientX
        document.body.style.cursor = 'e-resize'
      }
    },

    // Helpers

    businessDiff (startDate, endDate) {
      const first = startDate.clone().endOf('week')
      const last = endDate.clone().startOf('week')
      const diff = last.diff(first, 'days')

      if (endDate.diff(startDate, 'days') > 6) {
        const days = diff * 5 / 7

        let wfirst = first.day() - startDate.day()
        if (startDate.day() === 0) --wfirst

        let wlast = endDate.day() - last.day()
        if (endDate.day() === 6) --wlast

        return wfirst + days + wlast - 1
      } else {
        let day = moment(startDate)
        let businessDays = 0
        while (day.isBefore(endDate, 'day')) {
          if (day.day() !== 0 && day.day() !== 6) businessDays++
          day.add(1, 'days')
        }
        return businessDays
      }
    },

    // Styles

    dayClass (day, index = 0) {
      return {
        'day-name': true,
        'new-week': day.newWeek || false,
        'new-month': day.newMonth || index === 0 || false
      }
    },

    dayStyle (day) {
      return {
        'min-width': day.weekend ? '0px' : this.cellWidth + 'px',
        'max-width': day.weekend ? '0px' : this.cellWidth + 'px'
      }
    },

    entityLineStyle (timeElement) {
      return {
        'background-color': timeElement.color
      }
    },

    timebarStyle (timeElement) {
      return {
        left: this.getTimebarLeft(timeElement) + 'px',
        width: this.getTimebarWidth(timeElement) + 'px',
        cursor: this.isCurrentUserAdmin ? 'ew-resize' : 'default'
      }
    },

    getTimebarLeft (timeElement) {
      const startDate = timeElement.startDate || this.startDate
      let startDiff = this.businessDiff(this.startDate, startDate) || 0
      return ((startDiff) * this.cellWidth) + 5
    },

    getTimebarWidth (timeElement) {
      const startDate =
        timeElement.startDate || this.startDate
      const endDate =
        timeElement.endDate ||
        (
          timeElement.startDate &&
          timeElement.startDate.clone().add(1, 'days')
        ) ||
        this.startDate.clone().add(1, 'days')
      let lengthDiff = this.businessDiff(startDate, endDate) || 1
      return (lengthDiff + 1) * this.cellWidth - 10
    }
  },

  socket: {
  },

  watch: {
    startDate () {
      this.resetScheduleSize()
    },
    endDate () {
      this.resetScheduleSize()
    },
    zoomLevel () {
      this.resetScheduleSize()
    },
    isLoading () {
      this.$nextTick(this.resetScheduleSize)
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .entities {
    background: #36393F;
  }

  .schedule.zoom-level-1 {
    .timeline-content {
      background-image: url('../../../assets/background/schedule-dark-1.png');
    }
  }

  .schedule.zoom-level-2 {
    .timeline-content {
      background-image: url('../../../assets/background/schedule-dark-2.png');
    }
  }

  .schedule.zoom-level-3 {
    .timeline-content {
      background-image: url('../../../assets/background/schedule-dark-3.png');
    }
  }
  .timeline {
    .timeline-header {
      background: #36393F;
      color: white;

      .day {
        .day-number {
          color: white;
        }

        .day-name {
          margin: 0;
          padding-bottom: 0;
          &.new-month,
          &.new-week {
            border-left: 2px solid white;
          }
        }

        .month-name {
          border-left: 2px solid white;
          color: white;
        }
      }
    }
  }
}

.schedule-wrapper {
  position: relative;
}

.schedule {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  height: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}

.entities {
  background: white;
  margin-top: 35px;
  min-width: 230px;
  overflow: hidden;
  z-index: 2;

  .entity-line {
    max-width: 230px;
    min-width: 230px;
  }
}

.entity-line {
  color: white;
  font-size: 1.2em;
  height: 40px;
  margin-bottom: 20px;
  padding: 0.5em 1em;
}

.timeline {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 0px;
  padding-left: 2px;

  .timeline-header {
    white-space: nowrap;
    position: relative;
    margin-left: 1px;
    background: white;
    padding-bottom: 14px;
    overflow: hidden;
    padding-top: 40px;

    .day {
      display: inline-block;
      font-size: 0.8em;
      padding-bottom: 0;

      .day-name {
        border-left: 2px solid transparent;
        color: $grey;
        padding-bottom: 0em;
        padding-left: 10px;
        padding-top: 0em;
        text-transform: uppercase;

        &.new-month,
        &.new-week {
          border-left: 2px solid black;
        }
      }

      .day-number {
        color: black;
        padding-top: 0.5em;
      }

      .month-name {
        border-left: 2px solid black;
        font-size: 0.9em;
        position: absolute;
        padding-bottom: 12px;
        padding-left: 1em;
        top: 15px;
        bottom: 0;
        text-transform: uppercase;
        color: black;
      }
    }
  }

  .timeline-content-wrapper {
    background-repeat: repeat;
    margin-left: 2px;
    overflow-x: hidden;
    overflow-y: hidden;

    .timeline-content {
      height: 100%;
      position: relative;

      .timeline-position {
        visibility: hidden;
        position: absolute;
        left: 0px;
        top: 0;
        bottom: 0;
        background: rgba(200, 255, 200, 0.3);
        z-index: 100;
      }

      .entity-line {
        width: 100%;
        position: relative;

        .timebar {
          position: absolute;
          top: 13px;
          height: 14px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 1em;
          display: flex;
          z-index: 101;

          .timebar-left-hand {
            cursor: w-resize;
            width: 30px;
          }

          .timebar-right-hand {
            cursor: e-resize;
            width: 30px;
          }
        }
      }
    }

    .timeline-content:hover {
      .timeline-position {
        visibility: visible;
      }
    }
  }
}

.zoom-level-1 {
  .timeline-content {
    background-image: url('../../../assets/background/schedule-white-1.png');
  }

  .timeline {
    .timeline-header {
      .day {
        font-size: 0.8em;
        padding-left: 0px;

        .day-name {
          padding-left: 0px;
          &.new-week {
            border-left: solid 2px transparent;
          }
          &.new-month {
            padding-left: 4px;
            border-left: solid 2px white;
          }
        }
      }
    }
  }
}

.schedule.zoom-level-2 {
  .timeline-content {
    background-image: url('../../../assets/background/schedule-white-2.png');
  }
}

.schedule.zoom-level-3 {
  .timeline-content {
    background-image: url('../../../assets/background/schedule-white-3.png');
  }
}

.entity-name {
  display: flex;
  align-items: center;

  span {
    color: white;
  }

  input {
    width: 50px;
    text-align: right;
    background: transparent;
    color: white;
    margin-right: 0.2em;
    font-size: 1.1em;

    &::placeholder {
      color: white;
    }
  }

  .man-days-unit {
    font-size: 0.7em;
  }
}

.total-man-days {
  color: white;
  padding-bottom: 10px;
  margin-right: 1em;

  .mr1 {
    font-size: 20px;
  }
}
</style>
