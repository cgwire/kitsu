<template>
<div
  class="schedule unselectable"
  ref="schedule"
>
  <div
    ref="entity-list"
    class="entities"
    @mousedown="startBrowsingY"
  >
    <div
      class="entity-line"
      :key="'entity-' + rootElement.id"
      :style="entityLineStyle(rootElement)"
      v-for="rootElement in hierarchy"
    >
      {{ rootElement.name }}
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
        v-for="day in daysAvailable"
      >
        <span
          class="month-name"
          v-if="day.newMonth"
        >
          {{ day.format('MMMM') }}
        </span>
        <span
          :class="dayClass(day)"
          v-if="!day.weekend"
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

    <div
      ref="timeline-content-wrapper"
      class="timeline-content-wrapper"
    >
      <div
        ref="timeline-content"
        class="timeline-content"
        @mousedown="startBrowsing"
      >
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
              class="timebar-left-hand"
              @mousedown="moveTimebarLeftSide(rootElement, $event)"
            >
            </div>
            <div
              class="filler"
              @mousedown="moveTimebar(rootElement, $event)"
            >
            </div>
            <div
              class="timebar-right-hand"
              @mousedown="moveTimebarRightSide(rootElement, $event)"
            >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
/*
 * Component to facilitate the build of schedule pages.
 */
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'

const CELL_WIDTH = 60

