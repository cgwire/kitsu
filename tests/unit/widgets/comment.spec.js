import { shallowMount } from '@vue/test-utils'
import { RouterLink, createRouter, createWebHistory } from 'vue-router'
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
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'

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
const makeStore = ({
  isAdmin = false,
  isClient = false,
  persons = [],
  user = { id: 'person-1' }
} = {}) =>
  createStore({
    getters: {
      canValidatePreviewFiles: () => () => false,
      dateFormat: () => 'dd/MM/yyyy',
      departmentMap: () => new Map(),
      isCurrentUserAdmin: () => isAdmin,
      isCurrentUserArtist: () => false,
      isCurrentUserClient: () => isClient,
      isCurrentUserManager: () => false,
      currentUserRoleForProduction: () => () => null,
      personMap: () =>
        new Map([
          ['person-1', { id: 'person-1' }],
          ...persons.map(person => [person.id, person])
        ]),
      productionDepartmentIds: () => [],
      taskTypeMap: () =>
        new Map([['task-type-1', { id: 'task-type-1', for_entity: 'Asset' }]]),
      use12HourClock: () => false,
      user: () => user
    }
  })

const mountComment = ({
  comment = makeComment(),
  isAcknowledgeable,
  isActionError = false,
  isEditable = true,
  storeOptions,
  attachTo,
  urlPrefix = ''
} = {}) =>
  shallowMount(Comment, {
    attachTo,
    props: {
      comment,
      isAcknowledgeable,
      isActionError,
      isEditable,
      task,
      taskTypes: [],
      team: [],
      urlPrefix
    },
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

  describe('action error', () => {
    test('stays hidden while the last action succeeded', () => {
      const wrapper = mountComment()
      expect(wrapper.find('.like-button').exists()).toBe(true)
      expect(wrapper.find('.action-error').exists()).toBe(false)
    })

    // Same look as the errors of the comment form: italic, right aligned.
    test('tells that the last action was not saved', () => {
      const wrapper = mountComment({ isActionError: true })
      const error = wrapper.find('.action-error')
      expect(error.classes()).toContain('has-text-right')
      expect(error.find('em').text()).toBe('Could not save. Please try again.')
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

  describe('avatar links', () => {
    const comment = makeComment({
      replies: [
        {
          id: 'reply-1',
          text: 'A reply',
          mentions: [],
          department_mentions: [],
          person_id: 'person-2',
          person: { id: 'person-2', role: 'user' },
          date: '2026-06-06T11:00:00'
        }
      ]
    })

    const avatarLinks = wrapper =>
      wrapper
        .findAllComponents(PeopleAvatar)
        .map(avatar => avatar.props('isLink'))

    test('lead to the page of the author and of the repliers', () => {
      expect(avatarLinks(mountComment({ comment }))).toEqual([true, true])
    })

    // The person page sits behind the login.
    test('stay inert for an anonymous guest', () => {
      const wrapper = mountComment({ comment, storeOptions: { user: null } })
      expect(avatarLinks(wrapper)).toEqual([false, false])
    })
  })

  // Zou hands the client the internal comments that carry a preview, emptied
  // of their text, for the revisions they hold.
  describe('internal comment shown to a client', () => {
    const persons = [{ id: 'person-3', full_name: 'Eddie Editor' }]
    const internal = makeComment({
      text: '',
      person_id: 'person-2',
      person: { id: 'person-2', role: 'supervisor' },
      editor_id: 'person-3',
      previews: [{ id: 'preview-1', revision: 1 }]
    })

    const shownPeople = wrapper => ({
      avatar: wrapper.findComponent(PeopleAvatar).exists(),
      name: wrapper.findComponent(PeopleName).exists(),
      editor: wrapper.find('.edited-text').exists()
    })

    test('keeps who wrote and edited it from the client', () => {
      const wrapper = mountComment({
        comment: internal,
        storeOptions: { isClient: true, persons }
      })
      expect(shownPeople(wrapper)).toEqual({
        avatar: false,
        name: false,
        editor: false
      })
    })

    test.each([
      ['flagged for the client', { for_client: true }],
      ['written by a client', { person: { id: 'person-2', role: 'client' } }]
    ])('names the people of a comment %s', (_, overrides) => {
      const wrapper = mountComment({
        comment: { ...internal, ...overrides },
        storeOptions: { isClient: true, persons }
      })
      expect(shownPeople(wrapper)).toEqual({
        avatar: true,
        name: true,
        editor: true
      })
      expect(wrapper.find('.edited-text').text()).toBe('Edited by Eddie Editor')
    })

    test('names them to the studio', () => {
      const wrapper = mountComment({
        comment: internal,
        storeOptions: { persons }
      })
      expect(shownPeople(wrapper)).toEqual({
        avatar: true,
        name: true,
        editor: true
      })
    })
  })

  describe('revision badge', () => {
    const comment = makeComment({
      previews: [{ id: 'preview-1', revision: 1 }]
    })

    test('links to the preview of the revision', () => {
      const wrapper = mountComment({ comment })
      expect(wrapper.findComponent(RouterLink).exists()).toBe(true)
    })

    test('shows the revision without a link to shared playlist guests', () => {
      const wrapper = mountComment({
        comment,
        urlPrefix: '/api/shared/playlists/token-1'
      })
      expect(wrapper.findComponent(RouterLink).exists()).toBe(false)
      expect(wrapper.find('.round-name.revision').text()).toContain('1')
    })
  })

  describe('acknowledgment button', () => {
    test('shows the thumbs up with its counter', () => {
      const wrapper = mountComment({
        comment: makeComment({ acknowledgements: ['person-1', 'person-2'] })
      })
      expect(wrapper.find('.like-button').text()).toBe('2')
    })

    test('stays hidden when the comment cannot be acknowledged', () => {
      const wrapper = mountComment({ isAcknowledgeable: false })
      expect(wrapper.find('.like-button').exists()).toBe(false)
    })

    test('names the people who acknowledged the comment in a tooltip', () => {
      const wrapper = mountComment({
        comment: makeComment({ acknowledgements: ['person-2'] }),
        storeOptions: { persons: [{ id: 'person-2', name: 'Sam Supervisor' }] }
      })
      expect(wrapper.find('[title="Sam Supervisor"]').exists()).toBe(true)
    })

    // A shared playlist guest gets the acknowledgments back when editing a
    // comment, although the button is hidden.
    test('keeps their names out when the comment cannot be acknowledged', () => {
      const wrapper = mountComment({
        comment: makeComment({ acknowledgements: ['person-2'] }),
        isAcknowledgeable: false,
        storeOptions: { persons: [{ id: 'person-2', name: 'Sam Supervisor' }] }
      })
      expect(wrapper.html()).not.toContain('Sam Supervisor')
    })
  })
})
