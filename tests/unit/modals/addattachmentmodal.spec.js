import { mount } from '@vue/test-utils'

vi.mock('@/composables/modal', () => ({ useModal: () => {} }))

import AddAttachmentModal from '@/components/modals/AddAttachmentModal.vue'

const stubs = {
  FileUploadZone: true,
  MediaRecorderPanel: {
    template: '<div class="panel-stub"></div>',
    emits: ['recorded', 'cancel']
  }
}

const mountModal = (props = {}) =>
  mount(AddAttachmentModal, {
    props: { active: true, ...props },
    global: { mocks: { $t: key => key }, stubs }
  })

describe('modals/AddAttachmentModal', () => {
  beforeEach(() => {
    window.URL.createObjectURL = vi.fn(() => 'blob:fake')
  })

  it('shows the two record buttons by default', () => {
    const wrapper = mountModal()
    expect(wrapper.find('.record-audio').exists()).toBe(true)
    expect(wrapper.find('.record-video').exists()).toBe(true)
  })

  it('hides record buttons when allowRecording is false', () => {
    const wrapper = mountModal({ allowRecording: false })
    expect(wrapper.find('.record-audio').exists()).toBe(false)
  })

  it('opens the panel and pushes a recorded file into the preview list', async () => {
    const wrapper = mountModal()
    await wrapper.find('.record-audio').trigger('click')
    const panel = wrapper.findComponent('.panel-stub')
    expect(panel.exists()).toBe(true)
    const file = new File(['x'], 'audio-note-1.webm', { type: 'audio/webm' })
    panel.vm.$emit('recorded', file)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('audio').exists()).toBe(true)
  })
})
