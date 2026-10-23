import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import LoginLogs from '@/components/pages/logs/LoginLogs.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() })
}))

const person = { id: 'person-1', email: 'jane@studio.com', full_name: 'Jane' }

const logs = [
  {
    id: 'log-1',
    created_at: '2026-10-16T10:00:00',
    ip_address: '10.0.0.1',
    origin: 'web',
    person_id: person.id
  },
  {
    id: 'log-2',
    created_at: '2026-10-16T09:00:00',
    ip_address: null,
    origin: null,
    person_id: 'unknown'
  }
]

const mountPage = async (result = logs) => {
  const store = createStore({
    getters: {
      dateFormat: () => 'YYYY-MM-DD',
      people: () => [person],
      personMap: () => new Map([[person.id, person]]),
      use12HourClock: () => false,
      user: () => ({ timezone: 'UTC' })
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve(result))
  const wrapper = shallowMount(LoginLogs, { global: { plugins: [store] } })
  await flushPromises()
  return wrapper
}

describe('pages/logs/LoginLogs', () => {
  describe('card layout', () => {
    test('lists the logins in a card table', async () => {
      const wrapper = await mountPage()
      expect(wrapper.find('table').classes()).toEqual(
        expect.arrayContaining(['datatable', 'datatable--cards'])
      )
      expect(wrapper.findAll('tbody tr.datatable-row')).toHaveLength(2)
    })

    test('heads the card with the person', async () => {
      const wrapper = await mountPage()
      expect(wrapper.find('tbody td.person').classes()).toContain('card-head')
    })

    test('renders no avatar or name for an unknown person', async () => {
      const wrapper = await mountPage()
      const personOf = component => component.props('person')
      expect(wrapper.findAll('tbody tr.datatable-row')).toHaveLength(2)
      expect(wrapper.findAllComponents(PeopleAvatar).map(personOf)).toEqual([
        person
      ])
      expect(wrapper.findAllComponents(PeopleName).map(personOf)).toEqual([
        person
      ])
    })

    test('labels the cells that carry a value', async () => {
      const wrapper = await mountPage()
      const [row, emptyRow] = wrapper.findAll('tbody tr')
      const label = (tr, selector) =>
        tr.find(`td.${selector}`).attributes('data-label')
      expect(label(row, 'date')).toBe('main.date')
      expect(label(row, 'email')).toBe('people.fields.email')
      expect(label(row, 'ip-address')).toBe('logs.logins.ip_address')
      expect(label(row, 'origin')).toBe('logs.logins.origin')
      expect(label(emptyRow, 'email')).toBeUndefined()
      expect(label(emptyRow, 'ip-address')).toBeUndefined()
      expect(label(emptyRow, 'origin')).toBeUndefined()
    })

    test('keeps the load more button out of the table', async () => {
      const page = Array.from({ length: 100 }, (_, i) => ({
        ...logs[0],
        id: `log-${i}`
      }))
      const wrapper = await mountPage(page)
      expect(wrapper.find('.load-more').exists()).toBe(true)
      expect(wrapper.find('table .load-more').exists()).toBe(false)
    })
  })
})
