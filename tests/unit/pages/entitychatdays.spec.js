import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import EntityChatDays from '@/components/pages/entities/EntityChatDays.vue'

const user = { id: 'person-1', timezone: 'Europe/Paris' }

const mountDays = messages => {
  const store = createStore({
    getters: {
      dateFormat: () => 'YYYY-MM-DD',
      departmentMap: () => new Map(),
      personMap: () => new Map([[user.id, { ...user, name: 'Jane' }]]),
      use12HourClock: () => false,
      user: () => user
    }
  })
  return shallowMount(EntityChatDays, {
    props: { messages },
    global: { plugins: [store], mocks: { $t: key => key } }
  })
}

const message = (id, createdAt) => ({
  id,
  person_id: user.id,
  created_at: createdAt,
  text: `text ${id}`,
  attachment_files: []
})

describe('EntityChatDays', () => {
  test('groups close messages of one sender under one header', () => {
    const wrapper = mountDays([
      message('m1', '2026-09-01T10:00:00'),
      message('m2', '2026-09-01T10:02:00'),
      message('m3', '2026-09-02T10:00:00')
    ])
    expect(wrapper.findAll('.day-messages')).toHaveLength(2)
    expect(wrapper.findAll('.message')).toHaveLength(2)
    expect(wrapper.findAll('.message-text')).toHaveLength(3)
  })

  test('emits the id of a message to delete', async () => {
    const wrapper = mountDays([message('m1', '2026-09-01T10:00:00')])
    await wrapper.find('.delete-message-button').trigger('click')
    expect(wrapper.emitted('delete-message')).toEqual([['m1']])
  })

  // EntityChat calls it through a template ref after posting a message.
  test('scrolls to the bottom on parent request', () => {
    const wrapper = mountDays([message('m1', '2026-09-01T10:00:00')])
    const container = wrapper.find('.messages').element
    Object.defineProperty(container, 'offsetHeight', { value: 500 })
    wrapper.vm.scrollToBottom()
    expect(container.scrollTop).toBe(500)
  })
})
