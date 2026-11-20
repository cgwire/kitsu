import { flushPromises, shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import { markRequestFailure } from '@/lib/errors'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import SharedCommentsPanel from '@/components/players/sides/SharedCommentsPanel.vue'
import TaskComment from '@/components/widgets/Comment.vue'

import { resetFullScreen, setFullScreenElement } from '../fixtures/full-screen'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false
})

// The people the panel registers, as the people store receives them.
const loadedPeople = []

const actions = {
  deleteSharedPlaylistComment: vi.fn(),
  loadSharedPlaylistComments: vi.fn(),
  loadSharedPlaylistContext: vi.fn()
}

const store = createStore({
  actions,
  getters: {
    currentProduction: () => null,
    personMap: () => new Map(),
    taskStatusMap: () => new Map()
  },
  mutations: {
    LOAD_PEOPLE_END: (state, { people }) => {
      loadedPeople.push(...people)
    }
  }
})

const mountPanel = () =>
  shallowMount(SharedCommentsPanel, {
    props: { token: 'token', currentTaskId: 'task-1' },
    global: { directives: { autosize: {} }, plugins: [store, i18n] }
  })

const sharedAvatarPath = personId =>
  `/api/shared/playlists/token/pictures/thumbnails/persons/${personId}.png`

describe('players/SharedCommentsPanel', () => {
  beforeEach(() => {
    loadedPeople.length = 0
    actions.loadSharedPlaylistContext.mockResolvedValue({
      task_statuses: []
    })
    actions.loadSharedPlaylistComments.mockResolvedValue([
      {
        id: 'comment-1',
        object_id: 'task-1',
        person_id: 'person-1',
        text: 'Nice timing',
        created_at: '2026-10-01T10:00:00'
      }
    ])
  })

  // The browser shows the player in full screen alone: the attachment, edit
  // and delete modals of the guest go into it, and back to <body> after.
  describe('in full screen', () => {
    let player = null
    let wrapper = null

    afterEach(() => {
      wrapper.unmount()
      resetFullScreen()
      player.remove()
    })

    it('opens its modals in the player', async () => {
      player = document.body.appendChild(document.createElement('div'))
      wrapper = shallowMount(SharedCommentsPanel, {
        props: { token: 'token', currentTaskId: 'task-1' },
        attachTo: player.appendChild(document.createElement('div')),
        global: {
          directives: { autosize: {} },
          plugins: [store, i18n],
          stubs: { teleport: false }
        }
      })
      await flushPromises()
      const modals = () => document.querySelector('.shared-modals')
      expect(modals().parentElement).toBe(document.body)

      setFullScreenElement(player)
      await flushPromises()
      expect(modals().parentElement).toBe(player)

      setFullScreenElement(null)
      await flushPromises()
      expect(modals().parentElement).toBe(document.body)
    })
  })

  // External clients reviewing a shared playlist have no use for it.
  it('lists the comments without the acknowledgment button', async () => {
    const wrapper = shallowMount(SharedCommentsPanel, {
      props: { token: 'token', currentTaskId: 'task-1' },
      global: { directives: { autosize: {} }, plugins: [store, i18n] }
    })
    await flushPromises()

    const comments = wrapper.findAllComponents(TaskComment)
    expect(comments).toHaveLength(1)
    expect(comments[0].props('isAcknowledgeable')).toBe(false)
  })

  // The avatar route needs a login: the page shows the pictures through the
  // link, for the comment authors and the repliers alike.
  it('shows the avatars and the repliers through the link', async () => {
    actions.loadSharedPlaylistComments.mockResolvedValue([
      {
        id: 'comment-1',
        object_id: 'task-1',
        person_id: 'person-1',
        person: { id: 'person-1', full_name: 'Sam Super', has_avatar: true },
        text: 'Nice timing',
        created_at: '2026-10-01T10:00:00',
        replies: [
          {
            id: 'reply-1',
            person_id: 'person-2',
            person: { id: 'person-2', full_name: 'Max Prod', has_avatar: true }
          },
          {
            id: 'reply-2',
            person_id: 'guest-1',
            person: { id: 'guest-1', full_name: 'Guest', has_avatar: false }
          }
        ]
      }
    ])
    const wrapper = mountPanel()
    await flushPromises()

    const comment = wrapper.findComponent(TaskComment).props('comment')
    expect(comment.person.avatarPath).toBe(sharedAvatarPath('person-1'))
    expect(comment.replies[0].person).toMatchObject({
      full_name: 'Max Prod',
      has_avatar: true,
      avatarPath: sharedAvatarPath('person-2')
    })
    expect(comment.replies[1].person.has_avatar).toBe(false)
    expect(comment.replies[1].person.avatarPath).toBeUndefined()
    // The store keeps initials: its avatar route would answer 401 here.
    expect(
      loadedPeople.map(({ id, has_avatar }) => [id, has_avatar])
    ).toEqual([
      ['person-1', false],
      ['person-2', false],
      ['guest-1', false]
    ])
  })

  // Zou answers 404 for a comment deleted since the comments were last
  // loaded, by the studio or by the guest in another tab, and for a link
  // revoked or expired meanwhile: only a new load tells them apart.
  describe('comment deletion', () => {
    const staffComment = {
      id: 'comment-1',
      object_id: 'task-1',
      person_id: 'person-1',
      text: 'Nice timing',
      created_at: '2026-10-01T10:00:00'
    }
    const ownComment = {
      id: 'comment-2',
      object_id: 'task-1',
      person_id: 'guest-1',
      text: 'Retake please',
      created_at: '2026-11-19T18:10:29'
    }
    // As the API client marks the failures it reports.
    const httpError = status => {
      const error = Object.assign(new Error(`HTTP ${status}`), { status })
      markRequestFailure(error)
      return error
    }

    const deleteOwnComment = async (config = {}) => {
      const wrapper = shallowMount(SharedCommentsPanel, {
        props: { token: 'token', currentTaskId: 'task-1', guestId: 'guest-1' },
        global: {
          config,
          directives: { autosize: {} },
          plugins: [store, i18n],
          stubs: { teleport: true }
        }
      })
      await flushPromises()
      const comment = wrapper
        .findAllComponents(TaskComment)
        .find(item => item.props('comment').id === ownComment.id)
      comment.vm.$emit('delete-comment', comment.props('comment'))
      await flushPromises()
      wrapper.findComponent(DeleteModal).vm.$emit('confirm')
      await flushPromises()
      return wrapper
    }

    const shownCommentIds = wrapper =>
      wrapper
        .findAllComponents(TaskComment)
        .map(item => item.props('comment').id)

    beforeEach(() => {
      Object.values(actions).forEach(action => action.mockReset())
      actions.loadSharedPlaylistContext.mockResolvedValue({ task_statuses: [] })
      actions.loadSharedPlaylistComments.mockResolvedValue([
        staffComment,
        ownComment
      ])
    })

    it('removes the comment once deleted', async () => {
      actions.deleteSharedPlaylistComment.mockResolvedValue()
      const wrapper = await deleteOwnComment()

      expect(actions.deleteSharedPlaylistComment).toHaveBeenCalledWith(
        expect.anything(),
        { shareToken: 'token', commentId: 'comment-2', guestId: 'guest-1' }
      )
      expect(wrapper.findComponent(DeleteModal).props('active')).toBe(false)
      expect(shownCommentIds(wrapper)).toEqual(['comment-1'])
    })

    it('removes a comment deleted in the meantime', async () => {
      actions.deleteSharedPlaylistComment.mockRejectedValue(httpError(404))
      actions.loadSharedPlaylistComments
        .mockResolvedValueOnce([staffComment, ownComment])
        .mockResolvedValueOnce([staffComment])
      const wrapper = await deleteOwnComment()

      const modal = wrapper.findComponent(DeleteModal)
      expect(modal.props('active')).toBe(false)
      expect(modal.props('isError')).toBe(false)
      expect(shownCommentIds(wrapper)).toEqual(['comment-1'])
    })

    it('keeps a comment the reload still lists', async () => {
      actions.deleteSharedPlaylistComment.mockRejectedValue(httpError(404))
      const wrapper = await deleteOwnComment()

      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(2)
      const modal = wrapper.findComponent(DeleteModal)
      expect(modal.props('active')).toBe(true)
      expect(modal.props('isError')).toBe(true)
      expect(shownCommentIds(wrapper)).toEqual(['comment-2', 'comment-1'])
    })

    it('keeps the comment when the link is gone', async () => {
      actions.deleteSharedPlaylistComment.mockRejectedValue(httpError(404))
      actions.loadSharedPlaylistComments
        .mockResolvedValueOnce([staffComment, ownComment])
        .mockRejectedValueOnce(httpError(404))
      const wrapper = await deleteOwnComment()

      const modal = wrapper.findComponent(DeleteModal)
      expect(modal.props('active')).toBe(true)
      expect(modal.props('isError')).toBe(true)
      expect(shownCommentIds(wrapper)).toEqual(['comment-2', 'comment-1'])
    })

    it('lets a bug of the reload through and shows the error', async () => {
      const bug = new TypeError('people is undefined')
      const errorHandler = vi.fn()
      actions.deleteSharedPlaylistComment.mockRejectedValue(httpError(404))
      actions.loadSharedPlaylistComments
        .mockResolvedValueOnce([staffComment, ownComment])
        .mockRejectedValueOnce(bug)
      const wrapper = await deleteOwnComment({ errorHandler })

      expect(errorHandler).toHaveBeenCalledWith(
        bug,
        expect.anything(),
        expect.anything()
      )
      const modal = wrapper.findComponent(DeleteModal)
      expect(modal.props('isError')).toBe(true)
      expect(modal.props('isLoading')).toBe(false)
    })

    it('shows the error and lets a bug of the deletion through', async () => {
      const bug = new TypeError('shareToken is undefined')
      const errorHandler = vi.fn()
      actions.deleteSharedPlaylistComment.mockRejectedValue(bug)
      const wrapper = await deleteOwnComment({ errorHandler })

      expect(errorHandler).toHaveBeenCalledWith(
        bug,
        expect.anything(),
        expect.anything()
      )
      const modal = wrapper.findComponent(DeleteModal)
      expect(modal.props('isError')).toBe(true)
      expect(modal.props('isLoading')).toBe(false)
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(1)
    })

    it('keeps the comment when Zou refuses the deletion', async () => {
      actions.deleteSharedPlaylistComment.mockRejectedValue(httpError(403))
      const wrapper = await deleteOwnComment()

      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(1)
      const modal = wrapper.findComponent(DeleteModal)
      expect(modal.props('active')).toBe(true)
      expect(modal.props('isError')).toBe(true)
      expect(shownCommentIds(wrapper)).toEqual(['comment-2', 'comment-1'])
    })

    // DeleteModal takes the Enter key even while it shows the spinner.
    it('sends the deletion once when the guest confirms twice', async () => {
      let answerDeletion = null
      actions.deleteSharedPlaylistComment.mockImplementationOnce(
        () => new Promise(resolve => (answerDeletion = resolve))
      )
      const wrapper = await deleteOwnComment()
      wrapper.findComponent(DeleteModal).vm.$emit('confirm')
      await flushPromises()
      answerDeletion()
      await flushPromises()

      expect(actions.deleteSharedPlaylistComment).toHaveBeenCalledTimes(1)
      expect(wrapper.findComponent(DeleteModal).props('active')).toBe(false)
      expect(shownCommentIds(wrapper)).toEqual(['comment-1'])
    })

    // The guest closes the modal before Zou answers, then opens the deletion
    // of another comment: the modal shows that one now.
    describe('when another deletion opens meanwhile', () => {
      const laterComment = {
        ...ownComment,
        id: 'comment-3',
        text: 'And the leg',
        created_at: '2026-11-19T18:12:00'
      }

      // The deletion confirmed first answers when the test says so.
      const holdDeletion = () => {
        const deletion = {}
        actions.deleteSharedPlaylistComment.mockImplementationOnce(
          () =>
            new Promise((resolve, reject) => {
              deletion.answer = resolve
              deletion.fail = reject
            })
        )
        return deletion
      }

      // Read anew after each step: with the teleport stubbed, each render of
      // the panel makes a new modal.
      const modalProps = wrapper => wrapper.findComponent(DeleteModal).props()

      const openDeletion = async (wrapper, commentId) => {
        wrapper.findComponent(DeleteModal).vm.$emit('cancel')
        const comment = wrapper
          .findAllComponents(TaskComment)
          .find(item => item.props('comment').id === commentId)
        comment.vm.$emit('delete-comment', comment.props('comment'))
        await flushPromises()
      }

      const openLaterDeletion = wrapper => openDeletion(wrapper, laterComment.id)

      beforeEach(() => {
        actions.loadSharedPlaylistComments.mockResolvedValue([
          staffComment,
          ownComment,
          laterComment
        ])
      })

      it('removes the comment the guest confirmed', async () => {
        const deletion = holdDeletion()
        const wrapper = await deleteOwnComment()
        await openLaterDeletion(wrapper)
        deletion.answer()
        await flushPromises()

        expect(shownCommentIds(wrapper)).toEqual(['comment-3', 'comment-1'])
      })

      it('leaves the modal open and idle', async () => {
        const deletion = holdDeletion()
        const wrapper = await deleteOwnComment()
        await openLaterDeletion(wrapper)
        expect(modalProps(wrapper).isLoading).toBe(false)

        deletion.answer()
        await flushPromises()
        expect(modalProps(wrapper)).toMatchObject({
          active: true,
          isLoading: false
        })
      })

      it('leaves the modal open when Zou finds the comment gone', async () => {
        actions.loadSharedPlaylistComments
          .mockResolvedValueOnce([staffComment, ownComment, laterComment])
          .mockResolvedValueOnce([staffComment, laterComment])
        const deletion = holdDeletion()
        const wrapper = await deleteOwnComment()
        await openLaterDeletion(wrapper)
        deletion.fail(httpError(404))
        await flushPromises()

        expect(modalProps(wrapper)).toMatchObject({
          active: true,
          isError: false
        })
        expect(shownCommentIds(wrapper)).toEqual(['comment-3', 'comment-1'])
      })

      it('shows no error of the deletion confirmed first', async () => {
        const deletion = holdDeletion()
        const wrapper = await deleteOwnComment()
        await openLaterDeletion(wrapper)
        deletion.fail(httpError(500))
        await flushPromises()

        expect(modalProps(wrapper)).toMatchObject({
          active: true,
          isError: false,
          isLoading: false
        })
        expect(shownCommentIds(wrapper)).toEqual([
          'comment-3',
          'comment-2',
          'comment-1'
        ])
      })

      it('shows the spinner until Zou answers the deletion confirmed in it', async () => {
        const deletion = holdDeletion()
        const laterDeletion = holdDeletion()
        const wrapper = await deleteOwnComment()
        await openLaterDeletion(wrapper)
        wrapper.findComponent(DeleteModal).vm.$emit('confirm')
        await flushPromises()
        deletion.answer()
        await flushPromises()
        expect(modalProps(wrapper)).toMatchObject({
          active: true,
          isLoading: true
        })

        laterDeletion.answer()
        await flushPromises()
        expect(modalProps(wrapper).active).toBe(false)
        expect(shownCommentIds(wrapper)).toEqual(['comment-1'])
      })

      it('shows the spinner again when the guest reopens the comment being deleted', async () => {
        const deletion = holdDeletion()
        const wrapper = await deleteOwnComment()
        await openLaterDeletion(wrapper)
        await openDeletion(wrapper, ownComment.id)
        expect(modalProps(wrapper).isLoading).toBe(true)

        deletion.answer()
        await flushPromises()
        expect(modalProps(wrapper).active).toBe(false)
        expect(shownCommentIds(wrapper)).toEqual(['comment-3', 'comment-1'])
      })

      it('lets the guest retry a deletion that failed meanwhile', async () => {
        const deletion = holdDeletion()
        const wrapper = await deleteOwnComment()
        await openLaterDeletion(wrapper)
        deletion.fail(httpError(500))
        await flushPromises()
        await openDeletion(wrapper, ownComment.id)
        expect(modalProps(wrapper).isLoading).toBe(false)

        wrapper.findComponent(DeleteModal).vm.$emit('confirm')
        await flushPromises()
        expect(actions.deleteSharedPlaylistComment).toHaveBeenCalledTimes(2)
        expect(shownCommentIds(wrapper)).toEqual(['comment-3', 'comment-1'])
      })
    })
  })
})
