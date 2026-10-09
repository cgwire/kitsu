import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

let routePath = '/quota/month/2026'
const push = vi.fn()
vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRoute: () => ({ path: routePath, query: {} }),
  useRouter: () => ({ push })
}))

import PeopleQuotaInfo from '@/components/sides/PeopleQuotaInfo.vue'

let wrappers = []
const mountPanel = (props = {}, production = { id: 'prod-1' }) => {
  const wrapper = shallowMount(PeopleQuotaInfo, {
    props: {
      person: { id: 'person-1', full_name: 'Jane' },
      year: 2026,
      month: 10,
      week: 41,
      ...props
    },
    global: {
      plugins: [
        createStore({
          getters: {
            currentEpisode: () => null,
            currentProduction: () => production
          }
        })
      ],
      stubs: { RouterLink: { props: ['to'], template: '<a><slot /></a>' } }
    }
  })
  wrappers.push(wrapper)
  return wrapper
}

describe('sides/PeopleQuotaInfo', () => {
  beforeEach(() => {
    routePath = '/quota/month/2026'
    push.mockClear()
  })

  // the panels listen to the window keys until unmounted
  afterEach(() => {
    wrappers.forEach(wrapper => wrapper.unmount())
    wrappers = []
  })

  test('derives its level and close route from the route', () => {
    const wrapper = mountPanel()
    expect(wrapper.find('.info-date').text()).toContain('2026')
    expect(wrapper.findComponent('.close-button').props('to')).toEqual({
      name: 'quota-month',
      params: { year: 2026 },
      query: {}
    })
  })

  test('takes its level and close route from its props', () => {
    routePath = '/my-tasks'
    const closeRoute = { query: { section: 'productivity' } }
    const wrapper = mountPanel({ level: 'week', closeRoute }, null)
    expect(wrapper.find('.info-date').text()).toContain('41')
    expect(wrapper.findComponent('.close-button').props('to')).toEqual(
      closeRoute
    )
  })

  // 2027 starts on a Friday: its ISO week 1 runs from 4 to 10 January,
  // while the locale week 1 holds 1 January
  test('spans the ISO week in the week header', () => {
    const wrapper = mountPanel({ level: 'week', year: 2027, week: 1 })
    expect(wrapper.find('.info-date').text()).toMatch(/1, 4 - 10 Jan 2027/)
  })

  test('closes on Escape', () => {
    const closeRoute = { query: { section: 'productivity' } }
    const wrapper = mountPanel({ level: 'week', closeRoute })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(push).toHaveBeenCalledWith(closeRoute)
    wrapper.unmount()
    wrappers = []
    push.mockClear()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(push).not.toHaveBeenCalled()
  })

  // on the person page the person is already in the page header
  test('leaves the person out when asked to', () => {
    expect(mountPanel().findComponent({ name: 'PeopleAvatar' }).exists()).toBe(
      true
    )
    expect(
      mountPanel({ withPerson: false })
        .findComponent({ name: 'PeopleAvatar' })
        .exists()
    ).toBe(false)
  })
})
