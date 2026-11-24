vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/productions/p1/shots', params: {} })
}))

import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import EditCommentModal from '@/components/modals/EditCommentModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'

import { shallowMountWithI18n } from '../fixtures/i18n'

const store = createStore({
  getters: {
    departmentMap: () => new Map(),
    getTaskStatusForCurrentUser: () => () => [],
    isCurrentUserClient: () => false,
    productionDepartmentIds: () => [],
    taskStatusForCurrentUser: () => []
  }
})

const buildComment = (id, checklist) => ({
  id,
  text: `Text of ${id}`,
  task_status_id: `status-${id}`,
  checklist,
  attachment_files: []
})

// TaskInfo keeps the modal mounted and opens it by setting the comment and
// the active flag together; the modal resets its form on both changes.
const openOn = async (wrapper, comment) => {
  await wrapper.setProps({ commentToEdit: comment, active: true })
  vi.advanceTimersByTime(100)
}

const confirmForm = wrapper => {
  wrapper.findComponent(ModalFooter).vm.$emit('confirm')
  return wrapper.emitted('confirm').at(-1)[0]
}

// The link field of a preview comment reports its browser validity.
let isLinkValid = true
const TextFieldStub = {
  name: 'TextField',
  emits: ['enter', 'update:modelValue'],
  methods: {
    checkValidity: () => isLinkValid,
    focus() {}
  },
  template: '<input />'
}

describe('modals/EditCommentModal', () => {
  let wrapper

  const mountModal = (stubs = {}, options = {}) =>
    shallowMount(EditCommentModal, {
      ...options,
      global: {
        plugins: [store],
        stubs: { TextField: TextFieldStub, ...stubs }
      },
      props: { active: false, commentToEdit: null }
    })

  beforeEach(() => {
    vi.useFakeTimers()
    isLinkValid = true
    wrapper = mountModal()
  })

  afterEach(() => {
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('loads the checklist of the comment to edit', async () => {
    const checklist = [{ checked: true, text: 'Fix the arm' }]
    await openOn(wrapper, buildComment('comment-1', checklist))
    expect(confirmForm(wrapper)).toMatchObject({
      id: 'comment-1',
      text: 'Text of comment-1',
      checklist
    })
  })

  // Comments older than Zou's checklist column keep a null checklist.
  // TaskInfo also hands the modal the comment to delete, so a failed reset
  // left that comment's text and status in the form.
  it('edits a comment whose checklist is null', async () => {
    await wrapper.setProps({
      commentToEdit: buildComment('deleted', [{ checked: false, text: 'x' }])
    })
    await openOn(wrapper, buildComment('legacy', null))
    expect(confirmForm(wrapper)).toMatchObject({
      id: 'legacy',
      text: 'Text of legacy',
      task_status_id: 'status-legacy',
      checklist: []
    })
  })

  // The link field confirms on Enter, past the grayed confirm button.
  it('does not confirm on Enter while the link is invalid', async () => {
    await openOn(wrapper, {
      ...buildComment('with-preview', []),
      previews: [{ id: 'preview-1' }]
    })
    const linkField = wrapper.findComponent({ name: 'TextField' })
    isLinkValid = false

    await linkField.vm.$emit('update:modelValue', 'not a link')
    linkField.vm.$emit('enter')
    expect(wrapper.emitted('confirm')).toBeUndefined()

    isLinkValid = true
    await linkField.vm.$emit('update:modelValue', 'https://example.com')
    linkField.vm.$emit('enter')
    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      links: ['https://example.com']
    })
  })

  it('wraps a pasted Windows path in backticks', async () => {
    wrapper.unmount()
    wrapper = mountModal({ AtTextarea: false })
    await openOn(wrapper, buildComment('comment-1', []))
    await wrapper.vm.$nextTick()
    const textarea = wrapper.find('textarea')
    textarea.element.setSelectionRange(0, textarea.element.value.length)
    await textarea.trigger('paste', {
      clipboardData: { files: [], getData: () => 'S:\\8_anim\\_lib' }
    })
    expect(confirmForm(wrapper).text).toBe('`S:\\8_anim\\_lib`')
  })

  // The comment form of a task shows the same order.
  it('lists the statuses in the order of the production', async () => {
    const statuses = [
      { id: 'status-retake', name: 'Retake', short_name: 'retake' },
      { id: 'status-wip', name: 'Work In Progress', short_name: 'wip' }
    ]
    const production = {
      id: 'production-1',
      task_statuses_link: {
        'status-retake': { priority: 2 },
        'status-wip': { priority: 1 }
      }
    }
    const productionStore = createStore({
      getters: {
        currentProduction: () => production,
        departmentMap: () => new Map(),
        getTaskStatusForCurrentUser: () => () => [],
        isCurrentUserClient: () => false,
        isDarkTheme: () => false,
        productionDepartmentIds: () => [],
        productionMap: () => new Map([[production.id, production]]),
        taskStatusForCurrentUser: () => statuses,
        taskStatusMap: () =>
          new Map(statuses.map(status => [status.id, status]))
      }
    })
    wrapper.unmount()
    wrapper = shallowMountWithI18n(EditCommentModal, {
      global: {
        plugins: [productionStore],
        stubs: { ComboboxStatus: false, TextField: TextFieldStub }
      },
      props: { active: false, commentToEdit: null }
    })
    await openOn(wrapper, buildComment('comment-1', []))

    await wrapper.find('[role="combobox"]').trigger('click')

    expect(
      wrapper.findAll('[role="option"] .tag').map(tag => tag.attributes('title'))
    ).toEqual(['Work In Progress', 'Retake'])
  })

  describe('suggestion list', () => {
    const isListOpen = () => wrapper.find('.atwho-panel').exists()

    // vue-at opens its list 10 ms after the keystroke.
    beforeEach(async () => {
      wrapper.unmount()
      wrapper = mountModal({ AtTextarea: false }, { attachTo: document.body })
      await openOn(wrapper, buildComment('comment-1', []))
      await wrapper.find('textarea').setValue('Ready @')
      await vi.advanceTimersByTimeAsync(20)
    })

    it('closes its list on a press elsewhere in the window', async () => {
      expect(isListOpen()).toBe(true)

      wrapper
        .find('.box')
        .element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      await vi.advanceTimersByTimeAsync(20)
      expect(isListOpen()).toBe(false)
    })

    it('closes its list once the focus leaves the field', async () => {
      expect(isListOpen()).toBe(true)

      const nextField = document.createElement('button')
      wrapper.find('.box').element.appendChild(nextField)
      nextField.focus()
      await vi.advanceTimersByTimeAsync(20)
      expect(isListOpen()).toBe(false)
    })

    // A press on the list moves the focus to the window, the closest focusable
    // container of the field.
    it('keeps its list open while an entry is picked with the mouse', async () => {
      const entry = wrapper.find('.atwho-li')
      entry.element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      wrapper.element.focus()
      await vi.advanceTimersByTimeAsync(20)
      expect(document.activeElement).toBe(wrapper.element)
      expect(isListOpen()).toBe(true)

      // The frame entry gives the time of the frame.
      await entry.trigger('click')
      expect(wrapper.find('textarea').element.value).toBe(
        'Ready v1 00:00:00:00 (1) '
      )
    })
  })
})
