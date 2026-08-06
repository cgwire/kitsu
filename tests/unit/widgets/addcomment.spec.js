import { reactive } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { createRouter, createWebHistory } from 'vue-router'

import i18n from '@/lib/i18n'
import AddComment from '@/components/widgets/AddComment.vue'

import './setup'

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
  let store, wrapper, draftComment

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

  beforeEach(async () => {
    draftComment = makeDraftComment()

    store = createStore({
      strict: true,
      getters: {
        isDarkTheme: () => false,
        isCurrentUserAdmin: () => false,
        isCurrentUserArtist: () => false,
        isCurrentUserClient: () => false,
        isCurrentUserManager: () => false,
        currentUserRoleForProduction: () => () => null,
        departmentMap: () => new Map(),
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
        uploadProgress: () => ({})
      },
      mutations: {
        CLEAR_UPLOAD_PROGRESS: () => {}
      }
    })

    await router.push('/tasks/task-1')
    await router.isReady()

    wrapper = shallowMount(AddComment, {
      props: {
        task,
        taskStatus: taskStatusList,
        team: [],
        taskTypes: []
      },
      global: {
        plugins: [i18n, store, router],
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
          ConfirmModal: true
        }
      }
    })
  })

  it('mounts successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

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

  it('has the comment input area in status mode', () => {
    // at-ta wraps the comment textarea. Verify the comment area exists.
    const html = wrapper.html()
    expect(
      html.includes('at-ta') || html.includes('textarea')
    ).toBe(true)
  })

  it('updates draft text via exposed API', () => {
    draftComment.text = 'Great work!'
    expect(draftComment.text).toBe('Great work!')
  })

  it('shows post button', () => {
    const postButton = wrapper.find('.post-button')
    expect(postButton.exists()).toBe(true)
  })

  it('emits add-comment when post button is clicked in status mode', async () => {
    const postButton = wrapper.find('.post-button')
    await postButton.trigger('click')
    expect(wrapper.emitted('add-comment')).toBeTruthy()
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
  })
})
