import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

const push = vi.fn()
vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRoute: () => ({ name: 'timesheets-month-person', params: {}, query: {} }),
  useRouter: () => ({ push })
}))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

import PeopleTimesheetInfo from '@/components/sides/PeopleTimesheetInfo.vue'

describe('sides/PeopleTimesheetInfo', () => {
  let modal, wrapper

  beforeEach(() => {
    push.mockReset()
    wrapper = shallowMount(PeopleTimesheetInfo, {
      props: { person: { id: 'person-1' }, year: 2026, month: 10 },
      global: {
        plugins: [
          createStore({
            getters: {
              organisation: () => ({ hours_by_day: 8 }),
              use12HourClock: () => false
            }
          })
        ],
        stubs: { RouterLink: true }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
    modal?.remove()
    modal = null
  })

  const pressEscape = () =>
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    )

  test('closes on Escape', () => {
    pressEscape()
    expect(push).toHaveBeenCalledTimes(1)
  })

  test('takes its level and close route from its props', async () => {
    const closeRoute = { query: { section: 'productivity' } }
    await wrapper.setProps({ level: 'week', week: 41, closeRoute })
    expect(wrapper.find('.info-date').text()).toContain('41')
    pressEscape()
    expect(push).toHaveBeenCalledWith(closeRoute)
  })

  test('stays open when the Escape closes a modal', () => {
    modal = document.createElement('div')
    modal.className = 'modal is-active'
    document.body.appendChild(modal)
    pressEscape()
    expect(push).not.toHaveBeenCalled()
  })

  // on the person page the person is already in the page header
  test('leaves the person out when asked to', async () => {
    expect(wrapper.findComponent({ name: 'PeopleAvatar' }).exists()).toBe(true)
    await wrapper.setProps({ withPerson: false })
    expect(wrapper.findComponent({ name: 'PeopleAvatar' }).exists()).toBe(
      false
    )
  })
})
