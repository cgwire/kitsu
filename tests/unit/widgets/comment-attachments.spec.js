import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { createRouter, createWebHistory } from 'vue-router'

// The project aliases `moment` to moment-with-locales, which moment-timezone
// does not augment under vitest, so `.tz()` is missing. Shim it to a no-op
// chainable for the date rendering used by the component.
vi.mock('moment', async () => {
  const actual = await vi.importActual('moment')
  const moment = actual.default || actual
  const wrap = m => {
    m.tz = () => m
    return m
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
  routes: [
    { path: '/tasks/:id', name: 'task', component: { template: '' } }
  ]
})

const makeComment = () => ({
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
  attachment_files: [
    { id: 'att-audio', extension: 'wav', name: 'voice.wav' },
    { id: 'att-video', extension: 'mp4', name: 'clip.mp4' },
    { id: 'att-file', extension: 'pdf', name: 'doc.pdf' }
  ]
})

const task = {
  id: 'task-1',
  task_type_id: 'task-type-1',
  project_id: 'production-1'
}

describe('Comment attachments', () => {
  let store, wrapper

  const mountComment = comment => {
    store = createStore({
      getters: {
        departmentMap: () => new Map(),
        isCurrentUserAdmin: () => false,
        isCurrentUserArtist: () => false,
        isCurrentUserClient: () => false,
        isCurrentUserManager: () => false,
        personMap: () => new Map([['person-1', { id: 'person-1' }]]),
        productionDepartmentIds: () => [],
        taskTypeMap: () =>
          new Map([['task-type-1', { id: 'task-type-1', for_entity: 'Shot' }]]),
        user: () => ({ id: 'person-1', timezone: 'Europe/Paris' })
      }
    })

    return shallowMount(Comment, {
      props: { comment, task, taskTypes: [], team: [] },
      global: {
        plugins: [i18n, store, router],
        stubs: {
          AttachmentAudioPlayer: true,
          AttachmentVideoPlayer: true,
          AddAttachmentModal: true,
          'at-ta': true
        }
      }
    })
  }

  beforeEach(async () => {
    await router.push('/tasks/task-1')
    await router.isReady()
    wrapper = mountComment(makeComment())
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
    const links = wrapper.findAll('a.flexrow')
    const pdfLink = links.find(link => link.text().includes('doc.pdf'))
    expect(pdfLink).toBeTruthy()
  })

  it('does not render a paperclip download link for audio/video files', () => {
    const linkText = wrapper
      .findAll('a.flexrow')
      .map(link => link.text())
      .join(' ')
    expect(linkText).not.toContain('voice.wav')
    expect(linkText).not.toContain('clip.mp4')
  })
})
