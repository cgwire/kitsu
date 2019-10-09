import { shallowMount, createLocalVue } from '@vue/test-utils'
import vuescroll from 'vue-scroll'
import Vuex from 'vuex'
import moment from 'moment'

import i18n from '../../../src/lib/i18n'
import { range } from '../../../src/lib/time'

import Schedule from '../../../src/components/pages/schedule/Schedule'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(vuescroll)


describe('Schedule', () => {
  let store

  let newsStore
  let productionStore
  let scheduleStore
  let taskStore
  let taskStatusStore
  let taskTypeStore
  let userStore
  let wrapper

  beforeEach(() => {
    taskStore = {
      getters: {
        taskTypeMap: () => ({
          'task-type-1': {
            name: 'Modeling'
          }
        }),
        taskStatusMap: () => ({
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
        })
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
    productionStore = {
      getters: {
        currentProduction: () => ({ id: 'production-1', name: 'Prod 1' })
      },
      actions: {
      }
    }
    userStore = {
      getters: {
        user: () => ({ id: 'user-1', timezone: 'Europe/Paris' }),
        isCurrentUserAdmin: () => true
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
        productions: productionStore,
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
    test('daysToDisplay', () => {
      const days = wrapper.vm.daysAvailable
      expect(days.length).toEqual(185)
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
      expect(days[5].day()).toEqual(1)
    })

    test('nbDisplayedDays', () => {
      const nbDays = wrapper.vm.nbDisplayedDays
      expect(nbDays).toEqual(133)
    })

    test('displayedDaysIndex', () => {
      const daysIndex = wrapper.vm.displayedDaysIndex
      expect(daysIndex['2019-08-01']).toEqual(23)
      expect(daysIndex['2019-07-01']).toEqual(0)
      expect(daysIndex['2019-08-15']).toEqual(33)
    })
  })

  describe('Methods', () => {

    describe('Layout', () => {
      test('resetScheduleSize', () => {
        wrapper.vm.resetScheduleSize()
        expect(wrapper.vm.timelineContent.style.width).toEqual('7980px')
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

      test('changeDates', () => {
        wrapper.vm.moveTimebar(timeElement, initialEvent)
        wrapper.vm.changeDates(event)
        expect(wrapper.vm.currentElement.startDate.format('YYYY-MM-DD'))
          .toEqual(moment('2019-08-13').format('YYYY-MM-DD'))
        expect(wrapper.vm.currentElement.endDate.format('YYYY-MM-DD'))
          .toEqual(moment('2019-08-30').format('YYYY-MM-DD'))
      })
      test('changeStartDate', () => {
        wrapper.vm.moveTimebarLeftSide(timeElement, initialEvent)
        wrapper.vm.changeStartDate(event)
        expect(wrapper.vm.currentElement.startDate.format('YYYY-MM-DD'))
          .toEqual(moment('2019-08-13').format('YYYY-MM-DD'))
      })
      test('changeEndDate', () => {
         wrapper.vm.moveTimebarRightSide(timeElement, initialEvent)
         wrapper.vm.changeEndDate(event)
         expect(wrapper.vm.currentElement.endDate.format('YYYY-MM-DD'))
           .toEqual(moment('2019-08-30').format('YYYY-MM-DD'))
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
          'new-month': true
        })
        cssClass = wrapper.vm.dayClass(days[2], 2)
        expect(cssClass).toEqual({
          'day-name': true,
          'new-week': false,
          'new-month': false
        })
      })

      test('dayStyle', () => {
        const days = wrapper.vm.daysAvailable
        let dayStyle = wrapper.vm.dayStyle(days[6])
        expect(dayStyle).toEqual({
          'min-width': '0px',
          'max-width': '0px'
        })
        dayStyle = wrapper.vm.dayStyle(days[2])
        expect(dayStyle).toEqual({
          'min-width': '60px',
          'max-width': '60px'
        })
      })

      test('entityLineStyle', () => {
        let entityLineStyle = wrapper.vm.entityLineStyle({ color: 'red' })
        expect(entityLineStyle).toEqual({
          'background-color': 'red'
        })
      })

      test('timebarStyle', () => {
        let timebarStyle = wrapper.vm.timebarStyle({
          startDate: moment('2019-08-15', 'YYYY-MM-DD'),
          endDate: moment('2019-09-01', 'YYYY-MM-DD'),
          editable: true
        })
        expect(timebarStyle).toEqual({
          'cursor': 'ew-resize',
          'left': (33 * 60 + 5) + 'px',
          'width': 14 * 60 - 10 + 'px'
        })
        timebarStyle = wrapper.vm.timebarStyle({
          startDate: moment('2019-08-15', 'YYYY-MM-DD'),
          endDate: moment('2019-09-01', 'YYYY-MM-DD'),
          editable: false
        })
        expect(timebarStyle).toEqual({
          'cursor': 'default',
          'left': (33 * 60 + 5) + 'px',
          'width': 14 * 60 - 10 + 'px'
        })
      })

      test('getTimebarLeft', () => {
        let timebarLeft = wrapper.vm.getTimebarLeft({
          startDate: moment('2019-08-15', 'YYYY-MM-DD'),
          endDate: moment('2019-09-01', 'YYYY-MM-DD')
        })
        expect(timebarLeft).toEqual(33 * 60 + 5)
      })

      test('getTimebarWidth', () => {
        let timebarWidth = wrapper.vm.getTimebarWidth({
          startDate: moment('2019-08-15', 'YYYY-MM-DD'),
          endDate: moment('2019-09-01', 'YYYY-MM-DD')
        })
        expect(timebarWidth).toEqual(14 * 60 - 10)
      })
    })
  })
})
