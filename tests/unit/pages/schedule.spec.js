import { shallowMount, createLocalVue } from '@vue/test-utils'
import vuescroll from 'vue-scroll'
import Vuex from 'vuex'
import moment from 'moment'

import i18n from '@/lib/i18n'
import { range } from '@/lib/time'

import Schedule from '@/components/pages/schedule/Schedule'
import productionStoreFixture from '../fixtures/production-store.js'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(vuescroll)

describe('Schedule', () => {
  let store

  let newsStore
  let scheduleStore
  let taskStore
  let taskStatusStore
  let taskTypeStore
  let userStore
  let wrapper

  beforeEach(() => {
    taskStore = {
      getters: {
        taskTypeMap: () => new Map(Object.entries({
          'task-type-1': {
            name: 'Modeling'
          }
        })),
        taskStatusMap: () => new Map(Object.entries({
          'task-status-1': {
            name: 'WIP',
            is_retake: false,
            is_done: false
          },
          'task-status-2': {
            name: 'Retake',
            is_retake: true,
            is_done: false
          },
          'task-status-3': {
            name: 'Done',
            is_retake: false,
            is_done: true
          }
        }))
      },
      actions: {
        loadTask: jest.fn()
      }
    },
    taskStatusStore = {
      getters: {
        taskStatus: () => []
      },
      actions: {
      }
    },
    taskTypeStore = {
      getters: {
        taskTypes: () => []
      },
      actions: {
      }
    },
    userStore = {
      getters: {
        user: () => ({ id: 'user-1', timezone: 'Europe/Paris' }),
        isCurrentUserAdmin: () => true,
        isCurrentUserManager: () => true
      },
      actions: {}
    }
    scheduleStore = {
      getters: {
        milestones: () => ({})
      },
      actions: {
      }
    }

    store = new Vuex.Store({
      strict: true,
      modules: {
        tasks: taskStore,
        productions: { ...productionStoreFixture },
        taskStatus: taskStatusStore,
        taskTypes: taskTypeStore,
        user: userStore,
        schedule: scheduleStore
      }
    })

    wrapper = shallowMount(Schedule, {
      propsData: {
        startDate: moment('2019-07-01', 'YYYY-MM-DD'),
        endDate: moment('2020-01-01', 'YYYY-MM-DD'),
        zoomLevel: 3
      },
      store,
      localVue,
      i18n
    })
  })

  describe('Mount', () => {
    test('mounted', () => {
    })
  })

  describe('Getters', () => {
    test('cellWidth', async () => {
      let width = wrapper.vm.cellWidth
      expect(width).toEqual(60)
      await wrapper.setProps({ zoomLevel: 1 })
      width = wrapper.vm.cellWidth
      expect(width).toEqual(20)
    })

    test('daysToDisplay', () => {
      const days = wrapper.vm.daysAvailable
      expect(days).toHaveLength(185)
      expect(days[4].newMonth).toBeFalsy()
      expect(days[4].newWeek).toBeFalsy()
      expect(days[4].weekend).toBeFalsy()
      expect(days[5].weekend).toBeTruthy()
      expect(days[6].weekend).toBeTruthy()
      expect(days[7].newWeek).toBeTruthy()
      expect(days[31].newMonth).toBeTruthy()
    })

    test('displayedDays', () => {
      const days = wrapper.vm.displayedDays
      expect(days[4].day()).toEqual(5)
      expect(days[5].day()).toEqual(6)
      expect(days[6].day()).toEqual(0)
      expect(days[7].day()).toEqual(1)
    })

    test('nbDisplayedDays', () => {
      const nbDays = wrapper.vm.nbDisplayedDays
      expect(nbDays).toEqual(185)
    })

    test('displayedWeeks', () => {
      const weeks = wrapper.vm.weeksAvailable
      expect(weeks[4].day()).toEqual(1)
      expect(weeks[5].day()).toEqual(1)
      expect(weeks[6].day()).toEqual(1)
      expect(weeks[7].day()).toEqual(1)
      expect(weeks[7].format('YYYY-MM-DD')).toEqual('2019-08-19')
    })

    test('displayedWeekIndex', () => {
      const index = wrapper.vm.displayedWeeksIndex
      expect(index['2019-08-19']).toEqual(7)
    })

    test('displayedDaysIndex', () => {
      const daysIndex = wrapper.vm.displayedDaysIndex
      expect(daysIndex['2019-08-01']).toEqual(31)
      expect(daysIndex['2019-07-01']).toEqual(0)
      expect(daysIndex['2019-08-15']).toEqual(45)
    })

    test('totalManDays', () => {
      expect(wrapper.vm.totalManDays).toEqual(0)
    })

    test('scheduleClass', () => {
      expect(wrapper.vm.scheduleClass).toEqual({
        schedule: true,
        unselectable: true,
        'zoom-level-3': true
      })
    })

    test.skip('timelineStyle', () => {
    })

    test('isWeekMode', async () => {
      await wrapper.setProps({ zoomLevel: 3 })
      expect(wrapper.vm.isWeekMode).toEqual(false)
      await wrapper.setProps({ zoomLevel: 0 })
      expect(wrapper.vm.isWeekMode).toEqual(true)
    })

    test('timelinePositionStyle', () => {
      wrapper.setProps({ zoomLevel: 3 })
      expect(wrapper.vm.timelinePositionStyle).toEqual({
        width: '60px'
      })
    })

    test('timelineTodayPositionStyle', () => {
      const left = wrapper.vm.dateDiff(wrapper.vm.startDate, moment()) * 60
      wrapper.setProps({ zoomLevel: 3 })
      expect(wrapper.vm.timelineTodayPositionStyle).toEqual({
        display: 'none',
        width: '60px',
        left: `${left}px`
      })
    })

    test('milestoneTooltipStyle', () => {
      wrapper.setProps({ zoomLevel: 3 })
      expect(wrapper.vm.milestoneTooltipStyle).toEqual({
        left: '-40px'
      })
    })
  })

  describe('Methods', () => {
    describe('Layout', () => {
      test('resetScheduleSize', () => {
        wrapper.vm.resetScheduleSize()
        expect(wrapper.vm.timelineContent.style.width).toEqual('11100px')
        expect(wrapper.vm.timelineContentWrapper.style.height)
          .toEqual('-250px')
        expect(wrapper.vm.entityList.style.height).toEqual('-169px')
      })
    })

    describe('Events', () => {
      const initialEvent = {
        clientX: 200
      }
      const event = {
        clientX: 100,
        movementX: 100,
        movementY: 50
      }
      let timeElement = null

      beforeEach(() => {
        timeElement = {
          startDate: moment('2019-08-15', 'YYYY-MM-DD'),
          endDate: moment('2019-09-03', 'YYYY-MM-DD'),
          editable: true
        }
      })

      test('changeDates', async () => {
        wrapper.vm.moveTimebar(timeElement, initialEvent)
        wrapper.vm.changeDates(event)
        expect(wrapper.vm.currentElement.startDate.format('YYYY-MM-DD'))
          .toEqual(moment('2019-08-13').format('YYYY-MM-DD'))
        expect(wrapper.vm.currentElement.endDate.format('YYYY-MM-DD'))
          .toEqual(moment('2019-09-01').format('YYYY-MM-DD'))

        await wrapper.setProps({ zoomLevel: 0 })
        wrapper.vm.moveTimebar(timeElement, initialEvent)
        wrapper.vm.changeDates(event)
        expect(wrapper.vm.currentElement.startDate.format('YYYY-MM-DD'))
          .toEqual(moment('2019-07-08').format('YYYY-MM-DD'))
        expect(wrapper.vm.currentElement.endDate.format('YYYY-MM-DD'))
          .toEqual(moment('2019-07-22').format('YYYY-MM-DD'))
      })

      test('changeStartDate', async () => {
        wrapper.vm.moveTimebarLeftSide(timeElement, initialEvent)
        wrapper.vm.changeStartDate(event)
        expect(wrapper.vm.currentElement.startDate.format('YYYY-MM-DD'))
          .toEqual(moment('2019-08-13').format('YYYY-MM-DD'))

        await wrapper.setProps({ zoomLevel: 0 })
        wrapper.vm.moveTimebarLeftSide(timeElement, initialEvent)
        wrapper.vm.changeStartDate(event)
        expect(wrapper.vm.currentElement.startDate.format('YYYY-MM-DD'))
          .toEqual(moment('2019-07-08').format('YYYY-MM-DD'))
      })
      test('changeEndDate', async () => {
        wrapper.vm.moveTimebarRightSide(timeElement, initialEvent)
        wrapper.vm.changeEndDate(event)
        expect(wrapper.vm.currentElement.endDate.format('YYYY-MM-DD'))
          .toEqual(moment('2019-09-01').format('YYYY-MM-DD'))

        await wrapper.setProps({ zoomLevel: 0 })
        wrapper.vm.moveTimebarRightSide(timeElement, initialEvent)
        wrapper.vm.changeEndDate(event)
        expect(wrapper.vm.currentElement.endDate.format('YYYY-MM-DD'))
          .toEqual(moment('2019-08-12').format('YYYY-MM-DD'))
      })
      test('scrollScheduleHeight', () => {
        wrapper.vm.timelineContentWrapper.scrollLeft = 150
        wrapper.vm.timelineHeader.scrollLeft = 150
        wrapper.vm.scrollScheduleLeft(event)
        expect(wrapper.vm.timelineContentWrapper.scrollLeft).toEqual(50)
        expect(wrapper.vm.timelineHeader.scrollLeft).toEqual(50)
      })
      test('scrollScheduleTop', () => {
        wrapper.vm.timelineContentWrapper.scrollTop = 100
        wrapper.vm.entityList.scrollTop = 100
        wrapper.vm.scrollScheduleTop(event)
        expect(wrapper.vm.timelineContentWrapper.scrollTop).toEqual(50)
        expect(wrapper.vm.entityList.scrollTop).toEqual(50)
      })

      test.skip('onMouseMove', () => {
      })
      test.skip('updatePositionBarPosition', () => {
      })
      test.skip('isValidItemDates', () => {
      })
      test.skip('onTimelineScroll', () => {
      })
      test.skip('scrollScheduleLeft', () => {
      })
      test.skip('scrollScrollToToday', () => {
      })
    })

    describe('Browsing', () => {
      const timeElement = {
        startDate: moment('2019-08-15', 'YYYY-MM-DD'),
        endDate: moment('2019-09-01', 'YYYY-MM-DD'),
        editable: true
      }
      const event = { clientX: 100 }
      test('startBrowsing', () => {
        wrapper.vm.startBrowsing()
        expect(wrapper.vm.isBrowsingX).toBeTruthy()
        expect(wrapper.vm.isBrowsingY).toBeTruthy()
        wrapper.vm.stopBrowsing()
        wrapper.vm.moveTimebar(timeElement, event)
        expect(wrapper.vm.isBrowsingX).toBeFalsy()
        expect(wrapper.vm.isBrowsingY).toBeFalsy()
        wrapper.vm.startBrowsing()
        expect(wrapper.vm.isBrowsingX).toBeFalsy()
        expect(wrapper.vm.isBrowsingY).toBeFalsy()
      })
      test('startBrowsingX', () => {
        wrapper.vm.startBrowsingX()
        expect(wrapper.vm.isBrowsingX).toBeTruthy()
      })
      test('startBrowsingY', () => {
        wrapper.vm.startBrowsingY()
        expect(wrapper.vm.isBrowsingY).toBeTruthy()
      })
      test.skip('stopBrowsing', () => {
      })
    })

    describe('Timebars', () => {
      const timeElement = {
        startDate: moment('2019-08-15', 'YYYY-MM-DD'),
        endDate: moment('2019-09-01', 'YYYY-MM-DD'),
        editable: true
      }
      const event = { clientX: 100 }
      test('moveTimebar', () => {
        wrapper.vm.moveTimebar(timeElement, event)
        expect(wrapper.vm.isChangeDates).toBeTruthy()
        expect(wrapper.vm.currentElement).toEqual(timeElement)
        expect(wrapper.vm.initialClientX).toEqual(event.clientX)
        expect(wrapper.vm.lastStartDate.format('YYYY-MM-DD')).toEqual(
          timeElement.startDate.format('YYYY-MM-DD')
        )
      })
      test('moveTimebarLeftSide', () => {
        wrapper.vm.moveTimebarLeftSide(timeElement, event)
        expect(wrapper.vm.isChangeStartDate).toBeTruthy()
        expect(wrapper.vm.currentElement).toEqual(timeElement)
        expect(wrapper.vm.initialClientX).toEqual(event.clientX)
        expect(wrapper.vm.lastStartDate.format('YYYY-MM-DD')).toEqual(
          timeElement.startDate.format('YYYY-MM-DD')
        )
      })
      test('moveTimebarRightSide', () => {
        wrapper.vm.moveTimebarRightSide(timeElement, event)
        expect(wrapper.vm.currentElement).toEqual(timeElement)
        expect(wrapper.vm.isChangeEndDate).toBeTruthy()
        expect(wrapper.vm.initialClientX).toEqual(event.clientX)
        expect(wrapper.vm.lastEndDate.format('YYYY-MM-DD')).toEqual(
          timeElement.endDate.format('YYYY-MM-DD')
        )
      })
    })

    describe('Helpers', () => {
      test('businessDiff', () => {
        let diff = wrapper.vm.businessDiff(
          moment('2019-07-01', 'YYYY-MM-DD'),
          moment('2019-08-01', 'YYYY-MM-DD')
        )
        expect(diff).toEqual(23)
        diff = wrapper.vm.businessDiff(
          moment('2019-07-16', 'YYYY-MM-DD'),
          moment('2019-08-01', 'YYYY-MM-DD')
        )
        expect(diff).toEqual(12)
        diff = wrapper.vm.businessDiff(
          moment('2019-07-15', 'YYYY-MM-DD'),
          moment('2019-08-01', 'YYYY-MM-DD')
        )
        expect(diff).toEqual(13)
        diff = wrapper.vm.businessDiff(
          moment('2019-07-12', 'YYYY-MM-DD'),
          moment('2019-08-01', 'YYYY-MM-DD')
        )
        expect(diff).toEqual(14)
        diff = wrapper.vm.businessDiff(
          moment('2019-07-01', 'YYYY-MM-DD'),
          moment('2019-07-12', 'YYYY-MM-DD')
        )
        expect(diff).toEqual(9)
        diff = wrapper.vm.businessDiff(
          moment('2019-07-01', 'YYYY-MM-DD'),
          moment('2019-07-15', 'YYYY-MM-DD')
        )
        expect(diff).toEqual(10)
        diff = wrapper.vm.businessDiff(
          moment('2019-07-01', 'YYYY-MM-DD'),
          moment('2019-07-01', 'YYYY-MM-DD')
        )
        expect(diff).toEqual(0)
        diff = wrapper.vm.businessDiff(
          moment('2019-09-16', 'YYYY-MM-DD'),
          moment('2019-10-23', 'YYYY-MM-DD')
        )
        expect(diff).toEqual(27)
        diff = wrapper.vm.businessDiff(
          moment('2019-09-09', 'YYYY-MM-DD', 'en'),
          moment('2019-10-01', 'YYYY-MM-DD', 'en')
        )
        expect(diff).toEqual(16)
        diff = wrapper.vm.businessDiff(
          moment('2019-08-15', 'YYYY-MM-DD'),
          moment('2019-09-01', 'YYYY-MM-DD')
        )
        expect(diff).toEqual(13)

        moment.locale('fr')
        diff = wrapper.vm.businessDiff(
          moment('2019-07-01', 'YYYY-MM-DD'),
          moment('2019-08-01', 'YYYY-MM-DD')
        )
        expect(diff).toEqual(23)
      })
    })

    describe('Styles', () => {
      test('dayClass', () => {
        const days = wrapper.vm.daysAvailable
        let cssClass = wrapper.vm.dayClass(days[0])
        expect(cssClass).toEqual({
          'day-name': true,
          'new-week': true,
          'new-month': true,
          weekend: false
        })
        cssClass = wrapper.vm.dayClass(days[2], 2)
        expect(cssClass).toEqual({
          'day-name': true,
          'new-week': false,
          'new-month': false,
          weekend: false
        })
      })

      test('dayStyle', () => {
        const days = wrapper.vm.daysAvailable
        let dayStyle = wrapper.vm.dayStyle(days[6])
        expect(dayStyle).toEqual({
          'min-width': '60px',
          'max-width': '60px'
        })
        dayStyle = wrapper.vm.dayStyle(days[2])
        expect(dayStyle).toEqual({
          'min-width': '60px',
          'max-width': '60px'
        })
      })

      test('entityLineStyle', () => {
        const entityLineStyle = wrapper.vm.entityLineStyle(
          { color: 'red' }, true
        )
        expect(entityLineStyle).toEqual({
          'border-bottom': '1px solid red',
          'border-left': '1px solid red',
          'border-top': '1px solid red'
        })
      })

      test('timebarStyle', () => {
        let timebarStyle = wrapper.vm.timebarStyle({
          startDate: moment('2019-08-15', 'YYYY-MM-DD'),
          endDate: moment('2019-09-01', 'YYYY-MM-DD'),
          editable: true
        })
        expect(timebarStyle).toEqual({
          cursor: 'ew-resize',
          left: (45 * 60 + 3) + 'px',
          width: 18 * 60 - 6 + 'px'
        })
        timebarStyle = wrapper.vm.timebarStyle({
          startDate: moment('2019-08-15', 'YYYY-MM-DD'),
          endDate: moment('2019-09-01', 'YYYY-MM-DD'),
          editable: false
        })
        expect(timebarStyle).toEqual({
          cursor: 'default',
          left: (45 * 60 + 3) + 'px',
          width: 18 * 60 - 6 + 'px'
        })
      })

      test.skip('timebarStyle', () => {
      })

      test('getTimebarLeft', () => {
        const timebarLeft = wrapper.vm.getTimebarLeft({
          startDate: moment('2019-08-15', 'YYYY-MM-DD'),
          endDate: moment('2019-09-01', 'YYYY-MM-DD')
        })
        expect(timebarLeft).toEqual(45 * 60 + 3)
      })

      test('getTimebarWidth', () => {
        const timebarWidth = wrapper.vm.getTimebarWidth({
          startDate: moment('2019-08-15', 'YYYY-MM-DD'),
          endDate: moment('2019-09-01', 'YYYY-MM-DD')
        })
        expect(timebarWidth).toEqual(18 * 60 - 6)
      })

      test('getTimebarWidth', async () => {
        await wrapper.setProps({ zoomLevel: 0 })
        const timebarWidth = wrapper.vm.getTimebarWidth({
          startDate: moment('2019-08-15', 'YYYY-MM-DD'),
          endDate: moment('2019-09-01', 'YYYY-MM-DD')
        })
        expect(timebarWidth).toEqual(2 * 30 - 6)
      })
    })
  })
})
