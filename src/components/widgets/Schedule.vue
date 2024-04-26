<template>
  <div class="schedule-wrapper">
    <div :class="scheduleClass" ref="schedule">
      <div
        ref="entity-list"
        class="entities"
        @mousedown="startBrowsingY"
        @touchstart="startBrowsingY"
      >
        <div
          class="has-text-right total-man-days mr0"
          :class="{
            'has-text-right': true,
            mr0: true,
            'total-man-days': true,
            'without-milestones': !withMilestones
          }"
        >
          <span class="total-value" v-if="!hideManDays">
            {{ formatDuration(totalManDays) }} {{ $t('schedule.md') }}
          </span>
        </div>

        <div
          :class="{
            'entity-name-list': true,
            'without-milestones': !withMilestones
          }"
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
              :style="entityLineStyle(rootElement, true, true)"
              v-show="!hideRoot"
            >
              <span
                class="expand flexrow-item"
                :style="{
                  color: isDarkTheme ? '#EEE' : '#999',
                  'margin-top': '4px'
                }"
                @click="expandRootElement(rootElement)"
              >
                <chevron-right-icon v-if="!rootElement.expanded" />
                <chevron-down-icon v-else />
              </span>
              <span class="avatar flexrow-item" v-if="rootElement.avatar">
                <production-name
                  :production="rootElement"
                  :only-avatar="true"
                  :size="30"
                  v-if="rootElement.type === 'Project'"
                />
                <people-avatar
                  :person="rootElement"
                  :is-link="false"
                  :font-size="14"
                  :size="28"
                  v-else
                />
              </span>
              <span
                class="filler flexrow-item root-element-name ellipsis"
                :title="rootElement.name"
                v-if="!rootElement.route"
              >
                {{ rootElement.name }}
              </span>
              <router-link
                class="filler flexrow-item root-element-name ellipsis"
                :title="rootElement.name"
                :style="{
                  'border-left': rootElement.avatar
                    ? null
                    : '4px solid ' + rootElement.color
                }"
                :to="rootElement.route"
                v-else
              >
                {{ rootElement.name }}
              </router-link>
              <input
                class="flexrow-item mr1 man-day-input"
                type="number"
                step="any"
                placeholder="0"
                @input="
                  $emit('estimation-changed', {
                    days: $event.target.value,
                    item: rootElement,
                    daysOff: rootElement.daysOff
                  })
                "
                v-if="
                  !rootElement.avatar && rootElement.editable && !hideManDays
                "
                :value="formatDuration(rootElement.man_days, false)"
              />
              <span
                class="man-days-unit flexrow-item"
                v-if="
                  !rootElement.avatar && rootElement.editable && !hideManDays
                "
              >
                {{ $t('schedule.md') }}
              </span>
              <span
                class="man-days-unit flexrow-item"
                v-if="
                  (rootElement.avatar || !rootElement.editable) && !hideManDays
                "
              >
                {{ formatDuration(rootElement.man_days) }}
                {{ $t('schedule.md') }}
              </span>
            </div>
            <div
              class="children"
              :style="childrenStyle(rootElement, multiline, true)"
              v-if="rootElement.expanded"
            >
              <div class="flexrow" v-if="rootElement.loading">
                <spinner
                  style="width: 20px; margin: 0 0 10px 10px"
                  class="child-spinner flexrow-item"
                />
              </div>
              <div
                class="child-name"
                :key="'entity-' + childElement.id"
                v-for="(childElement, j) in rootElement.children"
                v-if="!multiline"
              >
                <div
                  class="entity-line entity-name child-line flexrow"
                  :style="childNameStyle(rootElement, j)"
                >
                  <router-link
                    :to="childElement.route"
                    class="filler flexrow-item child-element-name"
                    v-if="childElement.route"
                  >
                    {{ childElement.name }}
                  </router-link>
                  <span class="filler flexrow-item" v-else>
                    {{ childElement.name }}
                  </span>
                  <span
                    class="flexrow flexrow-item man-days-unit-wrapper"
                    v-if="childElement.editable && !hideManDays"
                  >
                    <input
                      class="flexrow-item man-days-unit"
                      type="number"
                      min="0"
                      placeholder="0"
                      step="any"
                      @input="
                        onChildEstimationChanged(
                          $event,
                          childElement,
                          rootElement
                        )
                      "
                      :value="formatDuration(childElement.man_days, false)"
                    />
                    {{ $t('schedule.md') }}
                  </span>
                  <span class="man-days-unit flexrow-item" v-else>
                    {{ formatDuration(childElement.man_days) }}
                    {{ $t('schedule.md') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="timeline" ref="timeline">
        <div
          ref="timeline-header"
          class="timeline-header"
          @mousedown="startBrowsingX"
          @touchstart="startBrowsingX"
          v-if="zoomLevel > 0"
        >
          <div
            class="day"
            :class="{
              'without-milestones': !withMilestones
            }"
            :key="'header-' + day.text + '-' + index"
            v-for="(day, index) in daysAvailable"
          >
            <div
              class="milestone"
              @click="showEditMilestoneModal(day, currentMilestones[day.text])"
              v-if="currentMilestones[day.text] && withMilestones"
            >
              <div class="milestone-tooltip">
                {{ currentMilestones[day.text].name }}
              </div>
              <div class="bull pointer">&bull;</div>
            </div>
            <div class="milestone" v-else-if="withMilestones">
              <div class="bull">&nbsp;</div>
            </div>

            <div
              :class="{
                'with-milestones': withMilestones && isCurrentUserManager,
                'date-widget': true
              }"
            >
              <div
                class="add-milestone"
                :title="addMilestoneTitle(day)"
                @click="
                  showEditMilestoneModal(day, currentMilestones[day.text])
                "
                v-if="withMilestones && isCurrentUserManager"
              >
                <span class="button">
                  <edit-icon size="10" v-if="currentMilestones[day.text]" />
                  <plus-icon size="12" stroke-width="3" v-else />
                </span>
              </div>
              <div class="date-name">
                <span class="month-name" v-if="day.newMonth">
                  {{ day.monthText }}
                </span>
                <span class="week-number" v-if="day.newWeek">
                  {{ day.weekNumber }}
                </span>
                <div :class="dayClass(day, index)">
                  <span v-if="zoomLevel > 2"> {{ day.dayText }} / </span>
                  <span class="day-number">
                    <briefcase-icon
                      class="day-off-icon"
                      size="14"
                      v-if="day.off"
                    />
                    {{ day.dayNumber }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref="timeline-header"
          class="timeline-header"
          @mousedown="startBrowsingX"
          @touchstart="startBrowsingX"
          v-else
        >
          <div
            class="day week"
            :class="{
              'without-milestones': !withMilestones
            }"
            :key="'header-' + week.weekText + '-' + index"
            :title="week.label"
            v-for="(week, index) in weeksAvailable"
          >
            <div
              :class="{
                'hidden-milestones': withMilestones
              }"
            >
              <div class="date-name">
                <span class="month-name" v-if="week.newMonth">
                  {{ week.monthText }}
                </span>
                <span class="week-number"> &nbsp; </span>
                <div :class="dayClass(week, index)">
                  <span class="day-number">
                    {{ week.weekNumber }}
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
            :style="timelineStyle"
            @mousedown="startBrowsing"
            @touchstart="startBrowsing"
          >
            <div
              ref="timeline-sub-start"
              class="sub-zone"
              :style="timelineSubStartStyle"
              v-if="subStartDate"
            ></div>

            <div
              ref="timeline-sub-end"
              class="sub-zone"
              :style="timelineSubEndStyle"
              v-if="subEndDate"
            ></div>

            <div
              ref="timeline-today-position"
              class="timeline-position today"
              :style="timelineTodayPositionStyle"
            ></div>
            <div
              ref="timeline-position"
              class="timeline-position"
              :style="timelinePositionStyle"
              v-show="!isChangeDates"
            ></div>
            <div
              class="milestone-vertical-line"
              :style="milestoneLineStyle(milestone)"
              :key="'milestone-' + milestone.date"
              v-for="milestone in Object.values(currentMilestones)"
              v-if="!isWeekMode"
            ></div>
            <div
              class="timeline-element root-drop"
              :data-id="rootElement.id"
              :key="'entity-line-' + rootElement.id"
              v-for="rootElement in hierarchy"
            >
              <div
                class="day-off"
                :key="`dayoff-${dayOff.id}-${index}`"
                :style="dayOffStyle(dayOff)"
                :title="dayOff.description"
                v-for="(dayOff, index) in getDayOffRange(rootElement.daysOff)"
              >
                <briefcase-icon size="14" />
              </div>
              <div
                class="entity-line root-element"
                :style="entityLineStyle(rootElement, true)"
                v-show="!hideRoot"
              >
                <div
                  class="timebar-wrapper"
                  :class="{
                    thinner: multiline
                  }"
                  :title="
                    rootElement.name +
                    ' (' +
                    rootElement.startDate.format('DD-MM') +
                    ' - ' +
                    rootElement.endDate.format('DD-MM') +
                    ')'
                  "
                  :style="timebarStyle(rootElement, true)"
                >
                  <div
                    class="timebar"
                    v-show="isVisible(rootElement)"
                    v-if="rootElement.editable"
                  >
                    <div
                      class="timebar-left-hand"
                      @mousedown="moveTimebarLeftSide(rootElement, $event)"
                      @touchstart="moveTimebarLeftSide(rootElement, $event)"
                    ></div>
                    <div
                      class="filler"
                      @mousedown="moveTimebar(rootElement, $event)"
                      @touchstart="moveTimebar(rootElement, $event)"
                    ></div>
                    <div
                      class="timebar-right-hand"
                      @mousedown="moveTimebarRightSide(rootElement, $event)"
                      @touchstart="moveTimebarRightSide(rootElement, $event)"
                    ></div>
                  </div>
                </div>
              </div>

              <div
                class="children"
                :style="childrenStyle(rootElement, multiline)"
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
                  :class="{ multiline }"
                  :key="'entity-line-' + childElement.id"
                  :style="
                    multiline &&
                    timelineMultilineStyle(childElement, rootElement)
                  "
                  v-for="childElement in rootElement.children"
                >
                  <div
                    class="timebar"
                    :class="{
                      selected: isSelected(childElement)
                    }"
                    :title="
                      (multiline ? `${childElement.project_name} - ` : '') +
                      childElement.name +
                      ' (' +
                      childElement.startDate.format('DD-MM') +
                      ' - ' +
                      childElement.endDate.format('DD-MM') +
                      ')'
                    "
                    :style="
                      timebarChildStyle(childElement, rootElement, multiline)
                    "
                    v-show="isVisible(childElement)"
                  >
                    <div
                      class="timebar-left-hand"
                      @mousedown="moveTimebarLeftSide(childElement, $event)"
                      @touchstart="moveTimebarLeftSide(childElement, $event)"
                      v-if="
                        !isChangeDates &&
                        selection.length === 1 &&
                        isSelected(childElement) &&
                        childElement.editable &&
                        !childElement.unresizable
                      "
                    ></div>
                    <div
                      class="timebar-center"
                      :class="{ ellipsis: multiline }"
                      @mousedown="moveTimebar(childElement, $event)"
                      @touchstart="moveTimebar(childElement, $event)"
                    >
                      <template v-if="multiline">
                        <b>{{ childElement.project_name }}</b>
                        <br />
                        {{ childElement.name }}
                      </template>
                    </div>
                    <div
                      class="timebar-right-hand"
                      @mousedown="moveTimebarRightSide(childElement, $event)"
                      @touchstart="moveTimebarRightSide(childElement, $event)"
                      v-if="
                        !isChangeDates &&
                        selection.length === 1 &&
                        isSelected(childElement) &&
                        childElement.editable &&
                        !childElement.unresizable
                      "
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <edit-milestone-modal
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
import moment from 'moment-timezone'
import {
  BriefcaseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  PlusIcon
} from 'vue-feather-icons'
import { mapGetters, mapActions } from 'vuex'

