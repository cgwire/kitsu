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
            'without-milestones': !withMilestones
          }"
        >
          <span class="total-value" v-if="!hideManDays">
            {{ formatDuration(totalManDays) }} {{ $t('schedule.md') }}
          </span>
        </div>

        <div
          class="entity-name-list"
          :class="{
            'without-milestones': !withMilestones
          }"
        >
          <div
            :key="`entity-${rootElement.id}`"
            v-for="rootElement in hierarchy"
          >
            <div
              class="entity-line entity-name flexrow root"
              :class="{
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
                :style="{
                  'border-left': rootElement.avatar
                    ? null
                    : `4px solid ${rootElement.color}`
                }"
                :title="rootElement.name"
                v-if="!rootElement.route"
              >
                {{ rootElement.name }}
              </span>
              <router-link
                class="filler flexrow-item root-element-name ellipsis"
                :style="{
                  'border-left': rootElement.avatar
                    ? null
                    : `4px solid ${rootElement.color}`
                }"
                :title="rootElement.name"
                :to="rootElement.route"
                v-else
              >
                {{ rootElement.name }}
              </router-link>
              <department-name
                class="ml05"
                :department="departmentMap.get(departmentId)"
                :key="departmentId"
                no-padding
                only-dot
                v-for="departmentId in rootElement.departments"
              />
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
              <div class="children-loader" v-if="rootElement.loading">
                <spinner class="child-spinner" :size="20" />
              </div>
              <template v-else-if="subchildren">
                <div
                  :key="childElement.id"
                  :style="childNameStyle(rootElement, index)"
                  class="child"
                  v-for="(childElement, index) in rootElement.children"
                >
                  <div class="child-name">
                    <span
                      class="entity-line entity-name child-line"
                      style="background: none"
                    >
                      <span class="filler">
                        {{ childElement.name }}
                      </span>
                    </span>
                  </div>
                  <div
                    :key="personId"
                    v-for="[personId] in childElement.children"
                    :style="{
                      height: `${40 * getNbLines(childElement.children.get(personId))}px`
                    }"
                    class="subchild-label"
                  >
                    <people-avatar
                      :person="rootElement.people[personId]"
                      :is-link="false"
                      :font-size="14"
                      :size="28"
                    />
                    {{ rootElement.people[personId].full_name }}
                  </div>
                </div>
              </template>
              <template v-else-if="!multiline">
                <div
                  class="child-name"
                  :key="`entity-${childElement.id}`"
                  v-for="(childElement, j) in rootElement.children"
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
              </template>
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
              'without-milestones': !withMilestones,
              'new-week': day.newWeek
            }"
            :key="`header-${day.text}-${index}`"
            v-for="(day, index) in daysAvailable"
          >
            <div
              class="milestone pointer"
              @click="showEditMilestoneModal(day, currentMilestones[day.text])"
              v-if="currentMilestones[day.text] && withMilestones"
            >
              <div class="milestone-tooltip">
                {{ currentMilestones[day.text].name }}
              </div>
              <div class="bull">&bull;</div>
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
                      :size="14"
                      v-if="day.off"
                    />
                    {{ day.dayNumber }}
                  </span>
                </div>
              </div>
              <div
                class="add-milestone"
                :title="addMilestoneTitle(day)"
                @click="
                  showEditMilestoneModal(day, currentMilestones[day.text])
                "
                v-if="withMilestones && isCurrentUserManager"
              >
                <span class="button">
                  <edit-icon :size="10" v-if="currentMilestones[day.text]" />
                  <plus-icon :size="12" :stroke-width="3" v-else />
                </span>
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
            :key="`header-${week.weekText}-${index}`"
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
          @scroll.passive="onTimelineScroll"
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
            <template v-if="withMilestones && !isWeekMode">
              <div
                class="milestone-vertical-line"
                :style="milestoneLineStyle(milestone)"
                :key="`milestone-${milestone.date}`"
                v-for="milestone in Object.values(currentMilestones)"
              ></div>
            </template>
            <div
              class="timeline-element"
              :data-id="rootElement.id"
              :key="`entity-line-${rootElement.id}`"
              v-for="rootElement in hierarchy"
            >
              <div
                class="day-off"
                :key="`dayoff-${dayOff.id}-${index}`"
                :style="dayOffStyle(dayOff)"
                :title="dayOff.description"
                v-for="(dayOff, index) in getDayOffRange(rootElement.daysOff)"
              >
                <briefcase-icon class="day-off-icon" :size="14" />
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
                  :title="`${rootElement.name} (${rootElement.startDate.format('YYYY-MM-DD')} - ${rootElement.endDate.format('YYYY-MM-DD')})`"
                  :style="timebarStyle(rootElement, true)"
                >
                  <div
                    class="timebar"
                    v-show="isVisible(rootElement)"
                    @click="$emit('root-element-selected', rootElement)"
                    v-if="rootElement.editable"
                  >
                    <div
                      class="timebar-left-hand"
                      @mousedown="moveTimebarLeftSide(rootElement, $event)"
                      @touchstart="moveTimebarLeftSide(rootElement, $event)"
                    ></div>
                    <div
                      class="timebar-center"
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
                v-if="rootElement.expanded && rootElement.loading"
              >
                <div class="children-loader">
                  <spinner class="child-spinner" :size="20" />
                </div>
              </div>

              <div
                class="children"
                :class="{ 'drop-item-target': reassignable && multiline }"
                :data-root-element-id="rootElement.id"
                :style="childrenStyle(rootElement, multiline)"
                v-else-if="rootElement.expanded"
                @dragenter="onTaskDragEnter($event, rootElement)"
                @dragover="onTaskDragOver"
                @dragleave="onTaskDragLeave"
                @drop="onTaskDrop($event, rootElement)"
              >
                <div
                  class="entity-line child-line"
                  :class="{ multiline }"
                  :key="`entity-line-${childElement.id}`"
                  :style="{
                    ...(multiline && timelineMultilineStyle(childElement)),
                    ...(subchildren && timelineSubchildrenStyle(childElement))
                  }"
                  v-for="childElement in rootElement.children"
                  v-show="!rootElement.loading"
                >
                  <div
                    class="timebar"
                    :class="{
                      selected: isSelected(childElement),
                      'timebar-subchildren': subchildren
                    }"
                    :title="`${multiline && childElement.project_name ? `${childElement.project_name} - ` : ''}${childElement.name} (${childElement.startDate.format('YYYY-MM-DD')} - ${childElement.endDate.format('YYYY-MM-DD')})`"
                    :style="
                      timebarChildStyle(childElement, rootElement, multiline)
                    "
                    v-show="subchildren || isVisible(childElement)"
                    @click="$emit('item-selected', rootElement, childElement)"
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
                      :class="{
                        ellipsis: multiline || subchildren,
                        'has-text-centered': subchildren
                      }"
                      @mousedown="moveTimebar(childElement, $event)"
                      @touchstart="moveTimebar(childElement, $event)"
                    >
                      <template v-if="multiline && childElement.project_name">
                        <b>{{ childElement.project_name }}</b>
                        <br />
                      </template>
                      <template v-if="multiline || subchildren">
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

                  <div
                    v-if="subchildren && childElement.children.size"
                    class="subchildren"
                  >
                    <div
                      :key="personId"
                      v-for="[personId, subchild] in childElement.children"
                      :style="{
                        height: `${40 * getNbLines(subchild)}px`
                      }"
                      class="subchild"
                      :class="{ 'drop-item-target': reassignable }"
                      :data-entity-type-id="childElement.object_id"
                      :data-person-id="personId"
                    >
                      <div
                        class="day-off"
                        :key="`dayoff-${dayOff.id}-${index}`"
                        :style="dayOffStyle(dayOff)"
                        :title="dayOff.description"
                        v-for="(dayOff, index) in getDayOffRange(
                          rootElement.people[personId].daysOff
                        )"
                      >
                        <briefcase-icon class="day-off-icon" :size="14" />
                      </div>
                      <div
                        class="timebar"
                        :class="{ selected: isSelected(task) }"
                        :key="index"
                        :style="timebarSubchildStyle(task, rootElement)"
                        :title="timebarSubchildTitle(task)"
                        v-for="(task, index) in subchild"
                      >
                        <div
                          class="timebar-left-hand"
                          @mousedown="moveTimebarLeftSide(task, $event)"
                          @touchstart="moveTimebarLeftSide(task, $event)"
                          v-if="
                            !isChangeDates &&
                            selection.length === 1 &&
                            isSelected(task) &&
                            task.editable &&
                            !task.unresizable
                          "
                        ></div>
                        <div
                          class="timebar-center ellipsis"
                          @mousedown="moveTimebar(task, $event)"
                          @touchstart="moveTimebar(task, $event)"
                          @click="
                            $emit(
                              'task-selected',
                              rootElement,
                              childElement,
                              task,
                              selection
                            )
                          "
                        >
                          {{ task.entity.name }}
                        </div>
                        <div
                          class="timebar-right-hand"
                          @mousedown="moveTimebarRightSide(task, $event)"
                          @touchstart="moveTimebarRightSide(task, $event)"
                          v-if="
                            !isChangeDates &&
                            selection.length === 1 &&
                            isSelected(task) &&
                            task.editable &&
                            !task.unresizable
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
      </div>
    </div>

    <edit-milestone-modal
      active
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :milestone-to-edit="milestoneToEdit"
      @confirm="confirmEditMilestone"
      @cancel="hideEditMilestoneModal"
      @remove-milestone="removeMilestone"
      v-if="withMilestones && modals.edit"
    />
  </div>