export default {
  name: 'schedule',
  components: {},

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
    ]),

    daysAvailable () {
      const days = []
      let day = moment(this.startDate).add(-1, 'days')
      while (day.isBefore(this.endDate)) {
        const nextDay = moment(day).add(1, 'days')
        if (nextDay.isoWeek() !== day.isoWeek()) nextDay.newWeek = true
        if (nextDay.month() !== day.month()) nextDay.newMonth = true
        if ([6, 7].includes(nextDay.isoWeekday())) nextDay.weekend = true
        days.push(nextDay)
        day = nextDay
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
    }
  },

  methods: {
    ...mapActions([
    ]),

    resetScheduleSize () {
      this.timelineContent.style.width =
        this.nbDisplayedDays * CELL_WIDTH + 'px'
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
    },

    changeDates (event) {
      console.log('a')
      const change = event.clientX - this.initialClientX - 30
      const dayChange = Math.ceil(change / CELL_WIDTH)

      const startDateString = this.lastStartDate.format('YYYY-MM-DD')
      // const length = this.lastEndDate.diff(this.lastStartDate, 'days')
      let currentIndex = this.displayedDaysIndex[startDateString]

      currentIndex += dayChange - 1
      if (currentIndex < 0) currentIndex = 0

      let newStartDate = this.displayedDays[currentIndex]
      if (newStartDate) {
        /*
        let newEndDate = newStartDate.clone().add(length, 'days')
        if (newEndDate.day() === 6) newEndDate.add(-1, 'days')
        if (newEndDate.day() === 7) newEndDate.add(1, 'days')
        let newEndDateString = newEndDate.format('YYYY-MM-DD')
        let newEndDateIndex = this.displayedDaysIndex[newEndDateString]
        if (!newEndDateIndex) {
          const index = this.displayedDaysIndex.length - 1 - length
          newStartDate = this.displayedDaysIndex[index]
          if (!newStartDate) return
          newEndDate = newStartDate.clone().add(length, 'days')
        }
        */

        this.currentElement.startDate = newStartDate
        // this.currentElement.endDate = newEndDate
      }
    },

    changeStartDate (event) {
      const change = event.clientX - this.initialClientX
      const dayChange = Math.floor(change / CELL_WIDTH)
      console.log('dayChange', dayChange)

      const startDateString = this.lastStartDate.format('YYYY-MM-DD')
      const endDateString = this.currentElement.endDate.format('YYYY-MM-DD')
      let currentIndex = this.displayedDaysIndex[startDateString]
      let endDateIndex = this.displayedDaysIndex[endDateString]
      console.log(startDateString, endDateString, currentIndex, endDateIndex)

      currentIndex += dayChange
      // if (currentIndex >= endDateIndex) currentIndex = endDateIndex - 1
      // if (currentIndex < 0) currentIndex = 0

      let newStartDate = this.displayedDays[currentIndex]
      console.log(currentIndex, newStartDate.format('YYYY-MM-DD'))
      this.currentElement.startDate = newStartDate
    },

    changeEndDate (event) {
      console.log('c')
      const change = event.clientX - this.initialClientX + 30
      const dayChange = Math.ceil(change / CELL_WIDTH)

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
      console.log('moveTimebar')
      if (!this.isChangeStartDate) {
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
      console.log('moveTimebarLeftStide')
      if (!this.isChangeDates) {
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
      this.isChangeDates = false
      this.isChangeStartDate = false
      this.isChangeEnd = true
      this.currentElement = timeElement
      this.lastEndDate = timeElement.endDate.clone()
      this.initialClientX = event.clientX
      document.body.style.cursor = 'e-resize'
    },

    // Helpers

    businessDiff (startDate, endDate) {
      let days = endDate.diff(startDate, 'days')
      days = days - (Math.floor(days / 7) * 2)
      if (endDate.day() === 6) days--
      if (startDate.day() === 7) days--
      return days
    },

    // Styles

    dayClass (day) {
      return {
        'day-name': true,
        'new-week': day.newWeek || false,
        'new-month': day.newMonth || false
      }
    },

    dayStyle (day) {
      return {
        'min-width': day.weekend ? '0px' : '60px',
        'max-width': day.weekend ? '0px' : '60px'
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
        width: this.getTimebarWidth(timeElement) + 'px'
      }
    },

    getTimebarLeft (timeElement) {
      const startDate = timeElement.startDate || this.startDate
      let startDiff = this.businessDiff(this.startDate, startDate) || 0
      console.log('getTimebarLeft', this.startDate.format('YYYY-MM-DD'), startDate.diff(this.startDate, 'days'))
      console.log('getTimebarLeft', startDiff, startDate.format('YYYY-MM-DD'))
      return ((startDiff) * CELL_WIDTH) + CELL_WIDTH / 2
    },

    getTimebarWidth (timeElement) {
      const startDate =
        timeElement.startDate || this.startDate
      const endDate =
        timeElement.endDate || timeElement.startDate || this.startDate
      let lengthDiff = this.businessDiff(startDate, endDate) || 1
      return lengthDiff * CELL_WIDTH
    }
  },

  socket: {
  },

  watch: {
  }
}

</script>

<style lang="scss" scoped>
.dark {
  .entities {
    background: #36393F;
  }

  .timeline {
    .timeline-content-wrapper {
      .timeline-content {
        background-image: url('../../../assets/background/schedule-dark.png');
      }
    }

    .timeline-header {
      background: #36393F;

      .day {
        .day-number {
          color: white;
        }

        .day-name {
          &.new-month,
          &.new-week {
            border-left: 2px solid white;
          }
        }
      }
    }
  }
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
  margin-top: 75px;
  min-width: 200px;
  overflow: hidden;
  z-index: 150;

  .entity-line {
    max-width: 200px;
    min-width: 200px;
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

      .day-name {
        border-left: 2px solid transparent;
        color: $grey;
        padding-left: 15px;
        padding-bottom: 0.5em;
        padding-top: 0.5em;
        text-transform: uppercase;

        &.new-month,
        &.new-week {
          border-left: 2px solid black;
        }
      }

      .day-number {
        color: black;
      }

      .month-name {
        border-left: 2px solid black;
        font-size: 0.9em;
        position: absolute;

        padding-bottom: 12px;
        padding-left: 1em;
        top: 15px;
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
      background-image: url('../../../assets/background/schedule-white.png');

      .entity-line {
        width: 100%;
        position: relative;

        .timebar {
          position: absolute;
          top: 13px;
          height: 14px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 1em;
          cursor: ew-resize;
          display: flex;

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
  }
}
</style>
