import { shallowMount, createLocalVue } from '@vue/test-utils'
import vuescroll from 'vue-scroll'
import Vuex from 'vuex'
import i18n from '../../../src/lib/i18n'
import ProductionNewsFeed from '../../../src/components/pages/ProductionNewsFeed'
import { range } from '../../../src/lib/time'
import productionStoreFixture from '../fixtures/production-store.js'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(vuescroll)


describe('ProductionNewsFeed', () => {
  let store
  let newsStore
  let personStore
  let taskStore
  let taskStatusStore
  let taskTypeStore
  let userStore
  let wrapper

  beforeEach(() => {
    newsStore = {
      getters: {
        newsList: () => range(1, 50).map(i => ({ id: 'news-' + i })),
        newsListByDay: () => []
      },
      actions: {
        loadNews: jest.fn(),
        loadMoreNews: jest.fn()
      }
    }
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
    userStore = {
      getters: {
        user: () => ({ id: 'user-1', timezone: 'Europe/Paris' })
      },
      actions: {}
    }
    personStore = {
      getters: {
        personMap: () => ({
          'person-1': {
            id: 'person-1',
            name: 'Jhon Doe'
          },
          'person-2': {
            id: 'person-1',
            name: 'Emma Doe'
          }
        })
      },
      actions: {}
    }


    store = new Vuex.Store({
      strict: true,
      modules: {
        tasks: taskStore,
        news: newsStore,
        persons: personStore,
        productions: { ...productionStoreFixture },
        taskStatus: taskStatusStore,
        taskTypes: taskTypeStore,
        user: userStore
      }
    })

    wrapper = shallowMount(ProductionNewsFeed, {
      store,
      localVue,
      i18n
    })
  })


  describe('Mount', () => {
    test('list is there', () => {
      const newsLines = wrapper.findAll('.news-line')
      // expect(newsLines.length).toEqual(50)
    })
  })

  describe('Getters', () => {
    test('params', () => {
      expect(wrapper.vm.params).toEqual({
        only_preview: false,
        page: 1,
        page_size: 50,
        productionId: "production-1",
        task_status_id: undefined,
        task_type_id: undefined,
        person_id: undefined
      })
      wrapper.vm.previewMode = 'previews'
      wrapper.vm.taskStatusId = 'task-status-1'
      wrapper.vm.taskTypeId = 'task-type-1'
      wrapper.vm.currentPage = 2
      expect(wrapper.vm.params).toEqual({
        only_preview: true,
        page: 2,
        page_size: 6,
        productionId: "production-1",
        task_status_id: 'task-status-1',
        task_type_id: 'task-type-1'
      })
      wrapper.vm.previewMode = 'comments'
      wrapper.vm.currentPage = 1
      wrapper.vm.taskStatusId = null
      wrapper.vm.taskTypeId = null
    })
  })

  describe('Methods', () => {

    test('loadFollowingNews', () => {
      wrapper.vm.loading.more = false
      wrapper.vm.loadFollowingNews()
      expect(newsStore.actions.loadMoreNews).toHaveBeenCalled()
      expect(wrapper.vm.loading.more).toBeTruthy()
      expect(wrapper.vm.currentPage).toEqual(2)
      wrapper.vm.loading.more = true
      wrapper.vm.loadFollowingNews()
      expect(newsStore.actions.loadMoreNews.mock.calls.length).toEqual(1)
      expect(wrapper.vm.currentPage).toEqual(2)
      wrapper.vm.loading.more = false
    })

    test('formatDay', () => {
      const formattedTime = wrapper.vm.formatDay('2019-04-02T12:23:20')
      expect(formattedTime).toEqual('April 2, 2019')
    })

    test('formatTime', () => {
      const formattedTime = wrapper.vm.formatTime('2019-04-02T12:23:20')
      expect(formattedTime).toEqual('14:23')
    })

    test('buildTaskFromNews', () => {
      const task = wrapper.vm.buildTaskFromNews({
        id: 'news-1',
        task_id: 'task-1',
        task_status_id: 'task-status-1',
        task_type_id: 'task-type-1',
        episode_id: 'episode-1'
      })
      expect(task).toEqual({
        id: 'task-1',
        task_status_id: 'task-status-1',
        task_type_id: 'task-type-1',
        episode_id: 'episode-1'
      })
    })

    test('buildTaskTypeFromNews', () => {
      const taskType = wrapper.vm.buildTaskTypeFromNews({
        task_type_id: 'task-type-1',
        episode_id: 'episode-1'
      })
      expect(taskType.name).toEqual('Modeling')
      expect(taskType.episode_id).toEqual('episode-1')
    })

    test('onNewsSelected', () => {
      wrapper.vm.onNewsSelected({
        id: 'news-1',
        taskId: 'task-1'
      })
      expect(taskStore.actions.loadTask).toHaveBeenCalled()
      expect(wrapper.vm.loading.currentTask).toBeTruthy()
    })

    test('init', () => {
      wrapper.vm.currentPage = 2
      wrapper.vm.currentTask = { id: 'task-1'}
      wrapper.vm.errors.news = true
      wrapper.vm.init()
      expect(wrapper.vm.loading.news).toBeTruthy()
      expect(wrapper.vm.currentPage).toEqual(1)
      expect(wrapper.vm.errors.news).toBeFalsy()
      expect(wrapper.vm.currentTask).toEqual(null)
      expect(newsStore.actions.loadNews).toHaveBeenCalled()
    })

    test('getPreviewPath', () => {
      const news = {
        id: 'news-1',
        preview_file_id: 'preview-1',
        preview_file_extension: 'mp4'
      }
      const path = wrapper.vm.getPreviewPath(news)
      expect(path).toEqual(
        '/api/pictures/originals/preview-files/preview-1.mp4'
      )
    })

    test('getPreviewDlPath', () => {
      const news = {
        id: 'news-1',
        preview_file_id: 'preview-1',
        preview_file_extension: 'mp4'
      }
      const path = wrapper.vm.getPreviewDlPath(news)
      expect(path).toEqual(
        '/api/pictures/originals/preview-files/preview-1/download'
      )
    })

    test('hasRetakeValue', () => {
      let news = {
        id: 'news-1',
        preview_file_id: 'preview-1',
        preview_file_extension: 'mp4',
        task_status_id: 'task-status-1',
        change: true
      }
      expect(wrapper.vm.hasRetakeValue(news)).toBeFalsy()
      news = {
        id: 'news-2',
        preview_file_id: 'preview-2',
        preview_file_extension: 'mp4',
        task_status_id: 'task-status-2',
        change: true
      }
      expect(wrapper.vm.hasRetakeValue(news)).toBeTruthy()
    })

    test('hasDoneValue', () => {
      let news = {
        id: 'news-1',
        preview_file_id: 'preview-1',
        preview_file_extension: 'mp4',
        task_status_id: 'task-status-1',
        change: true
      }
      expect(wrapper.vm.hasDoneValue(news)).toBeFalsy()
      news = {
        id: 'news-2',
        preview_file_id: 'preview-2',
        preview_file_extension: 'mp4',
        task_status_id: 'task-status-3',
        change: true
      }
      expect(wrapper.vm.hasDoneValue(news)).toBeTruthy()
    })

    test('onBodyScroll', () => {
      wrapper.vm.loading.more = false
      wrapper.vm.onBodyScroll(null, { scrollTop: -100 })
      expect(newsStore.actions.loadMoreNews).not.toHaveBeenCalled()
      wrapper.vm.onBodyScroll(null, { scrollTop: 500 })
      expect(newsStore.actions.loadMoreNews).toHaveBeenCalled()
    })
  })
})