</template>

<script>
/*
 * Component to facilitate the build of schedule pages.
 */
import {
  BriefcaseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  PlusIcon
} from 'lucide-vue-next'
import moment from 'moment-timezone'
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
  minutesToDays,
  parseDate
} from '@/lib/time'

import DepartmentName from '@/components/widgets/DepartmentName.vue'
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
    DepartmentName,
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
    draggedItems: {
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
    subchildren: {
      type: Boolean,
      default: false
    },
    reassignable: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'estimation-changed',
    'item-assign',
    'item-changed',
    'item-drop',
    'item-selected',
    'item-unassign',
    'root-element-expanded',
    'root-element-selected',
    'task-selected'
  ],

  mounted() {
    this.resetScheduleSize()
    this.addEvents(this.domEvents)
  },

  beforeUnmount() {
    this.removeEvents(this.domEvents)
    document.body.style.cursor = 'default'
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'departmentMap',
      'isCurrentUserManager',
      'isDarkTheme',
      'milestones',
      'openProductions',
      'organisation',
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
      const cellWidthByLevel = [20, 20, 40, 60, 120]
      return cellWidthByLevel[this.zoomLevel] || 20
    },

    daysAvailable() {
      const days = []
      let day = this.startDate.clone().utc().startOf('day')
      const endDate = this.endDate.clone().utc().startOf('day')
      const daysOff = this.getDayOffRange(this.daysOff).map(
        dayOff => dayOff.date
      )

      while (day.isSameOrBefore(endDate)) {
        day.off = daysOff.includes(day.toISOString().slice(0, 10))
        day.newWeek = day.isoWeekday() === 1
        day.newMonth = day.date() === 1
        day.weekend = [6, 7].includes(day.isoWeekday())
        day.weekNumber = day.week()
        day.text = day.format('YYYY-MM-DD')
        day.monthText = day.format('MMMM YY')
        day.dayNumber = day.format('DD')
        day.dayText = day.format('ddd')[0]
        days.push(day)
        day = day.clone().add(1, 'days')
      }

      // always show month and week number at start of schedule
      if (days.length) {
        const indexNextMonth = days.findIndex(day => day.newMonth)
        if (indexNextMonth >= 5 || indexNextMonth === -1) {
          days[0].newMonth = true
        }
        const indexNextWeek = days.findIndex(day => day.newWeek)
        if (indexNextWeek === -1) {
          days[0].newWeek = true
        }
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
          momentDay.label = `${momentDay.weekText} to ${momentDay
            .clone()
            .add(6, 'days')
            .format('YYYY-MM-DD')}`
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
      const today = moment().utc(true)
      const isVisible =
        today.isAfter(this.startDate) && today.isBefore(this.endDate)
      return {
        width: `${this.cellWidth}px`,
        left: `${this.getTimebarLeft({ startDate: today }) - 3}px`,
        display: isVisible ? 'block' : 'none'
      }
    },

    timelineSubStartStyle() {
      const diff = Math.max(this.dateDiff(this.startDate, this.subStartDate), 0)
      return {
        left: 0,
        width: `${this.cellWidth * diff}px`
      }
    },

    timelineSubEndStyle() {
      const diff = Math.max(
        this.dateDiff(this.subEndDate, this.endDate) - 1, // end date must available
        0
      )
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
    },

    unitOfTime() {
      return this.zoomLevel > 0 ? 'days' : 'weeks'
    }
  },

  methods: {
    ...mapActions(['deleteMilestone', 'loadMilestones', 'saveMilestone']),

    getDayOffRange,

    getNbSubChildren(children) {
      if (!children) return 0

      return Object.values(children).reduce((acc, subChildren) => {
        return acc + subChildren.length
      }, 0)
    },

    getNbLines(items = []) {
      const values = items.map(item => item.line || 0)
      return values.length ? Math.max(...values) + 1 : 1
    },

    refreshAllItemPositions() {
      this.hierarchy.forEach(rootElement => {
        if (rootElement.expanded) {
          this.refreshItemPositions(rootElement)
        }
      })
    },

    refreshItemPositions(rootElement) {
      if (!rootElement?.children) {
        return
      }

      if (this.multiline) {
        setItemPositions(rootElement.children, this.unitOfTime)
      }

      if (this.subchildren) {
        rootElement.children.forEach(childElement => {
          if (childElement.children) {
            childElement.children.forEach(subchildElement => {
              setItemPositions(subchildElement, this.unitOfTime)
            })
          } else {
            setItemPositions(childElement, this.unitOfTime)
          }
        })
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
          this.timelineContent.style.width = `${this.nbDisplayedDays * this.cellWidth}px`
        } else {
          this.timelineContent.style.width = `${this.weeksAvailable.length * this.cellWidth}px`
        }
        let contentHeight = this.schedule.offsetHeight - 250
        if (!this.withMilestones) contentHeight += 40
        this.timelineContentWrapper.style.height = `${contentHeight}px`
        this.entityList.style.height = `${this.schedule.offsetHeight - 169}px`
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
        this.timelinePosition.style.left = `${position}px`
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

    resetDroppableTargets() {
      this.schedule.querySelectorAll('.droppable').forEach(element => {
        element.classList.remove('droppable')
      })
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
        while (target && !target.classList?.contains('drop-item-target')) {
          target = target.parentNode
        }
        if (!target) {
          this.resetDroppableTargets()
        }
        const currentRootElement = this.currentElement.parentElement
        if (
          this.subchildren &&
          target &&
          target.dataset.personId &&
          target.dataset.entityTypeId &&
          !this.currentElement.assignees.includes(target.dataset.personId)
        ) {
          // check rights
          if (
            target.dataset.personId === 'unassigned' ||
            target.dataset.entityTypeId !== this.currentElement.entity_type_id
          ) {
            return
          }

          target.classList.add('droppable')

          this.selection.forEach(item => {
            // update item assignation in element hierarchy
            const previousAssigneeId = item.assignees[0]
            const newAssigneeId = target.dataset.personId
            item.assignees = item.assignees.filter(
              assigneeId => assigneeId !== previousAssigneeId
            )
            item.assignees.push(newAssigneeId)

            this.$emit('item-unassign', item, previousAssigneeId)
            this.$emit('item-assign', item, newAssigneeId)
            this.refreshItemPositions(currentRootElement)
          })
        } else if (
          !this.subchildren &&
          target &&
          target.dataset.rootElementId &&
          currentRootElement.id !== target.dataset.rootElementId
        ) {
          const newRootElement = this.hierarchy.find(
            rootElement => rootElement.id === target.dataset.rootElementId
          )
          this.selection.forEach(item => {
            if (!this.checkUserIsAllowed(item, newRootElement)) {
              return
            }
            target.classList.add('droppable')
            // update assignation in element hierarchy
            const previousRootElement = item.parentElement
            item.parentElement = newRootElement
            previousRootElement.children = previousRootElement.children.filter(
              ({ id }) => id !== item.id
            )
            newRootElement.children = newRootElement.children.filter(
              ({ id }) => id !== item.id
            )
            newRootElement.children.push(item)
            this.$emit('item-unassign', item, previousRootElement)
            this.$emit('item-assign', item, newRootElement)
            this.refreshItemPositions(previousRootElement)
          })
          this.refreshItemPositions(newRootElement)
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
            if (this.multiline || this.subchildren) {
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
        newEndDate &&
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
          item.parentElement?.daysOff
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

    onTimelineScroll(event) {
      if (!event?.target) return
      const position = event.target
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
      const today = moment()
      this.scrollToDate(today)
    },

    scrollToDate(date) {
      setTimeout(() => {
        if (
          this.schedule &&
          date.isAfter(this.startDate) &&
          date.isBefore(this.endDate)
        ) {
          const datePosition = this.getTimebarLeft({ startDate: date }) - 5
          const newLeft = datePosition - (this.schedule.offsetWidth / 2 - 300)
          this.timelineContentWrapper.scrollLeft = newLeft
          if (this.timelineHeader) {
            this.timelineHeader.scrollLeft = newLeft
          }
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
      this.resetDroppableTargets()
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

    dateDiff(startDate, endDate, unitOfTime = 'days') {
      if (
        startDate.isSame(endDate) ||
        !startDate.isValid() ||
        !endDate.isValid()
      ) {
        return 0
      }
      const first = startDate.clone().utc().startOf('day')
      const last = endDate.clone().utc().endOf('day')
      const diff = last.diff(first, unitOfTime)
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
        left: `${this.getDayOffLeft(dayOff)}px`,
        width: `${this.cellWidth - 1}px`
      }
    },

    getDayOffLeft(dayOff) {
      const startDate = moment.utc(dayOff.date)
      const startDiff = this.dateDiff(
        this.startDate,
        startDate,
        this.unitOfTime
      )
      return startDiff * this.cellWidth + 1
    },

    entityLineStyle(
      timeElement,
      root = false,
      header = false,
      expanded = false
    ) {
      const style = {}
      let color = timeElement.color
      if (root) {
        // is a person
        color = this.isDarkTheme ? '#222' : '#EEF'
      }
      if (root) {
        style['border-left'] = `1px solid ${color}`
        style['border-top'] = `1px solid ${color}`
        if (!expanded) {
          style['border-bottom'] = `1px solid ${color}`
        }
        if (header) {
          style.background = color
        }
      }
      if (timeElement.expanded) {
        style['margin-bottom'] = '0'
      }
      style['border-left'] = `1px solid ${color}`
      style.color = this.isDarkTheme ? '#EEE' : '#111'
      if (!this.isDarkTheme) {
        style['border-color'] = '#BBE'
      }
      return style
    },

    timebarStyle(timeElement, root = false) {
      const style = {
        left: `${this.getTimebarLeft(timeElement)}px`,
        width: `${this.getTimebarWidth(timeElement)}px`,
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

    timelineSubchildrenStyle(timeElement) {
      const children = Array.from(timeElement.children.values())
      const nbLines = children.reduce(
        (acc, subChildren) => acc + this.getNbLines(subChildren),
        0
      )
      const marginBottom = children.length * 10
      return {
        height: `${40 + 40 * nbLines + marginBottom + 2}px`,
        'padding-top': '13px'
      }
    },

    timebarChildStyle(timeElement, rootElement, multiline = false) {
      return {
        left: !multiline && `${this.getTimebarLeft(timeElement)}px`,
        width: `${this.getTimebarWidth(timeElement)}px`,
        cursor: timeElement.editable
          ? this.reassignable
            ? 'all-scroll'
            : 'ew-resize'
          : 'default',
        background: timeElement.color || rootElement.color
      }
    },

    timebarSubchildStyle(timeElement, rootElement) {
      const color = timeElement.color || rootElement.color
      const isSelected = this.isSelected(timeElement)
      return {
        left: `${this.getTimebarLeft(timeElement)}px`,
        width: `${this.getTimebarWidth(timeElement)}px`,
        cursor: timeElement.editable
          ? this.reassignable
            ? 'all-scroll'
            : 'ew-resize'
          : 'default',
        top: `${5 + 38 * timeElement.line}px`,
        background: `color-mix(in srgb, ${color} ${isSelected ? 80 : 40}%, transparent)`,
        'box-shadow': `inset 0 0 1px 2px ${isSelected ? 'var(--background-selected)' : color}`
      }
    },

    timebarSubchildTitle(task) {
      const name = task.entity.name
      const startDate = task.startDate.format('YYYY-MM-DD')
      const endDate = task.endDate.format('YYYY-MM-DD')
      const estimation = this.formatDuration(task.estimation)
      return `${name} (${startDate} - ${endDate}) ${estimation} ${this.$t('schedule.md')}`
    },

    getTimebarLeft(timeElement) {
      const startDate = timeElement.startDate || this.startDate
      const startDiff = this.dateDiff(
        this.startDate,
        startDate,
        this.unitOfTime
      )
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

      const lengthDiff = this.dateDiff(startDate, endDate, this.unitOfTime)
      if (lengthDiff > 0) {
        return (lengthDiff + 1) * this.cellWidth - 6
      } else {
        return this.cellWidth - 4
      }
    },

    // Children

    expandRootElement(rootElement) {
      if (rootElement.expanded) {
        // clear selected items when collapsing the root element
        this.selection.forEach(item => {
          const taskRootElementId =
            item.parentElement?.parentElement?.id || item.parentElement?.id
          if (taskRootElementId === rootElement.id) {
            this.removeFromSelection(item)
          }
        })
      }

      this.$emit(
        'root-element-expanded',
        rootElement,
        this.multiline || this.subchildren
          ? this.refreshItemPositions
          : undefined
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
      const style = {
        'border-bottom': `1px solid ${rootElement.color}`,
        'border-left': `1px solid ${rootElement.color}`
      }
      if (isMultiline) {
        const nbLines = this.getNbLines(rootElement.children)
        style.height = `${40 * nbLines + 10}px`

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
        const lengthDiff = this.dateDiff(
          startDate,
          milestoneDate,
          this.unitOfTime
        )
        return {
          left: `${(lengthDiff + 0.5) * this.cellWidth}px`
        }
      } else {
        return {
          display: 'none'
        }
      }
    },

    addMilestoneTitle(day) {
      return `${this.$t('schedule.milestone.add_milestone')} ${day.format('YYYY-MM-DD')}`
    },

    checkUserIsAllowed(item, person) {
      if (!item) {
        return false
      }
      const production = this.openProductions.find(
        ({ id }) => id === item.project_id
      )
      const isTeamMember = production.team.includes(person.id)
      const isDepartmentMember =
        !person.departments.length ||
        !item.department ||
        person.departments.includes(item.department.id)
      return isTeamMember && isDepartmentMember
    },

    onTaskDragEnter(event, rootElement) {
      // HACK: the getData doesn't work on dragEnter, we use a "task-type-*" data key instead (key must be lowercase)
      const draggedItemTaskType = event.dataTransfer.types.find(
        dataKey => dataKey === `task-type-${rootElement.task_type_id}`
      )
      if (!draggedItemTaskType) {
        const item = this.draggedItems?.[0]
        const isAllowed = this.checkUserIsAllowed(item, rootElement)
        if (!isAllowed) {
          return
        }
      }
      event.currentTarget.classList.add('droppable')
    },

    onTaskDragOver(event) {
      event.preventDefault()
    },

    onTaskDragLeave(event) {
      event.target.classList.remove('droppable')
    },

    onTaskDrop(event, rootElement) {
      event.target.classList.remove('droppable')

      let item = this.draggedItems?.[0]
      if (!item) {
        const entityId = event.dataTransfer.getData('entityId')
        const taskTypeId = event.dataTransfer.getData('taskTypeId')
        if (!entityId || taskTypeId !== rootElement.task_type_id) {
          return // invalid task type
        }
        item = { entity_id: entityId }
      } else if (!this.checkUserIsAllowed(item, rootElement)) {
        return // invalid user rights
      }

      const position =
        this.timelineContentWrapper.scrollLeft +
        this.getClientX(event) -
        300 -
        this.cellWidth * 1.5
      const dayPosition = Math.floor(position / this.cellWidth)
      const dropDate = this.startDate.clone().add(dayPosition, 'days')
      const startDate = addBusinessDays(dropDate, 0, rootElement.daysOff)
      const endDate = item.estimation
        ? addBusinessDays(
            startDate,
            minutesToDays(this.organisation, item.estimation) - 1,
            rootElement.daysOff
          )
        : startDate

      // convert to schedule item
      item.full_entity_name = `${item.entity_type_name} / ${item.entity_name}`
      item.start_date = startDate.format('YYYY-MM-DD')
      item.due_date = endDate.format('YYYY-MM-DD')
      item.parentElement = rootElement

      this.$emit(
        'item-drop',
        item,
        rootElement,
        this.multiline ? this.refreshItemPositions : undefined
      )
    }
  },

  watch: {
    startDate() {
      this.resetScheduleSize()
    },
    endDate() {
      this.resetScheduleSize()
    },
    zoomLevel() {
      this.resetScheduleSize()
      this.refreshAllItemPositions()
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
    },
    currentProduction: {
      immediate: true,
      handler() {
        if (this.withMilestones) {
          this.loadMilestones(this.currentProduction)
        }
      }
    }
  }
}

/**
 * Set the position of items in the schedule, avoiding collisions.
 * Add a `line` attribute to each item.
 *
 * @param {Array<Object>} items - The list of items to position.
 * @param {Moment.unitOfTime} unitOfTime - A unit of time (eg. 'days', 'weeks', 'months', ...).
 * @returns {Array<Object>} The list of items with updated positions.
 */
const setItemPositions = (items, unitOfTime = 'days') => {
  if (!items?.length) {
    return
  }
  const attributeName = 'line'
  const matrix = []
  const minDate = moment
    .min(items.map(item => item.startDate))
    .clone()
    .startOf(unitOfTime)
  const maxDate = moment
    .max(items.map(item => item.endDate))
    .clone()
    .endOf(unitOfTime)
  const nbColumns = maxDate.diff(minDate, unitOfTime) + 1

  items.forEach(item => {
    const start = item.startDate
      .clone()
      .startOf(unitOfTime)
      .diff(minDate, unitOfTime)
    const end = item.endDate.clone().endOf(unitOfTime).diff(minDate, unitOfTime)
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
      background-image: url('@/assets/background/schedule-dark-1.svg');
    }
  }

  .schedule.zoom-level-1 {
    .timeline-content {
      background-image: url('@/assets/background/schedule-dark-1-weekend.svg');
    }
  }

  .schedule.zoom-level-2 {
    .timeline-content {
      background-image: url('@/assets/background/schedule-dark-2-weekend.svg');
    }
  }

  .schedule.zoom-level-3 {
    .timeline-content {
      background-image: url('@/assets/background/schedule-dark-3-weekend.svg');
    }
  }

  .schedule.zoom-level-4 {
    .timeline-content {
      background-image: url('@/assets/background/schedule-dark-4-weekend.svg');
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
          background: $dark-grey-2;
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
    z-index: 0;

    .day {
      display: inline-block;
      font-size: 0.8em;

      &.without-milestones {
        margin-top: 17px;
      }

      &.week {
        margin-top: 8px;
      }

      &.without-milestones.week {
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
        color: white;
        position: absolute;
        top: -1px;
        z-index: 10000;
      }

      .month-name {
        background: white;
        border-left: 2px solid black;
        bottom: 0;
        color: black;
        font-size: 0.9em;
        padding-bottom: 24px;
        padding-left: 0.5em;
        top: 10px;
        text-transform: uppercase;
        position: absolute;
        z-index: -1;
      }
    }
  }

  .timeline-content-wrapper {
    margin-left: 2px;
    overflow: auto;

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
            display: flex;
            align-items: center;
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

        .subchildren .subchild .timebar {
          position: absolute;
          color: var(--text-strong);
          height: 34px;
          line-height: 34px;
          font-size: 12px;
          padding: 0 5px;
          white-space: nowrap;
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

            &.timebar-subchildren {
              top: 0;
              height: 20px;
              font-size: 12px;
              font-weight: 600;
            }
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
    background-image: url('@/assets/background/schedule-white-1.svg');
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
    background-image: url('@/assets/background/schedule-white-1-weekend.svg');
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
    background-image: url('@/assets/background/schedule-white-2-weekend.svg');
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
    background-image: url('@/assets/background/schedule-white-3-weekend.svg');
  }
  .day {
    width: 60px;
  }
  .milestone-tooltip {
    left: 30px;
  }
}

.schedule.zoom-level-4 {
  .timeline-content {
    background-image: url('@/assets/background/schedule-white-4-weekend.svg');
  }
  .day {
    width: 120px;
  }
  .milestone-tooltip {
    left: 60px;
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

.children-loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.children {
  position: relative;
  margin-bottom: 1em;
  min-height: 40px;
}

.child {
  padding-bottom: 1px;
  padding-top: 1px;
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
  margin: 15px 10px;
}

.milestone {
  min-height: 48px;
  text-align: center;

  .day.new-week & {
    transform: translateY(16.5px);
  }

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
    .add-milestone {
      background: $light-green-light;
      display: block;
    }

    .day-name {
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
  width: 19px;
  height: 100%;
  line-height: 40px;
  text-align: center;
  color: $dark-grey-light;
  background-color: #f0f0f0;

  .dark & {
    color: $white;
    background-color: #43474d;
  }

  .day-off-icon {
    position: absolute;
    left: 0;
    top: 15px;
    width: 100%;
    z-index: 100;
  }
}

.day-name-off,
.weekend {
  background-color: rgba(200, 200, 200, 0.3);

  .dark & {
    background-color: rgba(200, 200, 200, 0.1);
  }
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

.droppable {
  background-color: rgba(var(--background-selectable-rgb), 0.5) !important;

  * {
    pointer-events: none;
  }
}

.subchildren {
  margin-top: 7px;
}

.subchild-label {
  display: flex;
  padding: 5px 5px 5px 15px;
  margin-left: 40px;
  margin-bottom: 10px;
  align-items: center;
  gap: 10px;
  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;
  font-weight: 600;
  color: var(--text);
}

.subchild {
  position: relative;
}

.subchild + .subchild {
  margin-top: 10px;
}

.subchild,
.subchild-label {
  box-shadow: 0 0 1px 0 $dark-grey-lighter;

  .dark & {
    box-shadow: 0 0 1px 0 $white;
  }
}

.subchild-label:nth-child(even),
.subchild:nth-child(odd) {
  background-color: rgba(0, 0, 0, 0.15);
}

.subchild-label:nth-child(odd),
.subchild:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.05);
}

.subchild {
  .day-off {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -1px;

    .day-off-icon {
      position: initial;
    }
  }

  &:nth-child(odd) {
    .day-off {
      background-color: #c4c4c4;

      .dark & {
        background-color: #515357;
      }
    }
  }

  &:nth-child(even) {
    .day-off {
      background-color: #e2e2e2;

      .dark & {
        background-color: #414349;
      }
    }
  }
}
</style>
