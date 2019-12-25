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
        class="has-text-right total-man-days mr0"
      >
        <span class="total-value">
          {{ totalManDays }} {{ $t('schedule.md') }}
        </span>
      </div>

      <div
        class="entity-name-list"
      >
      <div
        :key="'entity-' + rootElement.id"
        v-for="rootElement in hierarchy"
      >
        <div
          :class="{
            'entity-line': true,
            'entity-name': true,
            flexrow: true,
            root: true,
            expanded: rootElement.expanded
          }"
          :style="entityLineStyle(rootElement)"
        >
          <span
            class="expand flexrow-item mr1"
            @click="expandRootElement(rootElement)"
          >
            <chevron-right-icon v-if="!rootElement.expanded"/>
            <chevron-down-icon v-else />
          </span>
          <span
            class="avatar flexrow-item"
            v-if="rootElement.avatar"
          >
            <production-name
              :project="rootElement"
              :only-avatar="true"
              :size="30"
              v-if="rootElement.type === 'Project'"
            />
            <people-avatar
              :person="rootElement"
              :is-link="false"
              :size="30"
              :no-cache="true"
              v-else
            />
          </span>
          <span
            class="filler flexrow-item root-element-name"
            v-if="!rootElement.route"
          >
            {{ rootElement.name }}
          </span>
          <router-link
            class="filler flexrow-item root-element-name"
            :to="rootElement.route"
            v-else
          >
            {{ rootElement.name }}
          </router-link>
          <input
            class="flexrow-item"
            type="number"
            placeholder="0"
            @input="$emit('item-changed', rootElement)"
            v-if="!rootElement.avatar && rootElement.editable"
            v-model="rootElement.man_days"
          />
          <span
            class="man-days-unit flexrow-item"
            v-if="!rootElement.avatar && rootElement.editable"
          >
            {{ $t('schedule.md') }}
          </span>
          <span
            class="man-days-unit flexrow-item"
            v-if="rootElement.avatar || !rootElement.editable"
          >
            {{ rootElement.man_days }}
            {{ $t('schedule.md') }}
          </span>

        </div>
        <div
          class="children"
          :style="childrenStyle(rootElement)"
          v-if="rootElement.expanded"
        >
          <div class="flexrow" v-if="rootElement.loading">
            <spinner
              style="width: 20px; margin: 0 0 10px 10px;"
              class="child-spinner flexrow-item"
            />
          </div>
          <div
            class="child-name"
            :key="'entity-' + childElement.id"
            v-for="(childElement, j) in rootElement.children"
          >
            <div
              class="entity-line entity-name child-line flexrow"
              :style="childNameStyle(rootElement, j)"
            >
              <span class="filler flexrow-item">
                {{ childElement.name }}
              </span>
              <span
                class="man-days-unit flexrow-item"
                v-if="childElement.man_days"
              >
                {{ childElement.man_days }}
                {{ $t('schedule.md') }}
              </span>
            </div>
          </div>
        </div>
        </div>
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
          :key="'header-' + day.text"
          :style="dayStyle(day)"
          v-for="(day, index) in daysAvailable"
        >
          <div
            class="milestone"
            @click="showEditMilestoneModal(day, milestones[day.text])"
            v-if="milestones[day.text]"
          >
            <div
              class="milestone-tooltip flexrow"
              :style="milestoneTooltipStyle"
            >
              <span class="bull flexrow-item">&bull;</span>
              <span class="flexrow-item">
                {{ milestones[day.text].name }}
              </span>
              <span class="filler">
              </span>
              <edit2-icon class="edit-icon flexrow-item" />
            </div>
            <div>
              <span class="bull">&bull;</span>
            </div>
          </div>
          <div
            class="milestone"
            v-else
          >
            <div>
              <span class="bull">&nbsp;</span>
            </div>
          </div>

          <div class="date-widget">
            <div
              class="add-milestone"
              :title="addMilestoneTitle(day)"
              @click="showEditMilestoneModal(day, milestones[day.text])"
            >
              <span>+</span>
            </div>
            <div class="date-name">
              <span
                class="month-name"
                v-if="day.newMonth || index === 0"
              >
                {{ day.monthText }}
              </span>
              <div
                :class="dayClass(day, index)"
              >
                <span
                  v-if="!day.weekend && zoomLevel > 2"
                >
                  {{ day.dayText }} /
                </span>
                <span
                  class="day-number"
                  v-if="!day.weekend"
                >
                  {{ day.dayNumber }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref="timeline-content-wrapper"
        class="timeline-content-wrapper"
        v-scroll="onTimelineScroll"
      >
        <div
          ref="timeline-content"
          class="timeline-content"
          @mousedown="startBrowsing"
          @mousewheel="$emit('change-zoom', $event)"
        >
          <div
            ref="timeline-today-position"
            class="timeline-position today"
            :style="timelineTodayPositionStyle"
          >
          </div>
          <div
            ref="timeline-position"
            class="timeline-position"
            :style="timelinePositionStyle"
          >
          </div>
          <div
            class="milestone-vertical-line"
            :style="milestoneLineStyle(milestone)"
            :key="'milestone-' + milestone.date"
            v-for="milestone in Object.values(milestones)"
          >
          </div>
          <div
            :key="'entity-line-' + rootElement.id"
            v-for="rootElement in hierarchy"
          >

            <div
              class="entity-line"
              :style="entityLineStyle(rootElement)"
            >
              <div
                class="timebar"
                :style="timebarStyle(rootElement)"
              >
                <div
                  :class="{
                    'timebar-left-hand': rootElement.editable
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
                    'timebar-right-hand': rootElement.editable
                  }"
                  @mousedown="moveTimebarRightSide(rootElement, $event)"
                >
                </div>
              </div>
            </div>

            <div
              class="children"
              :style="childrenStyle(rootElement)"
              v-if="rootElement.expanded"
            >
              <div class="flexrow" v-if="rootElement.loading">
                <spinner
                  style="width: 20px; margin: 0 0 10px 10px; opacity: 0"
                  class="child-spinner flexrow-item"
                />
              </div>

              <div
                class="entity-line child-line"
                :key="'entity-line-' + childElement.id"
                v-for="childElement in rootElement.children"
              >
                <div
                  class="timebar"
                  :title="childElement.name + ' (' + childElement.startDate.format('DD-MM') + ' - ' + childElement.endDate.format('DD-MM') + ')'"
                  :style="timebarChildStyle(childElement, rootElement, true)"
                >
                  <div
                    :class="{
                      'timebar-left-hand': childElement.editable
                    }"
                    @mousedown="moveTimebarLeftSide(childElement, $event)"
                  >
                  </div>
                  <div
                    class="filler"
                    @mousedown="moveTimebar(childElement, $event)"
                  >
                  </div>
                  <div
                    :class="{
                      'timebar-right-hand': childElement.editable
                    }"
                    @mousedown="moveTimebarRightSide(childElement, $event)"
                  >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <edit-milestone-modal
    ref="edit-milestone-modal"
    :active="modals.edit"
    :is-loading="loading.edit"
    :is-error="errors.edit"
    :milestone-to-edit="milestoneToEdit"
    @confirm="confirmEditMilestone"
    @cancel="hideEditMilestoneModal"
    @remove-milestone="removeMilestone"
  />

