import { shallowMount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('moment', async () => {
  const actual = await vi.importActual('moment')
  const moment = actual.default || actual
  const wrap = value => {
    value.tz = () => value
    return value
  }
  const wrapped = (...args) => wrap(moment(...args))
  Object.assign(wrapped, moment)
  return { default: wrapped, ...wrapped }
})

import Comment from '@/components/widgets/Comment.vue'
import i18n from '@/lib/i18n'

import './setup'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/tasks/:id', name: 'task', component: { template: '' } }]
})

const makeComment = id => ({
  id,
  text: 'A comment',
  mentions: [],
  department_mentions: [],
  links: [],
  previews: [],
  replies: [],
  checklist: [],
  acknowledgements: [],
  person_id: 'person-1',
  object_id: 'task-1',
  created_at: '2026-06-06T10:00:00',
  task_status: { id: 'task-status-1', color: '#ECECEC' },
  person: { id: 'person-1', role: 'user' },
  attachment_files: []
})

const task = {
  id: 'task-1',
  task_type_id: 'task-type-1',
  project_id: 'production-1'
}

const store = createStore({
  getters: {
    departmentMap: () => new Map(),
    isCurrentUserAdmin: () => false,
    isCurrentUserArtist: () => false,
    isCurrentUserClient: () => false,
    isCurrentUserManager: () => false,
    personMap: () => new Map([['person-1', { id: 'person-1' }]]),
    productionDepartmentIds: () => [],
    taskTypeMap: () =>
      new Map([['task-type-1', { id: 'task-type-1', for_entity: 'Asset' }]]),
    user: () => ({ id: 'person-1', timezone: 'Europe/Paris' })
  }
})

const mountComment = id =>
  shallowMount(Comment, {
    attachTo: document.body,
    props: {
      comment: makeComment(id),
      isEditable: true,
      task,
      taskTypes: [],
      team: []
    },
    global: {
      plugins: [i18n, store, router],
      stubs: {
        AddAttachmentModal: true,
        'at-ta': true
      }
    }
  })

describe('Comment menu', () => {
  const wrappers = []

  beforeAll(async () => {
    await router.push('/tasks/task-1')
    await router.isReady()
  })

  afterEach(() => {
    wrappers.forEach(wrapper => wrapper.unmount())
    wrappers.length = 0
  })

  test('closes when clicking outside', async () => {
    const wrapper = mountComment('comment-1')
    wrappers.push(wrapper)
    await wrapper.find('.menu-icon-button').trigger('click')
    expect(wrapper.find('comment-menu-stub').exists()).toBe(true)

    document.body.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('comment-menu-stub').exists()).toBe(false)
  })

  test('closes when another comment menu opens', async () => {
    const first = mountComment('comment-1')
    const second = mountComment('comment-2')
    wrappers.push(first, second)
    await first.find('.menu-icon-button').trigger('click')

    const secondButton = second.find('.menu-icon-button')
    await secondButton.trigger('click')

    expect(first.find('comment-menu-stub').exists()).toBe(false)
    expect(second.find('comment-menu-stub').exists()).toBe(true)
  })
})
