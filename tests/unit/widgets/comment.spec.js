import { shallowMount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from 'vuex'

// The component imports bare `moment` without the timezone plugin loaded in
// this test, so `.tz()` is missing. Shim it to a no-op chainable for the date
// rendering used by the component.
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

import i18n from '@/lib/i18n'

import Comment from '@/components/widgets/Comment.vue'

import './setup'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/tasks/:id', name: 'task', component: { template: '' } }]
})

const makeComment = (overrides = {}) => ({
  id: 'comment-1',
  text: 'A comment',
  mentions: [],
  department_mentions: [],
  pinned: false,
  for_client: false,
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
  attachment_files: [],
  ...overrides
})

const task = {
  id: 'task-1',
  task_type_id: 'task-type-1',
  project_id: 'production-1'
}

// user is null for the anonymous guests of a shared playlist, so the guard has
// to survive that too.
const makeStore = ({ isAdmin = false, user = { id: 'person-1' } } = {}) =>
  createStore({
    getters: {
      dateFormat: () => 'dd/MM/yyyy',
      departmentMap: () => new Map(),
      isCurrentUserAdmin: () => isAdmin,
      isCurrentUserArtist: () => false,
      isCurrentUserClient: () => false,
      isCurrentUserManager: () => false,
      currentUserRoleForProduction: () => () => null,
      personMap: () => new Map([['person-1', { id: 'person-1' }]]),
      productionDepartmentIds: () => [],
      taskTypeMap: () =>
        new Map([['task-type-1', { id: 'task-type-1', for_entity: 'Asset' }]]),
      use12HourClock: () => false,
      user: () => user
    }
  })

const mountComment = ({
  comment = makeComment(),
  isEditable = true,
  storeOptions,
  attachTo
} = {}) =>
  shallowMount(Comment, {
    attachTo,
    props: { comment, isEditable, task, taskTypes: [], team: [] },
    global: {
      plugins: [i18n, makeStore(storeOptions), router],
      stubs: {
        AttachmentAudioPlayer: true,
        AttachmentVideoPlayer: true,
        AddAttachmentModal: true,
        'at-ta': true
      }
    }
  })

describe('Comment', () => {
  beforeAll(async () => {
    await router.push('/tasks/task-1')
    await router.isReady()
  })

  describe('attachments', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mountComment({
        comment: makeComment({
          attachment_files: [
            { id: 'att-audio', extension: 'wav', name: 'voice.wav' },
            { id: 'att-video', extension: 'mp4', name: 'clip.mp4' },
            { id: 'att-file', extension: 'pdf', name: 'doc.pdf' }
          ]
        }),
        isEditable: false
      })
    })

    it('renders an audio player for audio attachments', () => {
      expect(
        wrapper.findComponent({ name: 'AttachmentAudioPlayer' }).exists()
      ).toBe(true)
    })

    it('renders a video player for video attachments', () => {
      expect(
        wrapper.findComponent({ name: 'AttachmentVideoPlayer' }).exists()
      ).toBe(true)
    })

    it('renders a paperclip download link for other files', () => {
      const links = wrapper.findAll('a.attachment-file-link')
      const pdfLink = links.find(link => link.text().includes('doc.pdf'))
      expect(pdfLink).toBeTruthy()
    })

    it('does not render a paperclip download link for audio/video files', () => {
      const linkText = wrapper
        .findAll('a.attachment-file-link')
        .map(link => link.text())
        .join(' ')
      expect(linkText).not.toContain('voice.wav')
      expect(linkText).not.toContain('clip.mp4')
    })
  })

  describe('menu', () => {
    const wrappers = []

    const mountAttached = id => {
      const wrapper = mountComment({
        comment: makeComment({ id }),
        attachTo: document.body
      })
      wrappers.push(wrapper)
      return wrapper
    }

    afterEach(() => {
      wrappers.forEach(wrapper => wrapper.unmount())
      wrappers.length = 0
    })

    test('closes when clicking outside', async () => {
      const wrapper = mountAttached('comment-1')
      await wrapper.find('.menu-icon-button').trigger('click')
      expect(wrapper.find('comment-menu-stub').exists()).toBe(true)

      document.body.click()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('comment-menu-stub').exists()).toBe(false)
    })

    test('closes when another comment menu opens', async () => {
      const first = mountAttached('comment-1')
      const second = mountAttached('comment-2')
      await first.find('.menu-icon-button').trigger('click')

      await second.find('.menu-icon-button').trigger('click')

      expect(first.find('comment-menu-stub').exists()).toBe(false)
      expect(second.find('comment-menu-stub').exists()).toBe(true)
    })
  })

  describe('reply delete', () => {
    const mountWithReply = (replyAuthorId, storeOptions) =>
      mountComment({
        comment: makeComment({
          replies: [
            {
              id: 'reply-1',
              text: 'A reply',
              mentions: [],
              department_mentions: [],
              person_id: replyAuthorId,
              person: { id: replyAuthorId, role: 'user' },
              date: '2026-06-06T11:00:00'
            }
          ]
        }),
        storeOptions
      })

    test('renders a reply for a non-admin reading someone else', () => {
      const wrapper = mountWithReply('person-2')
      expect(wrapper.text()).toContain('A reply')
      expect(wrapper.find('.reply-delete').exists()).toBe(false)
    })

    test('offers the delete button to the reply author', () => {
      const wrapper = mountWithReply('person-1')
      expect(wrapper.find('.reply-delete').exists()).toBe(true)
    })

    test('offers the delete button to an admin', () => {
      const wrapper = mountWithReply('person-2', { isAdmin: true })
      expect(wrapper.find('.reply-delete').exists()).toBe(true)
    })

    test('renders a reply for an anonymous guest', () => {
      const wrapper = mountWithReply('person-2', { user: null })
      expect(wrapper.text()).toContain('A reply')
      expect(wrapper.find('.reply-delete').exists()).toBe(false)
    })
  })
})