</div>
</template>

<script>
/*
 * Component to facilitate the build of schedule pages.
 */
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'

import colors from '../../../lib/colors'

import { ChevronRightIcon, ChevronDownIcon, Edit2Icon } from 'vue-feather-icons'
import EditMilestoneModal from '../../modals/EditMilestoneModal'
import PeopleAvatar from '../../widgets/PeopleAvatar'
import ProductionName from '../../widgets/ProductionName'
import Spinner from '../../widgets/Spinner'

export default {
  name: 'schedule',
  components: {
    ChevronDownIcon,
    ChevronRightIcon,
    Edit2Icon,
    EditMilestoneModal,
    PeopleAvatar,
    ProductionName,
    Spinner
  },

  data () {
    return {
      currentMilestoneDate: null,
      isBrowsingX: false,
      isBrowsingY: false,
      isChangeSize: false,
      milestoneToEdit: {
        date: moment()
      },
      timelineDisplayedDaysIndex: {},
      errors: {
        edit: false
      },
      modals: {
        edit: false
      },
      loading: {
        edit: false
      }
    }
  },

  props: {
    endDate: {
      type: Object,
      required: true
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: true
    },
    height: {
      type: Number,
      default: 0
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
      'milestones'
    ]),

    cellWidth () {
      return this.zoomLevel * 20
    },

    daysAvailable () {
      const days = []
      let day = this.startDate.clone().add(-1, 'days')
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
        momentDay.text = momentDay.format('YYYY-MM-DD')
        momentDay.monthText = momentDay.format('MMMM')
        momentDay.dayNumber = momentDay.format('DD')
        momentDay.dayText = momentDay.format('ddd')[0]
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
        dayIndex[d.text] = index
        index++
      })
      return dayIndex
    },

    totalManDays () {
      return this.hierarchy.reduce((acc, timeElement) => {
        let value = acc
        let manDays = timeElement.man_days
        if (timeElement.man_days) {
          if (typeof manDays === 'string') manDays = parseInt(manDays)
          value = acc + manDays
        }
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
    },

    // Styles

    scheduleClass () {
      const className = {
        schedule: true,
        unselectable: true
      }
      className[`zoom-level-${this.zoomLevel}`] = true
      return className
    },

    timelinePositionStyle () {
      return { width: `${this.cellWidth}px` }
    },

    timelineTodayPositionStyle () {
      const today = moment()
      return {
        width: `${this.cellWidth}px`,
        left: `${this.getTimebarLeft({ startDate: today }) - 5}px`
      }
    },

    milestoneTooltipStyle () {
      // arbitrary calculus
      return { left: (-40 - 10 * (3 - this.zoomLevel)) + 'px' }
    }
  },

  methods: {
    ...mapActions([
      'deleteMilestone',
      'saveMilestone'
    ]),

    resetScheduleSize () {
      if (this.height) this.schedule.style.height = `${this.height}px`
      if (this.timelineContent) {
        this.timelineContent.style.width =
          this.nbDisplayedDays * this.cellWidth + 'px'
        this.timelineContentWrapper.style.height =
          this.schedule.offsetHeight - 250 + 'px'
        this.entityList.style.height =
          this.schedule.offsetHeight - 169 + 'px'
      }
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
      position -= 320
      position = Math.floor(position / this.cellWidth) * this.cellWidth
      this.timelinePosition.style.left = position + 'px'
    },

    isValidItemDates (startDate, endDate) {
      return (
        startDate &&
        endDate &&
        startDate.isSameOrAfter(this.startDate.clone().add(-1, 'hour')) &&
        endDate.isSameOrBefore(this.endDate) &&
        startDate.isSameOrBefore(endDate) &&
        endDate.isSameOrAfter(startDate)
      )
    },

    getDisplayedDaysIndex (date) {
      if (date.isoWeekday() === 6) {
        date = date.add('days', -1)
      }
      if (date.isoWeekday() === 7) {
        date = date.add('days', -2)
      }
      const dateString = date.format('YYYY-MM-DD')
      return this.displayedDaysIndex[dateString]
    },

    changeDates (event) {
      const change = event.clientX - this.initialClientX - this.cellWidth / 2
      const dayChange = Math.ceil(change / this.cellWidth)

      const startDate = this.lastStartDate
      const endDate = this.lastEndDate
      const startDateIndex = this.getDisplayedDaysIndex(startDate)
      const endDateIndex = this.getDisplayedDaysIndex(endDate)
      const length = endDateIndex - startDateIndex
      let currentIndex = this.getDisplayedDaysIndex(startDate)

      currentIndex += dayChange
      if (currentIndex < 0) currentIndex = 0

      let newStartDate = this.displayedDays[currentIndex]
      if (newStartDate) {
        let newEndDate = this.displayedDays[currentIndex + length]
        if (this.isValidItemDates(newStartDate, newEndDate)) {
          this.currentElement.startDate = newStartDate
          this.currentElement.endDate = newEndDate
          this.$emit('item-changed', this.currentElement)
        }
      }
    },

    changeStartDate (event) {
      const change = event.clientX - this.initialClientX + this.cellWidth / 2
      const dayChange = Math.floor(change / this.cellWidth)

      const startDate = this.lastStartDate
      const endDate = this.currentElement.endDate
      let currentIndex = this.getDisplayedDaysIndex(startDate)
      let endDateIndex = this.getDisplayedDaysIndex(endDate)

      currentIndex += dayChange
      if (currentIndex > endDateIndex) currentIndex = endDateIndex - 1
      if (currentIndex < 0) currentIndex = 0

      let newStartDate = this.displayedDays[currentIndex]
      if (this.isValidItemDates(newStartDate, this.currentElement.endDate)) {
        this.currentElement.startDate = newStartDate
        this.$emit('item-changed', this.currentElement)
      }
    },

    changeEndDate (event) {
      const change = event.clientX - this.initialClientX + this.cellWidth / 2
      const dayChange = Math.ceil(change / this.cellWidth)

      const startDate = this.currentElement.startDate
      const endDate = this.lastEndDate
      let startDateIndex = this.getDisplayedDaysIndex(startDate)
      let currentIndex = this.getDisplayedDaysIndex(endDate)

      currentIndex += dayChange - 1
      if (currentIndex < startDateIndex) currentIndex = startDateIndex + 1
      if (currentIndex > this.displayedDaysIndex.length) {
        currentIndex = this.displayedDaysIndex.length - 1
      }

      let newEndDate = this.displayedDays[currentIndex]
      if (this.isValidItemDates(this.currentElement.startDate, newEndDate)) {
        this.currentElement.endDate = newEndDate
        this.$emit('item-changed', this.currentElement)
      }
    },

    moveTimebar (timeElement, event) {
      if (
        !this.isChangeStartDate &&
        !this.isChangeEndDate &&
        timeElement.editable
      ) {
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
      if (
        !this.isChangeDates &&
        !this.isChangeEndDate &&
        timeElement.editable
      ) {
        this.isChangeDates = false
        this.isChangeStartDate = true
        this.isChangeEndDate = false
        this.currentElement = timeElement
        if (!timeElement.endDate) {
          timeElement.endDate = timeElement.startDate.clone().add('days', 1)
        }
        this.lastStartDate = timeElement.startDate.clone()
        this.lastEndDate = timeElement.endDate.clone()
        this.initialClientX = event.clientX
        document.body.style.cursor = 'w-resize'
      }
    },

    moveTimebarRightSide (timeElement, event) {
      if (
        !this.isChangeDates &&
        !this.isChangeStartDate &&
        timeElement.editable
      ) {
        this.isChangeDates = false
        this.isChangeStartDate = false
        this.isChangeEndDate = true
        this.currentElement = timeElement
        if (!timeElement.endDate) {
          timeElement.endDate = timeElement.startDate.clone().add('days', 1)
        }
        this.lastStartDate = timeElement.startDate.clone()
        this.lastEndDate = timeElement.endDate.clone()
        this.initialClientX = event.clientX
        document.body.style.cursor = 'e-resize'
      }
    },

    onTimelineScroll (event, position) {
      const newTop = position.scrollTop
      this.entityList.scrollTop = newTop
      const newLeft = position.scrollLeft
      this.timelineHeader.scrollLeft = newLeft
    },

    scrollScheduleLeft (event) {
      const previousLeft = this.timelineContentWrapper.scrollLeft
      let newLeft = previousLeft - event.movementX
      this.timelineContentWrapper.scrollLeft = newLeft
      this.timelineHeader.scrollLeft = newLeft
    },

    scrollScheduleTop (event) {
      const previousTop = this.timelineContentWrapper.scrollTop
      const newTop = previousTop - event.movementY
      this.timelineContentWrapper.scrollTop = newTop
      this.entityList.scrollTop = newTop
    },

    scrollToToday () {
      setTimeout(() => {
        const today = moment()
        if (today.isAfter(this.startDate) && today.isBefore(this.endDate)) {
          const todayPosition = this.getTimebarLeft({ startDate: today }) - 5
          const newLeft =
            todayPosition - (this.schedule.offsetWidth / 2 - 300)
          this.timelineContentWrapper.scrollLeft = newLeft
          this.timelineHeader.scrollLeft = newLeft
        }
      }, 10)
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

    // Helpers

    businessDiff (startDate, endDate) {
      const first = startDate.clone().endOf('isoweek')
      const last = endDate.clone().startOf('isoweek')
      const diff = last.diff(first, 'days')

      if (endDate.diff(startDate, 'days') > 6) {
        const days = diff * 5 / 7

        let wfirst = first.isoWeekday() - startDate.isoWeekday()
        if (startDate.isoWeekday() === 0) --wfirst

        let wlast = endDate.isoWeekday() - last.isoWeekday()
        if (endDate.day() === 6) --wlast

        return Math.ceil(wfirst + days + wlast - 1)
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
      const style = {
        'background-color': timeElement.color
      }
      if (timeElement.expanded) {
        style['margin-bottom'] = '0'
      }
      return style
    },

    timebarStyle (timeElement) {
      return {
        left: this.getTimebarLeft(timeElement) + 'px',
        width: this.getTimebarWidth(timeElement) + 'px',
        cursor: timeElement.editable ? 'ew-resize' : 'default'
      }
    },

    timebarChildStyle (timeElement, rootElement) {
      return {
        left: this.getTimebarLeft(timeElement) + 'px',
        width: this.getTimebarWidth(timeElement) + 'px',
        cursor: timeElement.editable ? 'ew-resize' : 'default',
        background: timeElement.color || rootElement.color
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
    },

    // Children

    expandRootElement (rootElement) {
      this.$emit('root-element-expanded', rootElement)
    },

    expandChildElement (element) {
    },

    childNameStyle (rootElement, index) {
      const isOdd = index % 2 === 0
      const level = isOdd ? 0.7 : 0.9
      return {
        'background': colors.lightenColor(rootElement.color, level)
      }
    },

    childrenStyle (rootElement) {
      return {
        'border-bottom': '1px solid ' + rootElement.color
      }
    },

    // Milestones

    showEditMilestoneModal (day, milestone) {
      this.modals.edit = true
      if (milestone) {
        milestone.date = moment(milestone.date, 'YYYY-MM-DD', 'en')
        this.milestoneToEdit = milestone
      } else {
        this.milestoneToEdit = { date: day }
      }
    },

    hideEditMilestoneModal () {
      this.modals.edit = false
    },

    confirmEditMilestone (milestone) {
      this.loading.edit = true
      this.saveMilestone(milestone)
        .then(() => {
          this.modals.edit = false
          this.loading.edit = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    removeMilestone (milestone) {
      this.loading.edit = true
      this.deleteMilestone(milestone)
        .then(() => {
          this.modals.edit = false
          this.loading.edit = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    milestoneLineStyle (milestone) {
      const endDate = moment(milestone.date, 'YYYY-MM-DD', 'en')
      const lengthDiff = this.businessDiff(this.startDate, endDate)
      return {
        left: (lengthDiff + 0.5) * this.cellWidth + 'px'
      }
    },

    addMilestoneTitle (day) {
      return `${this.$t('schedule.milestone.add_milestone')} ` +
             `${day.format('YYYY-MM-DD')}`
    }
  },

  socket: {},

  watch: {
    startDate () {
      this.resetScheduleSize()
      this.scrollToToday()
    },
    endDate () {
      this.resetScheduleSize()
    },
    zoomLevel () {
      this.resetScheduleSize()
    },
    isLoading () {
      this.$nextTick(this.resetScheduleSize)
    },
    height () {
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

    .timeline-content-wrapper {
      .timeline-content {
        .entity-line.child-line {
          .timebar {
            background: rgba(200, 200, 250, 0.8);
            color: $dark-grey;
          }
        }

        .milestone-vertical-line {
          border-left: 1px dashed white;
        }
      }
    }
  }

  .total-man-days {
    background: #36393F;
    color: white;
  }

  .child-name .entity-name span {
    color: $white;
  }

  .milestone {
    .milestone-tooltip {
      background: $dark-grey-lighter;
      border: 1px solid $dark-grey;
      box-shadow: 0 2px 2px 0px $dark-grey-strong;
    }
    .milestone-tooltip:after {
      border-color: transparent;
      border-top-color: $dark-grey-lighter;
    }
    .milestone-tooltip:before {
      border-color: transparent;
      border-top-color: $dark-grey-lighter;
    }
  }
}

.schedule-wrapper {
  position: relative;
  height: 100%;
}

.schedule {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}

.entities {
  background: white;
  min-width: 300px;
  overflow: hidden;
  z-index: 2;

  .entity-line {
    max-width: 300px;
    min-width: 300px;
  }
}

.entity-name-list {
  padding-top: 97px;
}

.total-man-days {
  position: fixed;
  background: white;
  padding-top: 57px;
  padding-right: 5px;
  min-width: 300px;
  height: 97px;
  z-index: 2;
}

.entity-line {
  color: white;
  font-size: 1.2em;
  height: 40px;
  margin-bottom: 20px;
  padding: 0.5em;

  .flexrow-item {
    margin: 0;
  }

  .expand {
    cursor: pointer;
    margin-right: 0.5em;
  }

  &.child-line {
    height: 40px;
    margin-bottom: 0px;
    font-size: 1em;

    &:nth-child(even) {
      background: transparent;
    }

    &:nth-child(odd) {
      background: rgba(200, 200, 200, 0.2);
    }
  }
}

.timeline {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 0px;

  .timeline-header {
    white-space: nowrap;
    position: relative;
    margin-left: 1px;
    background: white;
    padding-bottom: 4px;
    overflow: hidden;
    padding-top: 20px;

    .day {
      display: inline-block;
      font-size: 0.8em;
      padding-bottom: 0;
      height: 30px;

      .day-name {
        border-left: 2px solid transparent;
        color: $grey;
        padding-bottom: 0em;
        margin-bottom: 0em;
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
    overflow-x: auto;
    overflow-y: auto;

    .timeline-content {
      position: relative;

      .timeline-position {
        visibility: hidden;
        position: absolute;
        left: 0px;
        top: 0;
        bottom: 0;
        background: rgba(200, 255, 200, 0.3);
        z-index: 100;

        &.today {
          visibility: visible;
          background: rgba(255, 200, 255, 0.3);
        }
      }

      .milestone-vertical-line {
        position: absolute;
        left: 0px;
        top: 0;
        bottom: 0;
        background: rgba(200, 255, 200, 0.3);
        z-index: 100;
        width: 1px;
        border-left: 1px dashed black;
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

        &.child-line {
          padding: 0;

          .timebar {
            background: rgba(0, 0, 50, 0.2);
            top: 13px;
            font-size: 0.6em;
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
  line-height: 1.1em;

  &.root {
    border-top-left-radius: 1em;
    border-bottom-left-radius: 1em;
  }

  &.root.expanded {
    border-bottom-left-radius: 0em;
  }

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

  .avatar {
    box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.3);
    margin: 0;
    padding: 0;
  }
}

.children {
  margin-bottom: 1em;
}

.child-name .entity-name span {
  color: $dark-grey;
  padding-left: 2.5em;

  .filler {
    margin: 0;
    margin: 0;
  }
}

.total-man-days {
  padding-bottom: 10px;
  margin-right: 0.5em;

  .total-value {
    font-size: 20px;
  }
}

.child-spinner {
  font-size: 10px;
  padding-top: 20px;
}

.milestone {
  cursor: pointer;
  margin-bottom: 0px;
  position: relative;
  text-align: center;
  min-height: 35px;

  .flexrow-item {
    margin-left: 5px;
    margin-right: 0px;
  }

  .bull {
    font-size: 20px;
    line-height: 10px;
  }

  .milestone-tooltip {
    border: 1px solid #EEE;
    border-radius: 5px;
    box-shadow: 0 2px 2px 0px #EEE;
    font-size: 0.8em;
    font-weight: bold;
    opacity: 0;
    padding: 2px;
    position: relative;
    border: 1px solid #eeeeee;
    width: 140px;
    top: -5px;
    background: white;
    z-index: 100;

    .bull {
      font-size: 10px;
    }

    .edit-icon {
      width: 10px;
      height: 10px;
      color: #AAA;
    }
  }

  &:hover {
    .milestone-tooltip {
      opacity: 1;
    }
  }

  .milestone-tooltip:after, .milestone-tooltip:before {
    top: 100%;
    left: 50%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }

  .milestone-tooltip:after {
    border-color: rgba(255, 255, 255, 0);
    border-top-color: #ffffff;
    border-width: 5px;
    margin-left: -5px;
  }
  .milestone-tooltip:before {
    border-color: rgba(238, 238, 238, 0);
    border-top-color: #eeeeee;
    border-width: 6px;
    margin-left: -6px;
  }
}

.root-element-name {
  padding-left: 10px;
  color: white;
}

.date-widget {
  padding-top: 8px;

  .add-milestone {
    display: none;
    cursor: pointer;
    text-align: center;

    span {
      background: black;
      color: white;
      border-radius: 50%;
      font-size: 1.4em;
      line-height: 0.6em;
      font-weight: bold;
      padding: 0 6px 2px 6px;
    }
  }

  &:hover {
    background: $light-green-light;
    height: 100%;
    .add-milestone {
      display: block;
    }

    .date-name {
      display: none;
    }
  }
}
</style>
