import { enableAutoUnmount } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import Budget from '@/components/pages/budget/Budget.vue'

import { mountEntityPage } from '../../../fixtures/entity-page'

enableAutoUnmount(afterEach)

const mountBudget = (budgets = []) =>
  mountEntityPage(Budget, {
    listName: 'BudgetList',
    config: {
      globalProperties: { $socket: { on: vi.fn(), off: vi.fn() } }
    },
    getters: {
      currentProduction: {
        id: 'production-1',
        name: 'Production',
        start_date: '2026-01-01',
        end_date: '2026-03-31'
      }
    },
    actions: {
      loadProductionBudgets: () => budgets,
      loadProductionBudgetEntries: () => []
    },
    stubs: { PanelLayout: false }
  })

const header = wrapper => wrapper.findComponent({ name: 'BudgetHeader' })
const list = wrapper => wrapper.findComponent({ name: 'BudgetList' })

describe('Budget page', () => {
  test('lays its header, its list and its analytics out in panels', async () => {
    const { wrapper } = await mountBudget([
      { id: 'budget-1', name: 'First', revision: 1 }
    ])

    expect(header(wrapper.find('.filters-panel')).exists()).toBe(true)
    expect(list(wrapper.find('.list-panel')).exists()).toBe(true)
    expect(
      wrapper
        .find('.side-column')
        .findComponent({ name: 'BudgetAnalytics' })
        .exists()
    ).toBe(true)
  })

  // Without a budget the header is a message and a button: an empty list
  // panel under it would take the page.
  test('shows the header in place of the list without a budget', async () => {
    const { wrapper } = await mountBudget()

    expect(wrapper.find('.filters-panel').exists()).toBe(false)
    expect(header(wrapper.find('.list-panel')).exists()).toBe(true)
    expect(list(wrapper).exists()).toBe(false)
  })
})