import { domMixin } from '@/components/mixins/dom'
import { formatListMixin } from '@/components/mixins/format'

import colors from '@/lib/colors'
import {
  addBusinessDays,
  daysToMinutes,
  formatFullDate,
  getBusinessDays,
  getDayOffRange,
  parseDate
} from '@/lib/time'

import EditMilestoneModal from '@/components/modals/EditMilestoneModal.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'schedule',

  mixins: [domMixin, formatListMixin],

  components: {
    BriefcaseIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    EditIcon,
    EditMilestoneModal,
    PeopleAvatar,
    PlusIcon,
    ProductionName,
    Spinner
  },

  data() {
    return {
      currentElement: null,
      selection: [],
      isBrowsingX: false,
      isBrowsingY: false,
      isChangeDates: false,
      isChangeStartDate: false,
      isChangeEndDate: false,
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
      },
      domEvents: [
        ['mousemove', this.onMouseMove],
        ['touchmove', this.onMouseMove],
        ['mouseup', this.stopBrowsing],
        ['mouseleave', this.stopBrowsing],
        ['touchend', this.stopBrowsing],
        ['touchcancel', this.stopBrowsing],
        ['resize', this.resetScheduleSize]
      ]
    }
  },

  props: {
    daysOff: {
      type: Array,
      default: () => []
    },
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
    hideManDays: {
      type: Boolean,
      default: false
    },
    hierarchy: {
      default: () => [],
      type: Array
    },
    subEndDate: {
      type: Object,
      default: null
    },
    subStartDate: {
      type: Object,
      default: null
    },
    startDate: {
      type: Object,
      required: true
    },
    isEstimationLinked: {
      type: Boolean,
      default: false
    },
    withMilestones: {
      type: Boolean,
      default: true
    },
    hideRoot: {
      type: Boolean,
      default: false
    },
    zoomLevel: {
      type: Number,
      default: 2
    },
    multiline: {
      type: Boolean,
      default: false
    },
    reassignable: {
      type: Boolean,
      default: false
    }
  },

  mounted() {
    this.resetScheduleSize()
    this.addEvents(this.domEvents)
  },

  beforeDestroy() {
    this.removeEvents(this.domEvents)
    document.body.style.cursor = 'default'
  },

  computed: {
    ...mapGetters([
      'isCurrentUserManager',
      'isDarkTheme',
      'organisation',
      'milestones',
      'taskMap'
    ]),

    currentMilestones() {
      const localMilestones = {}
      Object.keys(this.milestones).forEach(key => {
        if (this.displayedDaysIndex[key]) {
          localMilestones[key] = this.milestones[key]
        }
      })
      return localMilestones
    },

    cellWidth() {
      return Math.max(this.zoomLevel, 1) * 20
    },

    daysAvailable() {
      const days = []
      const startDate = parseDate(this.startDate.format('YYYY-MM-DD'))
      const day = startDate.clone().add(-1, 'days')
      let dayDate = day.toDate()
      const endDate = parseDate(this.endDate.format('YYYY-MM-DD'))
      const endDayDate = endDate.toDate()
      dayDate.isoweekday = day.isoWeekday()
      dayDate.monthday = day.month()

      const daysOff = this.getDayOffRange(this.daysOff).map(
        dayOff => dayOff.date
      )

      while (dayDate < endDayDate) {
        const nextDay = new Date(Number(dayDate))
        nextDay.setDate(dayDate.getDate() + 1) // Add 1 day

        nextDay.isoweekday = dayDate.isoweekday + 1
        if (nextDay.isoweekday > 7) {
          nextDay.isoweekday = 1
          nextDay.newWeek = true
        }
        nextDay.monthday = dayDate.monthday + 1
        if (nextDay.getMonth() !== dayDate.getMonth()) {
          nextDay.newMonth = true
          nextDay.monthday = 1
        }
        if ([6, 7].includes(nextDay.isoweekday)) {
          nextDay.weekend = true
        }
        if (daysOff.includes(nextDay.toISOString().slice(0, 10))) {
          nextDay.off = true
        }

        const momentDay = parseDate(moment(nextDay).format('YYYY-MM-DD'))
        momentDay.off = nextDay.off
        momentDay.newWeek = nextDay.newWeek
        momentDay.newMonth = nextDay.newMonth
        momentDay.weekend = nextDay.weekend
        momentDay.weekNumber = momentDay.week()
        momentDay.text = momentDay.format('YYYY-MM-DD')
        momentDay.monthText = momentDay.format('MMMM YY')
        momentDay.dayNumber = momentDay.format('DD')
        momentDay.dayText = momentDay.format('ddd')[0]
        days.push(momentDay)
        dayDate = nextDay
      }

      if (days.length > 1 && days[0].weekend === true) {
        days[0].newMonth = false
        days[1].newMonth = true
        if (days.length > 2 && days[1].weekend === true) {
          days[1].newMonth = false
          days[2].newMonth = true
        } else if (days.length > 2) {
          days[1].newMonth = true
        }
      } else if (days.length > 0) {
        days[0].newMonth = true
      }

      return days
    },

    weeksAvailable() {
      const weeks = []
      if (this.daysAvailable.length < 1) return []
      const startDate = this.daysAvailable[0]
      const endDate = this.daysAvailable[this.daysAvailable.length - 1]
      const day = startDate.clone().add(-1, 'days')
      let dayDate = day.toDate()
      const endDayDate = endDate.clone().add(7, 'days').toDate()
      dayDate.weekday = day.isoWeekday()
      dayDate.monthday = day.month()
      dayDate.week = day.week()

      while (dayDate < endDayDate) {
        const nextDay = new Date(Number(dayDate))
        nextDay.setDate(dayDate.getDate() + 1) // Add 1 day
        if (nextDay.isoweekday > 7) {
          nextDay.isoweekday = 1
          nextDay.newWeek = true
        }
        nextDay.monthday = dayDate.monthday + 1
        if (nextDay.getMonth() !== dayDate.getMonth()) {
          nextDay.newMonth = true
          nextDay.monthday = 1
        }
        const momentDay = parseDate(moment(nextDay).format('YYYY-MM-DD'))
        if (momentDay.isoWeekday() === 1) {
          momentDay.weekText = momentDay.format('YYYY-MM-DD')
          momentDay.label =
            momentDay.weekText +
            ' to ' +
            momentDay.clone().add(6, 'days').format('YYYY-MM-DD')
          momentDay.weekNumber = momentDay.week()
          momentDay.newMonth =
            weeks.length === 0 ||
            momentDay.month() !== weeks[weeks.length - 1].month()
          momentDay.monthText = momentDay.format('MMMM YY')
          weeks.push(momentDay)
        }
        dayDate = nextDay
      }
      return weeks
    },

    displayedDays() {
      return this.daysAvailable
    },

    nbDisplayedDays() {
      return this.displayedDays.length
    },

    displayedDaysIndex() {
      let index = 0
      const dayIndex = {}
      this.displayedDays.forEach(d => {
        dayIndex[d.text] = index
        index++
      })
      return dayIndex
    },

    displayedWeeksIndex() {
      let index = 0
      const weekIndex = {}
      this.weeksAvailable.forEach(w => {
        weekIndex[w.weekText] = index
        index++
      })
      return weekIndex
    },

    totalManDays() {
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

    entityList() {
      return this.$refs['entity-list']
    },

    schedule() {
      return this.$refs.schedule
    },

    timeline() {
      return this.$refs.timeline
    },

    timelineContent() {
      return this.$refs['timeline-content']
    },

    timelineContentWrapper() {
      return this.$refs['timeline-content-wrapper']
    },

    timelineHeader() {
      return this.$refs['timeline-header']
    },

    timelinePosition() {
      return this.$refs['timeline-position']
    },

    // Styles

    scheduleClass() {
      const className = {
        schedule: true,
        unselectable: true
      }
      className[`zoom-level-${this.zoomLevel}`] = true
      return className
    },

    timelineStyle() {
      const firstDay = this.daysAvailable[0]
      const multiplier = firstDay ? -1 * (firstDay.isoWeekday() - 1) : 0
      return {
        'background-position-x': `${multiplier * this.cellWidth}px`
      }
    },

    timelinePositionStyle() {
      return { width: `${this.cellWidth}px` }
    },

    timelineTodayPositionStyle() {
      const today = moment()
      const isVisible =
        today.isAfter(this.startDate) && today.isBefore(this.endDate)
      return {
        width: `${this.cellWidth}px`,
        left: `${this.getTimebarLeft({ startDate: today }) - 3}px`,
        display: isVisible ? 'block' : 'none'
      }
    },

    timelineSubStartStyle() {
      let diff = this.dateDiff(this.startDate, this.subStartDate)
      if (diff < 0) diff = 0
      return {
        left: 0,
        width: `${this.cellWidth * diff}px`
      }
    },

    timelineSubEndStyle() {
      let diff = this.dateDiff(this.subEndDate, this.endDate)
      if (diff < 0) diff = 0
      return {
        right: 0,
        width: `${this.cellWidth * diff}px`
      }
    },

    dayAfterEndDate() {
      return this.endDate.clone().add(1, 'days')
    },

    isWeekMode() {
      return this.zoomLevel === 0
    }
  },

  methods: {
    ...mapActions(['deleteMilestone', 'saveMilestone']),

    getDayOffRange,

    getNbLines(element) {
      const values = element.children.map(item => item.line || 0)
      return values.length ? Math.max(...values) : 0
    },

    refreshItemPositions(rootElement) {
      if (this.multiline && rootElement?.children?.length) {
        setItemPositions(rootElement.children, 'line')
      }
    },

    isVisible(timeElement) {
      const isStartDateOk = timeElement.startDate.isSameOrAfter(this.startDate)
      const isEndDateOk = timeElement.endDate.isSameOrBefore(
        this.dayAfterEndDate
      )
      return isStartDateOk && isEndDateOk
    },

    resetScheduleSize() {
      if (this.height) this.schedule.style.height = `${this.height}px`
      if (this.timelineContent) {
        if (this.zoomLevel > 0) {
          this.timelineContent.style.width =
            this.nbDisplayedDays * this.cellWidth + 'px'
        } else {
          this.timelineContent.style.width =
            this.weeksAvailable.length * this.cellWidth + 'px'
        }
        let contentHeight = this.schedule.offsetHeight - 250
        if (!this.withMilestones) contentHeight += 40
        this.timelineContentWrapper.style.height = contentHeight + 'px'
        this.entityList.style.height = this.schedule.offsetHeight - 169 + 'px'
      }
    },

    onMouseMove(event) {
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

    onChildEstimationChanged(event, childElement, rootElement) {
      const estimation = Number(event.target.value)
      if (this.isEstimationLinked) {
        childElement.man_days = daysToMinutes(this.organisation, estimation)
        childElement.estimation = childElement.man_days
        rootElement.man_days = rootElement.children.reduce((acc, child) => {
          let value = acc
          const manDays = child.man_days
          if (child.man_days) {
            value = acc + manDays
          }
          return value
        }, 0)

        if (estimation > 0) {
          childElement.endDate = addBusinessDays(
            childElement.startDate,
            estimation - 1,
            rootElement.daysOff
          )
        }
      }
      this.$emit('estimation-changed', {
        taskId: childElement.id,
        days: estimation,
        item: childElement,
        daysOff: rootElement.daysOff
      })
    },

    updatePositionBarPosition(event) {
      if (!this.timelineContentWrapper) return
      let position =
        this.timelineContentWrapper.scrollLeft + this.getClientX(event)
      position -= 332
      position = Math.floor(position / this.cellWidth) * this.cellWidth
      if (
        this.getClientX(event) - 320 <
        this.timelineContentWrapper.offsetWidth
      ) {
        this.timelinePosition.style.left = position + 'px'
      }
    },

    isValidItemDates(startDate, endDate) {
      return (
        startDate &&
        endDate &&
        startDate.isSameOrAfter(this.startDate.clone().add(-1, 'hour')) &&
        endDate.isSameOrBefore(this.endDate.clone().add(1, 'day')) &&
        startDate.isSameOrBefore(endDate) &&
        endDate.isSameOrAfter(startDate)
      )
    },

    getDisplayedDaysIndex(date) {
      const dateString = date.format('YYYY-MM-DD')
      return this.displayedDaysIndex[dateString]
    },

    getDisplayedWeeksIndex(date) {
      const dateString = date.startOf('isoweek').format('YYYY-MM-DD')
      return this.displayedWeeksIndex[dateString]
    },

    changeDates(event) {
      if (!this.isSelected(this.currentElement)) {
        // avoid side effect if item unselected
        return
      }

      const change =
        this.getClientX(event) - this.initialClientX - this.cellWidth / 2
      const dayChange = Math.ceil(change / this.cellWidth)

      if (this.reassignable) {
        let target = event.target
        while (
          target &&
          (!target.classList || !target.classList.contains('root-drop'))
        ) {
          target = target.parentNode
        }
        const currentRootElement = this.currentElement.parentElement

        if (target && currentRootElement.id !== target.dataset.id) {
          const newRootElement = this.hierarchy.find(
            rootElement => rootElement.id === target.dataset.id
          )
          if (newRootElement.expanded) {
            this.selection.forEach(item => {
              const previousRootElement = item.parentElement
              // update assignation in element hierarchy
              item.parentElement = newRootElement
              previousRootElement.children =
                previousRootElement.children.filter(child => {
                  if (child.id !== item.id) {
                    this.$emit('item-unassign', item, previousRootElement)
                    return true
                  }
                  return false
                })
              newRootElement.children = newRootElement.children.filter(
                child => child.id !== item.id
              )
              newRootElement.children.push(item)
              this.$emit('item-assign', item, newRootElement)
              this.refreshItemPositions(previousRootElement)
            })
            this.refreshItemPositions(newRootElement)
          }
        }
      }

      if (this.lastStartDate.isBefore(this.startDate)) {
        this.lastStartDate = this.startDate.clone()
      }

      if (this.lastEndDate.isBefore(this.startDate)) {
        this.lastEndDate = this.startDate.clone().add(1, 'days')
      }

      const startDate = this.lastStartDate
      const endDate = this.lastEndDate
      if (!this.isWeekMode) {
        const startDateIndex = this.getDisplayedDaysIndex(startDate)
        const endDateIndex = this.getDisplayedDaysIndex(endDate)
        const length = endDateIndex - startDateIndex
        let currentIndex = this.getDisplayedDaysIndex(startDate)

        currentIndex += dayChange
        if (currentIndex < 0) currentIndex = 0

        const newStartDate = this.displayedDays[currentIndex]
        if (newStartDate) {
          const newEndDate = this.displayedDays[currentIndex + length]
          const dateDiff = newStartDate.diff(this.currentElement.startDate)
          if (dateDiff && this.isValidItemDates(newStartDate, newEndDate)) {
            // update all selected items
            this.selection.forEach(item => {
              item.startDate.add(dateDiff)
              item.endDate.add(dateDiff)
            })
            if (this.multiline) {
              const parentElements = [
                ...new Set(this.selection.map(item => item.parentElement))
              ]
              parentElements.forEach(this.refreshItemPositions)
            }
          }
        }
      } else {
        const startDateIndex = this.getDisplayedWeeksIndex(startDate)
        const endDateIndex = this.getDisplayedWeeksIndex(endDate)
        const length = endDateIndex - startDateIndex
        let currentIndex = this.getDisplayedWeeksIndex(startDate)
        currentIndex += dayChange
        if (currentIndex < 0) currentIndex = 0
        const newStartDate = this.weeksAvailable[currentIndex]
        if (newStartDate) {
          const newEndDate = this.weeksAvailable[currentIndex + length]
          if (this.isValidItemDates(newStartDate, newEndDate)) {
            this.currentElement.startDate = newStartDate
            this.currentElement.endDate = newEndDate
          }
        }
      }
    },

    changeStartDate(event) {
      const change =
        this.getClientX(event) - this.initialClientX + this.cellWidth / 2
      const dayChange = Math.floor(change / this.cellWidth)

      const startDate = this.lastStartDate
      const endDate = this.currentElement.endDate
      let currentIndex, endDateIndex
      if (this.isWeekMode) {
        currentIndex = this.getDisplayedWeeksIndex(startDate)
        endDateIndex = this.getDisplayedWeeksIndex(endDate)
      } else {
        currentIndex = this.getDisplayedDaysIndex(startDate)
        endDateIndex = this.getDisplayedDaysIndex(endDate)
      }
      currentIndex += dayChange
      if (currentIndex > endDateIndex) currentIndex = endDateIndex
      if (currentIndex < 0) currentIndex = 0

      const newStartDate = this.isWeekMode
        ? this.weeksAvailable[currentIndex]
        : this.displayedDays[currentIndex]

      if (
        !newStartDate.isSame(this.currentElement.startDate) &&
        this.isValidItemDates(newStartDate, this.currentElement.endDate)
      ) {
        this.currentElement.startDate = newStartDate.clone()
        this.updateItemEstimation(this.currentElement)
        this.refreshItemPositions(this.currentElement.parentElement)
        this.resetSelection([this.currentElement])
      }
    },

    changeEndDate(event) {
      const change =
        this.getClientX(event) - this.initialClientX + this.cellWidth / 2
      const dayChange = Math.ceil(change / this.cellWidth)

      if (this.currentElement.startDate.isBefore(this.startDate)) {
        this.currentElement.startDate = this.startDate.clone()
      }

      if (this.currentElement.endDate.isBefore(this.startDate)) {
        this.currentElement.endDate = this.startDate.clone().add(1, 'days')
      }

      if (this.lastEndDate.isBefore(this.startDate)) {
        this.lastEndDate = this.startDate.clone().add(1, 'days')
      }

      const startDate = this.currentElement.startDate
      const endDate = this.lastEndDate
      let startDateIndex, currentIndex
      if (this.isWeekMode) {
        startDateIndex = this.getDisplayedWeeksIndex(startDate)
        currentIndex = this.getDisplayedWeeksIndex(endDate)
      } else {
        startDateIndex = this.getDisplayedDaysIndex(startDate)
        currentIndex = this.getDisplayedDaysIndex(endDate)
      }

      currentIndex += dayChange - 1
      if (currentIndex < startDateIndex) currentIndex = startDateIndex
      if (this.isWeekMode) {
        if (currentIndex > this.displayedWeeksIndex.length) {
          currentIndex = this.displayedWeeksIndex.length - 1
        }
      } else {
        if (currentIndex > this.displayedDaysIndex.length) {
          currentIndex = this.displayedDaysIndex.length - 1
        }
      }

      const newEndDate = this.isWeekMode
        ? this.weeksAvailable[currentIndex]
        : this.displayedDays[currentIndex]

      if (
        !newEndDate.isSame(this.currentElement.endDate) &&
        this.isValidItemDates(this.currentElement.startDate, newEndDate)
      ) {
        this.currentElement.endDate = newEndDate.clone()
        this.updateItemEstimation(this.currentElement)
        this.refreshItemPositions(this.currentElement.parentElement)
        this.resetSelection([this.currentElement])
      }
    },

    updateItemEstimation(item) {
      if (this.isEstimationLinked) {
        const estimation = getBusinessDays(
          item.startDate,
          item.endDate,
          item.parentElement.daysOff
        )
        item.estimation = daysToMinutes(this.organisation, estimation)
      }
    },

    updateSelection(item, event) {
      const isCtrlKey = event.ctrlKey || event.metaKey

      if (this.isSelected(item)) {
        if (isCtrlKey) {
          this.removeFromSelection(item)
        }
      } else {
        if (!isCtrlKey) {
          this.resetSelection()
        }
        this.addToSelection(item)
      }
    },

    isSelected(item) {
      return this.selection.some(({ id }) => id === item.id)
    },

    addToSelection(itemToAdd) {
      this.selection.push(itemToAdd)
    },

    removeFromSelection(itemToRemove) {
      this.selection = this.selection.filter(item => item !== itemToRemove)
    },

    resetSelection(value) {
      this.selection = value || []
    },

    moveTimebar(timeElement, event) {
      event.preventDefault() // avoid scroll of schedule on touch
      if (
        !this.isChangeStartDate &&
        !this.isChangeEndDate &&
        timeElement.editable
      ) {
        this.isChangeDates = true
        this.isChangeStartDate = false
        this.isChangeEndDate = false
        this.currentElement = timeElement
        this.lastStartDate = timeElement.startDate.clone()
        this.lastEndDate = timeElement.endDate.clone()
        this.initialClientX = this.getClientX(event)
        document.body.style.cursor = this.reassignable
          ? 'all-scroll'
          : 'ew-resize'

        this.updateSelection(timeElement, event)
      }
    },

    moveTimebarLeftSide(timeElement, event) {
      event.preventDefault() // avoid scroll of schedule on touch
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
          timeElement.endDate = timeElement.startDate.clone().add(1, 'days')
        }
        this.lastStartDate = timeElement.startDate.clone()
        this.lastEndDate = timeElement.endDate.clone()
        this.initialClientX = this.getClientX(event)
        document.body.style.cursor = 'w-resize'

        this.updateSelection(timeElement, event)
      }
    },

    moveTimebarRightSide(timeElement, event) {
      event.preventDefault() // avoid scroll of schedule on touch
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
          timeElement.endDate = timeElement.startDate.clone().add(1, 'days')
        }
        this.lastStartDate = timeElement.startDate.clone()
        this.lastEndDate = timeElement.endDate.clone()
        this.initialClientX = this.getClientX(event)
        document.body.style.cursor = 'e-resize'

        this.updateSelection(timeElement, event)
      }
    },

    onTimelineScroll(event, position) {
      const newTop = position.scrollTop
      this.entityList.scrollTop = newTop
      const newLeft = position.scrollLeft
      this.timelineHeader.scrollLeft = newLeft
    },

    scrollScheduleLeft(event) {
      if (!this.timelineContentWrapper) return
      const previousLeft = this.timelineContentWrapper.scrollLeft
      const movementX =
        event.movementX || this.getClientX(event) - this.initialClientX
      const newLeft = previousLeft - movementX
      this.initialClientX = this.getClientX(event)
      this.timelineContentWrapper.scrollLeft = newLeft
      this.timelineHeader.scrollLeft = newLeft
    },

    scrollScheduleTop(event) {
      if (!this.timelineContentWrapper) return
      const previousTop = this.timelineContentWrapper.scrollTop
      const movementY =
        event.movementY || this.getClientY(event) - this.initialClientY
      const newTop = previousTop - movementY
      this.initialClientY = this.getClientY(event)
      this.timelineContentWrapper.scrollTop = newTop
      this.entityList.scrollTop = newTop
    },

    scrollToToday() {
      setTimeout(() => {
        const today = moment()
        if (today.isAfter(this.startDate) && today.isBefore(this.endDate)) {
          const todayPosition = this.getTimebarLeft({ startDate: today }) - 5
          const newLeft = todayPosition - (this.schedule.offsetWidth / 2 - 300)
          this.timelineContentWrapper.scrollLeft = newLeft
          this.timelineHeader.scrollLeft = newLeft
        }
      }, 10)
    },

    scrollToDate(date) {
      setTimeout(() => {
        if (date.isAfter(this.startDate) && date.isBefore(this.endDate)) {
          const datePosition = this.getTimebarLeft({ startDate: date }) - 5
          const newLeft = datePosition - (this.schedule.offsetWidth / 2 - 300)
          this.timelineContentWrapper.scrollLeft = newLeft
          this.timelineHeader.scrollLeft = newLeft
        }
      }, 10)
    },

    startBrowsing(event) {
      if (
        !this.isChangeStartDate &&
        !this.isChangeEndDate &&
        !this.isChangeDates
      ) {
        document.body.style.cursor = 'grabbing'
        this.isBrowsingX = true
        this.isBrowsingY = true
        this.initialClientX = this.getClientX(event)
        this.initialClientY = this.getClientY(event)
      }
    },

    startBrowsingX(event) {
      document.body.style.cursor = 'grabbing'
      this.isBrowsingX = true
      this.initialClientX = this.getClientX(event)
    },

    startBrowsingY(event) {
      document.body.style.cursor = 'grabbing'
      this.isBrowsingY = true
      this.initialClientY = this.getClientY(event)
    },

    stopBrowsing(event) {
      document.body.style.cursor = 'default'
      if (this.currentElement) {
        if (this.initialClientX !== this.getClientX(event)) {
          // on moving or resizing selected items
          this.selection.forEach(item => {
            this.$emit('item-changed', item)
            this.refreshItemPositions(item.parentElement)
          })
          // clear selection after moving a single item
          if (this.isChangeDates && this.selection.length === 1) {
            this.resetSelection()
          }
        } else {
          // reset multi-selection when clicking on a single item
          const isCtrlKey = event.ctrlKey || event.metaKey
          if (this.isChangeDates && this.selection.length > 1 && !isCtrlKey) {
            this.resetSelection([this.currentElement])
          }
        }
      } else {
        // clear the selection when clicking outside an item
        let target = event.target
        while (target && target !== this.timeline) {
          target = target.parentNode
        }
        if (target) {
          this.resetSelection()
        }
      }
      this.isChangeStartDate = false
      this.isChangeEndDate = false
      this.isChangeDates = false
      this.isBrowsingX = false
      this.isBrowsingY = false
      this.initialClientX = null
      this.initialClientY = null
      this.currentElement = null
    },

    // Helpers

    dateDiff(startDate, endDate) {
      if (startDate.isSame(endDate)) return 0
      const first = startDate.clone().startOf('day')
      const last = endDate.clone().endOf('day')
      const diff = last.diff(first, 'days')
      return diff
    },

    // Styles

    dayClass(day, index = 0) {
      return {
        'day-name': true,
        'new-week': day.newWeek || false,
        'new-month': day.newMonth || index === 0 || false,
        weekend: day.weekend || false,
        'day-name-off': day.off || false
      }
    },

    dayOffStyle(dayOff) {
      return {
        left: `${this.getDayOffLeft(dayOff)}px`
      }
    },

    getDayOffLeft(dayOff) {
      const startDate = moment(dayOff.date)
      let startDiff = this.dateDiff(this.startDate, startDate) || 0
      if (this.zoomLevel === 0) startDiff = Math.round(startDiff / 7 - 1)
      return startDiff * this.cellWidth + 1
    },

    entityLineStyle(timeElement, root = false, header = false) {
      const style = {}
      let color = timeElement.color
      if (root) {
        // is a person
        color = this.isDarkTheme ? '#222' : '#EEF'
      }
      if (root) {
        style['border-left'] = '1px solid ' + color
        style['border-top'] = '1px solid ' + color
        style['border-bottom'] = '1px solid ' + color
        if (header) {
          style.background = color
        }
      }
      if (timeElement.expanded) {
        style['margin-bottom'] = '0'
      }
      style['border-left'] = '1px solid ' + color
      style.color = this.isDarkTheme ? '#EEE' : '#111'
      if (!this.isDarkTheme) {
        style['border-color'] = '#BBE'
      }
      return style
    },

    timebarStyle(timeElement, root = false) {
      const style = {
        left: this.getTimebarLeft(timeElement) + 'px',
        width: this.getTimebarWidth(timeElement) + 'px',
        cursor: timeElement.editable
          ? !root && this.reassignable
            ? 'all-scroll'
            : 'ew-resize'
          : 'default'
      }
      if (root) {
        style['background-color'] = timeElement.color
      }
      return style
    },

    timelineMultilineStyle(timeElement) {
      return {
        top: `${timeElement.line * 40 + 5}px`,
        left: `${this.getTimebarLeft(timeElement)}px`
      }
    },

    timebarChildStyle(timeElement, rootElement, multiline = false) {
      return {
        left: !multiline && `${this.getTimebarLeft(timeElement)}px`,
        width: this.getTimebarWidth(timeElement) + 'px',
        cursor: timeElement.editable
          ? this.reassignable
            ? 'all-scroll'
            : 'ew-resize'
          : 'default',
        background: timeElement.color || rootElement.color
      }
    },

    getTimebarLeft(timeElement) {
      const startDate = timeElement.startDate || this.startDate
      let startDiff = this.dateDiff(this.startDate, startDate) || 0
      if (this.zoomLevel === 0) startDiff = Math.round(startDiff / 7 - 1)
      return startDiff * this.cellWidth + 3
    },

    getTimebarWidth(timeElement) {
      const startDate = timeElement.startDate || this.startDate
      let endDate =
        timeElement.endDate ||
        (timeElement.startDate &&
          timeElement.startDate.clone().add(1, 'days')) ||
        this.startDate.clone().add(1, 'days')

      if (
        timeElement.man_days > 0 &&
        !timeElement.end_date &&
        !timeElement.endDate
      ) {
        const days = Math.ceil(timeElement.man_days)
        endDate = addBusinessDays(startDate, days - 1)
      }

      let lengthDiff = this.dateDiff(startDate, endDate)
      if (this.zoomLevel === 0) lengthDiff = Math.round(lengthDiff / 7)
      if (lengthDiff > 0) {
        return (lengthDiff + 1) * this.cellWidth - 6
      } else {
        return this.cellWidth - 4
      }
    },

    // Children

    expandRootElement(rootElement) {
      this.$emit(
        'root-element-expanded',
        rootElement,
        this.multiline ? this.refreshItemPositions : undefined
      )
    },

    childNameStyle(rootElement, index) {
      const isOdd = index % 2 === 0
      const level = isOdd ? 0.7 : 0.9
      return {
        background: colors.fadeColor(rootElement.color, level)
      }
    },

    childrenStyle(rootElement, isMultiline = false, setBackground = false) {
      const color = rootElement.color
      if (rootElement.full_name) {
        // is a person
        // color = this.isDarkTheme ? '#222' : '#CCC'
      }
      const style = {
        'border-bottom': `1px solid ${color}`,
        'border-left': `1px solid ${color}`
      }
      if (isMultiline) {
        const nbLines = this.getNbLines(rootElement)
        style.height = `${40 * (nbLines + 1) + 10}px`

        if (setBackground) {
          style.background = colors.fadeColor(rootElement.color, 0.7)
        }
      }
      return style
    },

    // Milestones

    showEditMilestoneModal(day, milestone) {
      if (this.isCurrentUserManager) {
        this.modals.edit = true
        if (milestone) {
          this.milestoneToEdit = {
            ...milestone,
            date: parseDate(milestone.date)
          }
        } else {
          this.milestoneToEdit = { date: day }
        }
      }
    },

    hideEditMilestoneModal() {
      this.modals.edit = false
    },

    confirmEditMilestone(milestone) {
      this.loading.edit = true
      this.saveMilestone(milestone)
        .then(() => {
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          this.errors.edit = true
        })
        .finally(() => {
          this.loading.edit = false
        })
    },

    removeMilestone(milestone) {
      this.loading.edit = true
      this.deleteMilestone(milestone)
        .then(() => {
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          this.errors.edit = true
        })
        .finally(() => {
          this.loading.edit = false
        })
    },

    milestoneLineStyle(milestone) {
      const startDate = parseDate(this.startDate.format('YYYY-MM-DD'))
      const milestoneDate = parseDate(milestone.date)
      if (startDate.isSameOrBefore(milestoneDate)) {
        let lengthDiff = this.dateDiff(startDate, milestoneDate)
        if (this.zoomLevel === 0) lengthDiff = lengthDiff / 7 - 1
        return {
          left: (lengthDiff + 0.5) * this.cellWidth + 'px'
        }
      } else {
        return {
          display: 'none'
        }
      }
    },

    addMilestoneTitle(day) {
      return (
        `${this.$t('schedule.milestone.add_milestone')} ` +
        `${day.format('YYYY-MM-DD')}`
      )
    }
  },

  watch: {
    startDate() {
      this.resetScheduleSize()
      // this.scrollToToday()
    },
    endDate() {
      this.resetScheduleSize()
    },
    zoomLevel() {
      this.resetScheduleSize()
      this.onTimelineScroll(null, { scrollTop: 0, scrollLeft: 0 })
    },
    isLoading() {
      this.$nextTick(this.resetScheduleSize)
    },
    height() {
      this.$nextTick(this.resetScheduleSize)
    },
    currentElement() {
      if (this.currentElement && this.currentElement.task_type_id) {
        const task = this.taskMap.get(this.currentElement.id)
        if (task) {
          this.$store.commit('UPDATE_TASK', {
            task,
            updatedAt: formatFullDate(moment())
          })
        }
      }
    }
  }
}

