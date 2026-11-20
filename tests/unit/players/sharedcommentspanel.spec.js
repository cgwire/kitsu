import { enableAutoUnmount, flushPromises, shallowMount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import { markRequestFailure } from '@/lib/errors'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditCommentModal from '@/components/modals/EditCommentModal.vue'
import SharedCommentsPanel from '@/components/players/sides/SharedCommentsPanel.vue'
import TaskComment from '@/components/widgets/Comment.vue'

import { resetFullScreen, setFullScreenElement } from '../fixtures/full-screen'
import { recordUnhandledRejections } from '../fixtures/unhandled-rejections'

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
  editSharedPlaylistComment: vi.fn(),
  loadSharedPlaylistComments: vi.fn(),
  loadSharedPlaylistContext: vi.fn(),
  postSharedPlaylistComment: vi.fn()
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

// The panel listens to the tab: one left mounted would reload in the next
// tests.
enableAutoUnmount(afterEach)

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

    afterEach(() => {
      resetFullScreen()
      player.remove()
    })

    it('opens its modals in the player', async () => {
      player = document.body.appendChild(document.createElement('div'))
      shallowMount(SharedCommentsPanel, {
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

  const shownCommentIds = wrapper =>
    wrapper
      .findAllComponents(TaskComment)
      .map(item => item.props('comment').id)

  // As the API client marks the failures it reports.
  const httpError = status => {
    const error = Object.assign(new Error(`HTTP ${status}`), { status })
    markRequestFailure(error)
    return error
  }

  const globalOptions = {
    directives: { autosize: {} },
    plugins: [store, i18n],
    stubs: { teleport: true }
  }

  const mountGuestPanel = async (config = {}) => {
    const wrapper = shallowMount(SharedCommentsPanel, {
      props: {
        token: 'token',
        currentTaskId: 'task-1',
        guestId: 'guest-1',
        canComment: true
      },
      global: { ...globalOptions, config }
    })
    await flushPromises()
    return wrapper
  }

  const findComment = (wrapper, commentId) =>
    wrapper
      .findAllComponents(TaskComment)
      .find(item => item.props('comment').id === commentId)

  const deleteFromMenu = async (wrapper, commentId) => {
    const comment = findComment(wrapper, commentId)
    comment.vm.$emit('delete-comment', comment.props('comment'))
    await flushPromises()
    wrapper.findComponent(DeleteModal).vm.$emit('confirm')
    await flushPromises()
  }

  const uncheckedComment = {
    ...ownComment,
    checklist: [{ text: 'Arm', checked: false }]
  }
  const checkedComment = {
    ...ownComment,
    checklist: [{ text: 'Arm', checked: true }]
  }

  const checkBox = wrapper =>
    findComment(wrapper, 'comment-2').vm.$emit('checklist-updated', {
      id: 'comment-2',
      checklist: checkedComment.checklist
    })

  const isBoxChecked = wrapper =>
    findComment(wrapper, 'comment-2').props('comment').checklist[0].checked

  // Zou answers 404 for a comment deleted since the comments were last
  // loaded, by the studio or by the guest in another tab, and for a link
  // revoked or expired meanwhile: only a new load tells them apart.
  describe('comment deletion', () => {
    const deleteOwnComment = async (config = {}) => {
      const wrapper = await mountGuestPanel(config)
      await deleteFromMenu(wrapper, ownComment.id)
      return wrapper
    }

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
        const comment = findComment(wrapper, commentId)
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

  describe('checklist box', () => {
    beforeEach(() => {
      Object.values(actions).forEach(action => action.mockReset())
      actions.loadSharedPlaylistContext.mockResolvedValue({ task_statuses: [] })
      actions.loadSharedPlaylistComments.mockResolvedValue([
        staffComment,
        uncheckedComment
      ])
    })

    it('lets a bug of its save through', async () => {
      const bug = new TypeError('checklist is undefined')
      const errorHandler = vi.fn()
      actions.editSharedPlaylistComment.mockRejectedValue(bug)
      const wrapper = await mountGuestPanel({ errorHandler })

      checkBox(wrapper)
      await flushPromises()
      expect(errorHandler).toHaveBeenCalledWith(
        bug,
        expect.anything(),
        expect.anything()
      )
    })
  })

  // The page gets no live updates: coming back to the tab reloads the
  // comments.
  describe('return to the tab', () => {
    const newComment = {
      id: 'comment-3',
      object_id: 'task-1',
      person_id: 'guest-1',
      text: 'New note',
      created_at: '2026-11-19T18:20:00'
    }

    const setTabVisibility = state => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => state
      })
      document.dispatchEvent(new Event('visibilitychange'))
    }

    // A list fetched less than ten seconds ago is not reloaded.
    const comeBackLater = () => {
      vi.setSystemTime(Date.now() + 10 * 1000)
      setTabVisibility('visible')
    }

    // The next fetch answers when the test says so.
    const holdNextFetch = () => {
      let answer = null
      actions.loadSharedPlaylistComments.mockImplementationOnce(
        () => new Promise(resolve => (answer = resolve))
      )
      return list => answer(list)
    }

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] })
      Object.values(actions).forEach(action => action.mockReset())
      actions.loadSharedPlaylistContext.mockResolvedValue({
        task_statuses: [{ id: 'status-1', is_client_allowed: true }]
      })
      actions.loadSharedPlaylistComments.mockResolvedValue([
        staffComment,
        ownComment
      ])
    })

    afterEach(() => {
      delete document.visibilityState
      vi.useRealTimers()
      vi.restoreAllMocks()
    })

    it('reloads the comments when the guest comes back', async () => {
      const wrapper = await mountGuestPanel()
      actions.loadSharedPlaylistComments.mockResolvedValue([staffComment])

      vi.setSystemTime(Date.now() + 10 * 1000)
      setTabVisibility('hidden')
      await flushPromises()
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(1)

      setTabVisibility('visible')
      await flushPromises()
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(2)
      expect(shownCommentIds(wrapper)).toEqual(['comment-1'])
    })

    it('spares a list fetched less than ten seconds ago', async () => {
      await mountGuestPanel()

      vi.setSystemTime(Date.now() + 9 * 1000)
      setTabVisibility('visible')
      await flushPromises()
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(1)

      vi.setSystemTime(Date.now() + 1000)
      setTabVisibility('visible')
      await flushPromises()
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(2)
    })

    it('counts the ten seconds from the last fetch', async () => {
      await mountGuestPanel()
      comeBackLater()
      await flushPromises()
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(2)

      vi.setSystemTime(Date.now() + 9 * 1000)
      setTabVisibility('visible')
      await flushPromises()
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(2)
    })

    it('keeps the list when a reload fails, and tries again later', async () => {
      const failure = httpError(500)
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const wrapper = await mountGuestPanel()
      actions.loadSharedPlaylistComments.mockRejectedValueOnce(failure)

      comeBackLater()
      await flushPromises()
      expect(consoleError).toHaveBeenCalledWith(failure)
      expect(shownCommentIds(wrapper)).toEqual(['comment-2', 'comment-1'])

      actions.loadSharedPlaylistComments.mockResolvedValue([staffComment])
      comeBackLater()
      await flushPromises()
      expect(shownCommentIds(wrapper)).toEqual(['comment-1'])
    })

    it('lets a bug of a reload through', async () => {
      const bug = new TypeError('comments is not iterable')
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const wrapper = await mountGuestPanel()
      actions.loadSharedPlaylistComments.mockRejectedValueOnce(bug)

      const rejections = await recordUnhandledRejections(async () => {
        comeBackLater()
        await flushPromises()
      })
      expect(rejections).toEqual([bug])
      expect(consoleError).not.toHaveBeenCalled()
      expect(shownCommentIds(wrapper)).toEqual(['comment-2', 'comment-1'])
    })

    // Two returns within one fetch: the older answer must not overwrite the
    // newer list.
    it('runs one fetch at a time and shows the newest list', async () => {
      const wrapper = await mountGuestPanel()
      const answerFirstReload = holdNextFetch()
      actions.loadSharedPlaylistComments.mockResolvedValue([staffComment])

      comeBackLater()
      comeBackLater()
      await flushPromises()
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(2)

      answerFirstReload([staffComment, ownComment])
      await flushPromises()
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(3)
      expect(shownCommentIds(wrapper)).toEqual(['comment-1'])
    })

    // The reload was sent before the post reached Zou: its list lacks the new
    // comment.
    it('keeps a comment posted while a reload was on its way', async () => {
      const wrapper = await mountGuestPanel()
      const answerReload = holdNextFetch()
      actions.loadSharedPlaylistComments.mockResolvedValue([
        staffComment,
        ownComment,
        newComment
      ])
      actions.postSharedPlaylistComment.mockResolvedValue(newComment)

      comeBackLater()
      await wrapper.find('textarea').setValue('New note')
      await wrapper.find('form').trigger('submit')
      await flushPromises()
      answerReload([staffComment, ownComment])
      await flushPromises()

      expect(shownCommentIds(wrapper)).toEqual([
        'comment-3',
        'comment-2',
        'comment-1'
      ])
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(3)
    })

    // The reload reached Zou after the post: its list already has the new
    // comment when the post answers.
    it('shows a new comment once when the reload brought it first', async () => {
      let answerPost = null
      const wrapper = await mountGuestPanel()
      actions.postSharedPlaylistComment.mockImplementationOnce(
        () => new Promise(resolve => (answerPost = resolve))
      )
      actions.loadSharedPlaylistComments.mockResolvedValue([
        staffComment,
        ownComment,
        newComment
      ])

      await wrapper.find('textarea').setValue('New note')
      await wrapper.find('form').trigger('submit')
      comeBackLater()
      await flushPromises()
      answerPost(newComment)
      await flushPromises()

      expect(shownCommentIds(wrapper)).toEqual([
        'comment-3',
        'comment-2',
        'comment-1'
      ])
    })

    it('keeps a deletion when a reload was on its way', async () => {
      const wrapper = await mountGuestPanel()
      const answerReload = holdNextFetch()
      actions.loadSharedPlaylistComments.mockResolvedValue([staffComment])
      actions.deleteSharedPlaylistComment.mockResolvedValue()

      comeBackLater()
      await deleteFromMenu(wrapper, 'comment-2')
      answerReload([staffComment, ownComment])
      await flushPromises()

      expect(shownCommentIds(wrapper)).toEqual(['comment-1'])
    })

    it('keeps an edit when a reload was on its way', async () => {
      const editedComment = { ...ownComment, text: 'Retake the arm' }
      const wrapper = await mountGuestPanel()
      const answerReload = holdNextFetch()
      actions.loadSharedPlaylistComments.mockResolvedValue([
        staffComment,
        editedComment
      ])
      actions.editSharedPlaylistComment.mockResolvedValue(editedComment)

      comeBackLater()
      const comment = findComment(wrapper, 'comment-2')
      comment.vm.$emit('edit-comment', comment.props('comment'))
      await flushPromises()
      wrapper
        .findComponent(EditCommentModal)
        .vm.$emit('confirm', { text: 'Retake the arm', checklist: [] })
      await flushPromises()
      answerReload([staffComment, ownComment])
      await flushPromises()

      expect(findComment(wrapper, 'comment-2').props('comment').text).toBe(
        'Retake the arm'
      )
    })

    // Here the fetch sent after the click lists the box checked. Zou may
    // serve that fetch before it saves the box: the box then shows unchecked
    // until the save answers.
    it('keeps a checked box while a reload was on its way', async () => {
      let answerSave = null
      actions.loadSharedPlaylistComments.mockResolvedValue([
        staffComment,
        uncheckedComment
      ])
      const wrapper = await mountGuestPanel()
      const answerReload = holdNextFetch()
      actions.loadSharedPlaylistComments.mockResolvedValue([
        staffComment,
        checkedComment
      ])
      actions.editSharedPlaylistComment.mockImplementationOnce(
        () => new Promise(resolve => (answerSave = resolve))
      )

      comeBackLater()
      checkBox(wrapper)
      await flushPromises()
      answerReload([staffComment, uncheckedComment])
      await flushPromises()
      expect(isBoxChecked(wrapper)).toBe(true)

      answerSave(checkedComment)
      await flushPromises()
      expect(isBoxChecked(wrapper)).toBe(true)
    })

    // The studio removed the comment after the reload was sent: the reload
    // still lists it when the guest deletes it.
    it('closes the deletion of a removed comment despite an older reload', async () => {
      const wrapper = await mountGuestPanel()
      const answerReload = holdNextFetch()
      actions.loadSharedPlaylistComments.mockResolvedValue([staffComment])
      actions.deleteSharedPlaylistComment.mockRejectedValue(httpError(404))

      comeBackLater()
      await deleteFromMenu(wrapper, 'comment-2')
      answerReload([staffComment, ownComment])
      await flushPromises()

      const modal = wrapper.findComponent(DeleteModal)
      expect(modal.props('active')).toBe(false)
      expect(modal.props('isError')).toBe(false)
      expect(shownCommentIds(wrapper)).toEqual(['comment-1'])
    })

    // The deletion waits for the reload on its way, sent before it: when that
    // reload fails, only a new fetch tells whether the comment is gone.
    it('closes the deletion of a removed comment when the older reload fails', async () => {
      let failReload = null
      const wrapper = await mountGuestPanel()
      actions.loadSharedPlaylistComments.mockImplementationOnce(
        () => new Promise((resolve, reject) => (failReload = reject))
      )
      actions.loadSharedPlaylistComments.mockResolvedValue([staffComment])
      actions.deleteSharedPlaylistComment.mockRejectedValue(httpError(404))

      comeBackLater()
      await deleteFromMenu(wrapper, 'comment-2')
      failReload(httpError(504))
      await flushPromises()

      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(3)
      const modal = wrapper.findComponent(DeleteModal)
      expect(modal.props('active')).toBe(false)
      expect(modal.props('isError')).toBe(false)
      expect(shownCommentIds(wrapper)).toEqual(['comment-1'])
    })

    it('lets a bug of the older reload through without fetching again', async () => {
      let failReload = null
      const bug = new TypeError('comments is not iterable')
      const errorHandler = vi.fn()
      const wrapper = await mountGuestPanel({ errorHandler })
      actions.loadSharedPlaylistComments.mockImplementationOnce(
        () => new Promise((resolve, reject) => (failReload = reject))
      )
      actions.deleteSharedPlaylistComment.mockRejectedValue(httpError(404))

      const rejections = await recordUnhandledRejections(async () => {
        comeBackLater()
        await deleteFromMenu(wrapper, 'comment-2')
        failReload(bug)
        await flushPromises()
      })
      expect(rejections).toEqual([bug])
      expect(errorHandler).toHaveBeenCalledWith(
        bug,
        expect.anything(),
        expect.anything()
      )
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(2)
      expect(wrapper.findComponent(DeleteModal).props()).toMatchObject({
        active: true,
        isError: true,
        isLoading: false
      })
    })

    // The player closes the panel with a v-if.
    it('stops reloading once the panel is closed', async () => {
      const isOpen = ref(true)
      const Player = defineComponent({
        setup: () => () =>
          isOpen.value
            ? h(SharedCommentsPanel, { token: 'token', currentTaskId: 'task-1' })
            : null
      })
      shallowMount(Player, {
        global: {
          ...globalOptions,
          stubs: { ...globalOptions.stubs, SharedCommentsPanel: false }
        }
      })
      await flushPromises()
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(1)
      isOpen.value = false
      await flushPromises()

      comeBackLater()
      await flushPromises()
      expect(actions.loadSharedPlaylistComments).toHaveBeenCalledTimes(1)
    })
  })
})
