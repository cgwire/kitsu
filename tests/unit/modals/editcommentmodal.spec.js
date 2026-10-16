vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/productions/p1/shots', params: {} })
}))

import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import EditCommentModal from '@/components/modals/EditCommentModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'

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

  beforeEach(() => {
    vi.useFakeTimers()
    isLinkValid = true
    wrapper = shallowMount(EditCommentModal, {
      global: { plugins: [store], stubs: { TextField: TextFieldStub } },
      props: { active: false, commentToEdit: null }
    })
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
})
