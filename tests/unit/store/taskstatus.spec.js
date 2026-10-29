// @vitest-environment node

import store from '@/store/modules/taskstatus'

const statuses = [
  { id: 's1', name: 'Todo', is_client_allowed: false, is_artist_allowed: true },
  { id: 's2', name: 'Retake', is_client_allowed: true, is_artist_allowed: true }
]

const clientGetters = production => ({
  isCurrentUserClient: true,
  currentProduction: production,
  productionMap: new Map([[production.id, production]]),
  productionTaskStatuses: statuses,
  getProductionTaskStatuses: () => statuses
})

describe('taskstatus store', () => {
  describe('getters', () => {
    const production = {
      id: 'p1',
      task_statuses_link: {
        s1: { is_client_allowed: true },
        s2: { is_client_allowed: false }
      }
    }

    test('taskStatusForCurrentUser applies the production override for clients', () => {
      const result = store.getters.taskStatusForCurrentUser(
        {},
        {},
        {},
        clientGetters(production)
      )
      expect(result.map(s => s.id)).toEqual(['s1'])
    })

    test('getTaskStatusForCurrentUser uses the production of projectId', () => {
      const other = { id: 'p2', task_statuses_link: {} }
      const rootGetters = {
        ...clientGetters(production),
        currentProduction: other,
        productionMap: new Map([
          ['p1', production],
          ['p2', other]
        ])
      }
      const result = store.getters.getTaskStatusForCurrentUser(
        {},
        {},
        {},
        rootGetters
      )('p1')
      expect(result.map(s => s.id)).toEqual(['s1'])
    })

    test('clients fall back to the studio value without override', () => {
      const result = store.getters.taskStatusForCurrentUser(
        {},
        {},
        {},
        clientGetters({ id: 'p3' })
      )
      expect(result.map(s => s.id)).toEqual(['s2'])
    })
  })
})
