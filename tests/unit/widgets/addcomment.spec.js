import { nextTick, reactive } from 'vue'
import { createStore } from 'vuex'
import { createRouter, createWebHistory } from 'vue-router'

import tasksStore from '@/store/modules/tasks'

import AddComment from '@/components/widgets/AddComment.vue'

import { shallowMountWithI18n } from '../fixtures/i18n'

// The tasks module pulls in the root store (lib/models, timezone, @/store),
// which this spec does not need built.
vi.mock('@/store', () => ({ default: {} }))

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/tasks/:id', name: 'task', component: { template: '' } }]
})

const makeDraftComment = () =>
  reactive({
    attachments: [],
    checklist: [],
    link: null,
    mode: 'status',
    nextRevision: undefined,
    showCommentArea: false,
    showLinkField: false,
    task_status_id: 'task-status-1',
    text: ''
  })

const makeFormWithFile = name => {
  const form = new FormData()
  form.append('file', new Blob(), name || 'test.png')
  return form
}

describe('AddComment', () => {
  let store, wrapper, draftComment, clearedProgress

  const taskStatusList = [
    {
      id: 'task-status-1',
      name: 'Todo',
      short_name: 'TODO',
      color: '#ECECEC',
      is_artist_allowed: true,
      is_client_allowed: true,
      is_feedback_request: false
    },
    {
      id: 'task-status-2',
      name: 'WIP',
      short_name: 'WIP',
      color: '#22D160',
      is_artist_allowed: true,
      is_client_allowed: true,
      is_feedback_request: false
    }
  ]

  const task = {
    id: 'task-1',
    entity_name: 'Shot 01',
    task_type_id: 'task-type-1',
    task_status_id: 'task-status-1',
    project_id: 'production-1'
  }

  const mountComment = async (
    getterOverrides = {},
    stubs = {},
    storeOptions = {}
  ) => {
    draftComment = makeDraftComment()
    clearedProgress = []

    store = createStore({
      strict: true,
      state: storeOptions.state,
      getters: {
        isDarkTheme: () => false,
        isCurrentUserAdmin: () => false,
        isCurrentUserArtist: () => false,
        isCurrentUserClient: () => false,
        isCurrentUserManager: () => false,
        currentUserRoleForProduction: () => () => null,
        departmentMap: () => new Map(),
        isTaskRevisionTaken: () => () => false,
        productionDepartmentIds: () => [],
        productionMap: () =>
          new Map([
            [
              'production-1',
              {
                id: 'production-1',
                name: 'Test',
                is_publish_default_for_artists: false
              }
            ]
          ]),
        taskStatusForCurrentUser: () => taskStatusList,
        taskStatusMap: () =>
          new Map(taskStatusList.map(s => [s.id, s])),
        taskTypeMap: () =>
          new Map([
            ['task-type-1', { id: 'task-type-1', name: 'Animation' }]
          ]),
        uploadProgress: () => ({}),
        ...getterOverrides
      },
      mutations: {
        CLEAR_UPLOAD_PROGRESS: (state, names) => clearedProgress.push(names),
        ...storeOptions.mutations
      }
    })

    await router.push('/tasks/task-1')
    await router.isReady()

    wrapper = shallowMountWithI18n(AddComment, {
      props: {
        task,
        taskStatus: taskStatusList,
        team: [],
        taskTypes: []
      },
      global: {
        plugins: [store, router],
        provide: {
          draftComment
        },
        directives: {
          focus: () => {},
          autosize: () => {}
        },
        stubs: {
          'at-ta': false,
          EmojiButton: true,
          AddAttachmentModal: true,
          ConfirmModal: true,
          ...stubs
        }
      }
    })
  }

  beforeEach(() => mountComment())

  it('renders the status tab as active by default', () => {
    const tabs = wrapper.findAll('.tab-row span')
    const statusTab = tabs[0]
    expect(statusTab.classes()).toContain('active')
  })

  it('switches to publish mode on tab click', async () => {
    const tabs = wrapper.findAll('.tab-row span')
    await tabs[1].trigger('click')
    expect(draftComment.mode).toBe('publish')
  })

  it('keeps the publish tab from a client', async () => {
    wrapper.unmount()
    await mountComment({ isCurrentUserClient: () => true })
    expect(wrapper.findAll('.tab-row span')).toHaveLength(1)
    expect(draftComment.mode).toBe('status')
  })

  it('has the comment input area in status mode', () => {
    // at-ta wraps the comment textarea. Verify the comment area exists.
    const html = wrapper.html()
    expect(
      html.includes('at-ta') || html.includes('textarea')
    ).toBe(true)
  })

  it('emits add-comment when post button is clicked in status mode', async () => {
    const postButton = wrapper.find('.post-button')
    await postButton.trigger('click')
    expect(wrapper.emitted('add-comment')).toBeTruthy()
  })

  // The stubs name vue-at after its component name, AtTextarea.
  it('wraps a pasted Windows path in backticks', async () => {
    wrapper.unmount()
    await mountComment({}, { AtTextarea: false })
    const textarea = wrapper.find('textarea')
    await textarea.trigger('paste', {
      clipboardData: { files: [], getData: () => 'S:\\8_anim\\_lib' }
    })
    await wrapper.find('.post-button').trigger('click')
    expect(wrapper.emitted('add-comment')[0][0]).toBe('`S:\\8_anim\\_lib`')
  })

  // The extra preview modal of the panel may upload at the same time.
  it('clears the progress of its own files only when it publishes', async () => {
    await wrapper.setProps({ previewForms: [makeFormWithFile('sh010.mp4')] })

    await wrapper.find('.post-button').trigger('click')

    expect(clearedProgress).toEqual([['sh010.mp4']])
  })

  // Snapshots taken once the attachment dialog is closed would land in it,
  // and the dialog empties itself when it opens again.
  describe('snapshots', () => {
    const attachmentModal = {
      name: 'AddAttachmentModal',
      template: '<div />',
      emits: ['cancel', 'confirm'],
      methods: {
        addFiles: () => {},
        hideAnnotationLoading: () => {},
        showAnnotationLoading: () => {}
      }
    }

    beforeEach(async () => {
      wrapper.unmount()
      await mountComment({}, { AddAttachmentModal: attachmentModal })
    })

    // Confirming the files already in it closes it too.
    it.each(['cancel', 'confirm'])(
      'stops them when the attachment dialog closes on %s',
      event => {
        const signal = wrapper.vm.showAnnotationLoading('standard')
        expect(signal.aborted).toBe(false)

        wrapper.findComponent({ name: 'AddAttachmentModal' }).vm.$emit(event, [])

        expect(signal.aborted).toBe(true)
      }
    )

    it('stops them when it goes away', () => {
      const signal = wrapper.vm.showAnnotationLoading('standard')

      wrapper.unmount()

      expect(signal.aborted).toBe(true)
    })
  })

  describe('exposed methods', () => {
    it('reset clears text, attachments, checklist and link', () => {
      draftComment.text = 'some text'
      draftComment.attachments = [new FormData()]
      draftComment.checklist = [{ text: 'task', checked: false }]
      draftComment.link = 'https://example.com'
      wrapper.vm.reset()
      expect(draftComment.text).toBe('')
      expect(draftComment.attachments).toEqual([])
      expect(draftComment.checklist).toEqual([])
      expect(draftComment.link).toBeNull()
      expect(draftComment.nextRevision).toBeUndefined()
    })

    // Zou keeps a null checklist on the comments that predate the column.
    it('setValue reads a null checklist as an empty one', async () => {
      await wrapper.vm.setValue({
        text: 'Client note',
        checklist: null,
        attachment_files: []
      })
      await nextTick()

      expect(draftComment.text).toBe('Client note')
      expect(draftComment.checklist).toEqual([])
    })
  })

  describe('form validation', () => {
    it('is always valid in status mode', () => {
      expect(wrapper.vm.isValidForm).toBe(true)
    })

    it('is invalid in publish mode without preview forms', async () => {
      draftComment.mode = 'publish'
      await wrapper.setProps({ previewForms: [] })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isValidForm).toBe(false)
    })

    it('is valid in publish mode with preview forms', async () => {
      draftComment.mode = 'publish'
      await wrapper.setProps({
        previewForms: [makeFormWithFile('test.png')]
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isValidForm).toBe(true)
    })

    it('treats an empty revision as auto and stays valid', async () => {
      draftComment.mode = 'publish'
      await wrapper.setProps({ previewForms: [makeFormWithFile('test.png')] })
      draftComment.nextRevision = ''
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isValidForm).toBe(true)
    })

    it('allows revision 0', async () => {
      draftComment.mode = 'publish'
      await wrapper.setProps({ previewForms: [makeFormWithFile('test.png')] })
      draftComment.nextRevision = '0'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isValidForm).toBe(true)
    })

    it('rejects a negative revision', async () => {
      draftComment.mode = 'publish'
      await wrapper.setProps({ previewForms: [makeFormWithFile('test.png')] })
      draftComment.nextRevision = '-1'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isValidForm).toBe(false)
    })
  })

  describe('revision-below-current warning', () => {
    it('flags a revision lower than or equal to the current one', async () => {
      await wrapper.setProps({ revision: 5 })
      draftComment.nextRevision = '5'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isRevisionBelowCurrent).toBe(true)
      draftComment.nextRevision = '3'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isRevisionBelowCurrent).toBe(true)
    })

    it('does not flag a revision greater than the current one', async () => {
      await wrapper.setProps({ revision: 5 })
      draftComment.nextRevision = '6'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isRevisionBelowCurrent).toBe(false)
    })

    it('does not flag an empty or auto revision', async () => {
      await wrapper.setProps({ revision: 5 })
      draftComment.nextRevision = ''
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isRevisionBelowCurrent).toBe(false)
      draftComment.nextRevision = undefined
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isRevisionBelowCurrent).toBe(false)
    })
  })

  describe('revision pre-fill from dropped files', () => {
    it('pre-fills the revision encoded in the file name, including v0', async () => {
      await wrapper.setProps({
        previewForms: [makeFormWithFile('shot_v000.png')]
      })
      await wrapper.vm.$nextTick()
      expect(draftComment.nextRevision).toBe('000')
    })

    it('leaves the revision auto when the file name has none', async () => {
      await wrapper.setProps({ previewForms: [makeFormWithFile('shot.png')] })
      await wrapper.vm.$nextTick()
      expect(draftComment.nextRevision).toBeUndefined()
    })
  })

  // Zou refuses such a revision once the comment is out with its notifications
  // and its status change: nothing may leave the comment box.
  describe('revision the task already has', () => {
    const {
      ADD_PREVIEW_END,
      DELETE_PREVIEW_END,
      LOAD_TASK_COMMENTS_END,
      NEW_TASK_COMMENT_END,
      REMOVE_TASK_COMMENT
    } = tasksStore.mutations

    const takenMessage = () => wrapper.find('.error em')
    const selectFile = name =>
      wrapper.setProps({ previewForms: [makeFormWithFile(name)] })
    const publish = () => wrapper.find('.post-button').trigger('click')
    const publishedRevision = () => wrapper.emitted('add-comment')[0][4]

    const makeComment = (id, previews = []) => ({
      id,
      person: { id: 'person-1', first_name: 'Ann', last_name: 'Lee' },
      person_id: 'person-1',
      previews,
      task_status: {}
    })

    const storedComment = id =>
      store.state.taskComments[task.id].find(comment => comment.id === id)

    const loadRevision = (revision, taskId = task.id) =>
      store.commit('LOAD_TASK_COMMENTS_END', {
        taskId,
        comments: [
          makeComment(`comment-${revision}`, [
            { id: `preview-${revision}`, revision }
          ])
        ]
      })

    const receiveRevision = revision => {
      const commentId = `comment-${revision}`
      store.commit('NEW_TASK_COMMENT_END', {
        comment: makeComment(commentId),
        taskId: task.id
      })
      store.commit('ADD_PREVIEW_END', {
        preview: { id: `preview-${revision}`, revision },
        taskId: task.id,
        commentId,
        comment: storedComment(commentId)
      })
    }

    beforeEach(async () => {
      wrapper.unmount()
      await mountComment(
        { isTaskRevisionTaken: tasksStore.getters.isTaskRevisionTaken },
        {},
        {
          state: {
            taskComments: {},
            taskEntityPreviews: {},
            taskMap: new Map(),
            taskPreviews: {}
          },
          mutations: {
            ADD_PREVIEW_END,
            DELETE_PREVIEW_END,
            LOAD_TASK_COMMENTS_END,
            NEW_TASK_COMMENT_END,
            REMOVE_TASK_COMMENT
          }
        }
      )
      loadRevision(3)
      draftComment.mode = 'publish'
      await nextTick()
    })

    it('refuses the number read from the file name', async () => {
      await selectFile('sh010_v003.mov')

      expect(takenMessage().text()).toBe(
        'Revision 3 already exists. Choose another number.'
      )
      expect(wrapper.find('#input-revision').classes()).toContain(
        'below-current'
      )
      expect(wrapper.find('.post-button').attributes('disabled')).toBe('true')

      await publish()

      expect(wrapper.emitted('add-comment')).toBeUndefined()
    })

    it('refuses a number typed in the field', async () => {
      await selectFile('sh010_v004.mov')
      expect(takenMessage().exists()).toBe(false)

      await wrapper.find('#input-revision').setValue(3)

      expect(takenMessage().text()).toContain('Revision 3 ')
      await publish()
      expect(wrapper.emitted('add-comment')).toBeUndefined()
    })

    it('takes revision 0 for a revision', async () => {
      loadRevision(0)

      await selectFile('sh010_v000.mov')
      expect(takenMessage().text()).toContain('Revision 0 ')

      await wrapper.find('#input-revision').setValue(4)
      expect(takenMessage().exists()).toBe(false)

      await wrapper.find('#input-revision').setValue(0)
      expect(takenMessage().text()).toContain('Revision 0 ')
    })

    it('publishes a number the task does not have', async () => {
      await selectFile('sh010_v004.mov')

      expect(takenMessage().exists()).toBe(false)
      await publish()
      expect(publishedRevision()).toBe(4)
    })

    it('publishes under the next number once the field is cleared', async () => {
      await selectFile('sh010_v003.mov')

      await wrapper.find('.preview-delete-revision').trigger('click')

      expect(takenMessage().exists()).toBe(false)
      await publish()
      expect(publishedRevision()).toBeUndefined()
    })

    // Number('') is 0, a revision like any other.
    it('reads an emptied field as the next number', async () => {
      loadRevision(0)
      await selectFile('sh010_v004.mov')

      await wrapper.find('#input-revision').setValue('')

      expect(takenMessage().exists()).toBe(false)
      await publish()
      expect(publishedRevision()).toBeUndefined()
    })

    it('ignores the revisions of another task', async () => {
      loadRevision(7, 'task-2')

      await selectFile('sh010_v007.mov')

      expect(takenMessage().exists()).toBe(false)
    })

    it('follows a revision published by someone else meanwhile', async () => {
      await selectFile('sh010_v004.mov')

      receiveRevision(4)
      await nextTick()

      expect(takenMessage().text()).toContain('Revision 4 ')
    })

    it('gives back the revision of a comment deleted meanwhile', async () => {
      await selectFile('sh010_v003.mov')

      store.commit('REMOVE_TASK_COMMENT', {
        task,
        comment: storedComment('comment-3')
      })
      await nextTick()

      expect(takenMessage().exists()).toBe(false)
      await publish()
      expect(publishedRevision()).toBe(3)
    })

    // The trash of the player leaves the entry of the revision in the store.
    it('gives back a revision whose files were all deleted', async () => {
      await selectFile('sh010_v003.mov')

      store.commit('DELETE_PREVIEW_END', {
        taskId: task.id,
        previewId: 'preview-3'
      })
      await nextTick()

      expect(takenMessage().exists()).toBe(false)
      await publish()
      expect(publishedRevision()).toBe(3)
    })

    // Its first file joins the store while the next ones still upload.
    it('stays quiet during its own publication', async () => {
      await selectFile('sh010_v004.mov')
      await wrapper.setProps({ isLoading: true })

      receiveRevision(4)
      await nextTick()

      expect(takenMessage().exists()).toBe(false)
    })

    it('leaves a plain comment alone', async () => {
      draftComment.mode = 'status'
      draftComment.nextRevision = '3'
      await nextTick()

      expect(takenMessage().exists()).toBe(false)
      await publish()
      expect(wrapper.emitted('add-comment')).toHaveLength(1)
    })
  })

  describe('mode switching', () => {
    it('clears checklist and attachments when switching to publish', async () => {
      draftComment.checklist = [{ text: 'task', checked: false }]
      draftComment.attachments = [new FormData()]
      draftComment.mode = 'publish'
      await wrapper.vm.$nextTick()
      expect(draftComment.checklist).toEqual([])
      expect(draftComment.attachments).toEqual([])
    })

    it('emits clear-files when switching back to status mode', async () => {
      draftComment.mode = 'publish'
      await wrapper.vm.$nextTick()
      draftComment.mode = 'status'
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('clear-files')).toBeTruthy()
    })
  })

  describe('drag and drop', () => {
    it('sets isDragging on dragover', async () => {
      await wrapper.trigger('dragover')
      expect(wrapper.classes()).toContain('is-dragging')
    })

    it('removes isDragging on dragleave', async () => {
      await wrapper.trigger('dragover')
      await wrapper.trigger('dragleave')
      expect(wrapper.classes()).not.toContain('is-dragging')
    })

    const dropFileOn = element => {
      const event = new Event('drop', { bubbles: true })
      event.dataTransfer = { files: [new File([''], 'notes.txt')] }
      element.dispatchEvent(event)
    }

    it('attaches a file dropped on an icon stroke', () => {
      const svgNamespace = 'http://www.w3.org/2000/svg'
      const icon = document.createElementNS(svgNamespace, 'svg')
      const stroke = document.createElementNS(svgNamespace, 'path')
      icon.appendChild(stroke)
      wrapper.find('.button-row').element.appendChild(icon)
      dropFileOn(stroke)
      expect(draftComment.attachments).toHaveLength(1)
    })

    it('ignores a drop handled by the attachment modal', () => {
      const modalBox = document.createElement('div')
      modalBox.className = 'box attachment-modal-box'
      const dropMask = document.createElement('div')
      dropMask.id = 'drop-mask'
      modalBox.appendChild(dropMask)
      wrapper.element.appendChild(modalBox)
      dropFileOn(dropMask)
      expect(draftComment.attachments).toHaveLength(0)
    })
  })
})