const setItemPositions = (items, attributeName, unitOfTime = 'days') => {
  const matrix = []
  const minDate = moment.min(items.map(item => item.startDate))
  const maxDate = moment.max(items.map(item => item.endDate))
  const nbColumns = maxDate.diff(minDate, unitOfTime) + 1

  items.forEach(item => {
    const start = item.startDate.diff(minDate, unitOfTime)
    const end = item.endDate.diff(minDate, unitOfTime)
    const line = getFreeLinePosition(item.id, start, end, matrix)
    item[attributeName] = line
  })

  function getFreeLinePosition(value, start, end, matrix, line = 0) {
    for (let index = start; index <= end; index++) {
      // if empty line
      if (!matrix[line]) {
        matrix.push(Array(nbColumns).fill(0))
        index = end
      }
      // if collision on line
      else if (matrix[line][index]) {
        // go to next line
        return getFreeLinePosition(value, start, end, matrix, line + 1)
      }

      // if no collision for the whole item
      if (index === end) {
        // save item in matrix
        matrix[line].fill(value, start, end + 1)
        return line
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .entities {
    background: inherit;
  }

  .schedule.zoom-level-0 {
    .timeline-content {
      background-image: url('@/assets/background/schedule-dark-1.png');
    }
  }

  .schedule.zoom-level-1 {
    .timeline-content {
      background-image: url('@/assets/background/schedule-dark-1-weekend.png');
    }
  }

  .schedule.zoom-level-2 {
    .timeline-content {
      background-image: url('@/assets/background/schedule-dark-2-weekend.png');
    }
  }

  .schedule.zoom-level-3 {
    .timeline-content {
      background-image: url('@/assets/background/schedule-dark-3-weekend.png');
    }
  }

  .child-element-name {
    color: white;
  }

  .timeline {
    .timeline-header {
      background: transparent;
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
            color: $dark-grey;
          }
        }

        .milestone-vertical-line {
          border-left: 1px dashed white;
        }
      }
    }
  }

  .expand,
  .man-day-input {
    color: white;
  }

  .total-man-days {
    background: $dark-grey-2;
    color: white;
  }

  .entity-name {
    .man-days-unit {
      color: $white;
    }
  }

  .child-name .entity-name span {
    color: $white;
  }

  .milestone {
    .milestone-tooltip {
      background: $dark-grey-lighter;
      border: 1px solid $dark-grey;
      box-shadow: 0 2px 2px 0 $dark-grey-strong;
    }
    .milestone-tooltip:after,
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
  height: 97vh;
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
  padding-top: 85px;

  &.without-milestones {
    padding-top: 55px;
  }
}

.entity-line {
  font-size: 1.2em;
  height: 40px;
  margin-bottom: 10px;
  padding: 0.5em;

  .flexrow-item {
    margin: 0;

    &.mr1 {
      margin-right: 0.5em;
    }
  }

  .expand {
    color: white;
    cursor: pointer;
    margin-right: 0.5em;
  }

  &.child-line {
    height: 40px;
    margin-bottom: 0;
    font-size: 1em;

    &:not(.multiline) {
      &:nth-child(odd) {
        background: rgba(200, 200, 200, 0.2);
      }
    }
  }
}

.timeline {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 0;

  .timeline-header {
    white-space: nowrap;
    position: relative;
    margin-left: 2px;
    padding-bottom: 0;
    overflow: hidden;

    .day {
      display: inline-block;
      font-size: 0.8em;

      &.without-milestones {
        margin-top: 17px;
      }

      &.week {
        margin-top: 20px;
      }

      .week-number {
        color: $grey;
        display: inline-block;
        font-size: 0.8em;
        padding-left: 3px;
      }

      .day-name {
        color: $grey;
        padding-left: 1px;
        text-align: center;
        text-transform: uppercase;

        &.new-week {
          border-left: 2px solid black;

          .zoom-level-1 & {
            border-left: none;
          }
        }
      }

      .day-number {
        color: black;
        padding-top: 0.5em;
      }

      .day-off-icon {
        position: absolute;
        top: -1px;
        opacity: 0.25;
      }

      .weekday-number {
        color: var(--text);
      }

      .month-name {
        border-left: 2px solid black;
        bottom: 0;
        color: black;
        font-size: 0.9em;
        padding-bottom: 24px;
        padding-left: 0.5em;
        top: 10px;
        text-transform: uppercase;
        position: absolute;
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
      overflow: hidden;

      .timeline-position {
        visibility: hidden;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        background: rgba(200, 255, 200, 0.3);
        z-index: 100;

        &.today {
          visibility: visible;
          background: rgba(255, 200, 255, 0.3);
        }
      }

      .timeline-element {
        position: relative;
      }

      .milestone-vertical-line {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 1px;
        border-left: 1px dashed black;
        margin-left: -0.5px;
        z-index: 100;
      }

      .entity-line {
        width: 100%;
        position: relative;

        &.multiline {
          position: absolute;
          width: auto;

          .timebar {
            height: calc(100% - 3px);
            padding: 2px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

        .timebar {
          position: absolute;
          top: 0;
          height: 14px;
          border-radius: 0.2em;
          display: flex;
          z-index: 101;

          &.selected {
            box-shadow: 0 0 0 3px var(--background-selected);
          }

          .timebar-center {
            width: 100%;
          }

          .timebar-left-hand {
            cursor: w-resize;
            width: 30px;
          }

          .timebar-right-hand {
            cursor: e-resize;
            width: 30px;
          }
        }

        .timebar-wrapper {
          .timebar {
            width: 100%;
            height: 100%;
          }
        }
        &.child-line {
          padding: 0;

          &.multiline .timebar {
            top: 0;
            font-size: 0.8em;
          }

          .timebar {
            position: relative;
            overflow: initial;
            background: rgba(0, 0, 50, 0.2);
            top: 13px;
            font-size: 0.6em;
          }

          .timebar-left-hand,
          .timebar-right-hand {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 20px;
          }
          .timebar-left-hand {
            left: -12px;
          }
          .timebar-right-hand {
            right: -12px;
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

.zoom-level-0 {
  .timeline-content {
    background-image: url('@/assets/background/schedule-white-1.png');
  }
  .day {
    width: 20px;
  }
  .milestone-tooltip {
    left: 10px;
  }
}

.zoom-level-1 {
  .timeline-content {
    background-image: url('@/assets/background/schedule-white-1-weekend.png');
  }
  .day {
    width: 20px;
  }
  .milestone-tooltip {
    left: 10px;
  }
}

.schedule.zoom-level-2 {
  .timeline-content {
    background-image: url('@/assets/background/schedule-white-2-weekend.png');
  }
  .day {
    width: 40px;
  }
  .milestone-tooltip {
    left: 20px;
  }
}

.schedule.zoom-level-3 {
  .timeline-content {
    background-image: url('@/assets/background/schedule-white-3-weekend.png');
  }
  .day {
    width: 60px;
  }
  .milestone-tooltip {
    left: 30px;
  }
}

.entity-name {
  display: flex;
  align-items: center;
  line-height: 1.1em;

  &.root {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  }

  &.root.expanded {
    border-bottom-left-radius: 0;
  }

  input {
    width: 30px;
    text-align: right;
    background: transparent;
    margin-right: 0.2em;
    font-size: 1.1em;
  }

  .man-days-unit {
    color: $dark-grey;
    font-size: 0.8em;
    margin-right: 0.3em;
    display: inline;
  }

  .avatar {
    margin: 0;
    padding: 0;
  }
}

.child-name .entity-name span.man-days-unit-wrapper {
  padding-left: 0;
  width: 60px;
  text-align: right;
}

.children {
  position: relative;
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
  position: absolute;
  background: white;
  border-top-left-radius: 10px;
  height: 85px;
  margin-right: 0.5em;
  margin-bottom: 0;
  min-width: 300px;
  padding-bottom: 0;
  padding-right: 5px;
  padding-top: 55px;
  z-index: 2;

  .total-value {
    font-size: 20px;
  }

  &.without-milestones {
    padding-top: 20px;
    height: 54px;
  }
}

.child-spinner {
  font-size: 10px;
  padding-top: 20px;
}

.milestone {
  margin-bottom: 0;
  min-height: 48px;
  position: relative;
  text-align: center;

  .flexrow-item {
    margin-left: 5px;
    margin-right: 0;
  }

  .bull {
    font-size: 20px;
    line-height: 10px;
  }

  .milestone-tooltip {
    visibility: hidden;
    display: inline-block;
    border: 1px solid #eee;
    border-radius: 5px;
    box-shadow: 0 2px 2px 0 #eee;
    font-size: 0.8em;
    font-weight: bold;
    padding: 2px 5px;
    position: relative;
    border: 1px solid #eee;
    min-width: 100px;
    text-align: center;
    top: -5px;
    background: white;
    z-index: 100;
    transform: translateX(-50%);
  }

  &:hover {
    .milestone-tooltip {
      visibility: visible;
    }
  }

  .milestone-tooltip:after,
  .milestone-tooltip:before {
    top: 100%;
    left: 50%;
    border: solid transparent;
    content: ' ';
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
  white-space: nowrap;

  color: #222;

  .dark & {
    color: $white;
  }
}

.child-element-name {
  padding-left: 10px;
  color: $grey-strong;
}

.date-widget {
  height: 20px;
  padding-top: 3px;

  .add-milestone {
    display: none;
    cursor: pointer;
    text-align: center;

    .button {
      background: black;
      border: none;
      color: white;
      height: 20px;
      margin-top: -2px;
      padding: 0;
      width: 20px;
    }
  }

  &.with-milestones:hover {
    background: $light-green-light;

    .add-milestone {
      display: block;
    }

    .day-name {
      display: none;
    }

    .week-number {
      display: none;
    }
  }
}

.hidden-milestones {
  margin-top: 43px;
}

.timebar-wrapper {
  position: absolute;
  height: 30px;
  top: 4px;
  padding: 0;
  border-radius: 4px;

  &.thinner {
    height: 14px;
    top: 14px;
  }
}

.day-off {
  position: absolute;
  z-index: 0;
  width: 19px;
  height: 100%;
  line-height: 40px;
  text-align: center;
  color: $light-grey;
  background-color: #f0f0f0;

  .dark & {
    color: $dark-grey;
    background-color: #43474d;
  }
}

.day-name-off,
.weekend {
  background: rgba(200, 200, 200, 0.3);
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

.dark {
  .sub-zone {
    opacity: 0.8;
  }
}
.sub-zone {
  background: $black;
  position: absolute;
  opacity: 0.4;
  top: 0;
  bottom: 0;
}
</style>
