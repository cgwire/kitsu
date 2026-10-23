import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import Sequences from '@/components/pages/Sequences.vue'

import { mountEntityPage, production } from '../../fixtures/entity-page'

// The store holds the sequences of the production: the page decides on
// mount whether their scope (episode) is the displayed one.
const mountPage = async getters => {
  const page = await mountEntityPage(Sequences, {
    listName: 'SequenceList',
    getters: {
      sequenceMap: new Map([
        ['sequence-1', { id: 'sequence-1', project_id: production.id }]
      ]),
      sequenceValidationColumns: ['task-type-1'],
      ...getters
    }
  })
  await flushPromises()
  return page.dispatched('loadSequencesWithTasks')
}

describe('Sequences page, reload of another episode', () => {
  test('reloads when the store holds another episode', async () => {
    const loads = await mountPage({
      isTVShow: true,
      currentEpisode: { id: 'ep-b' },
      sequencesLoadingKey: `${production.id}/ep-a`
    })

    expect(loads).toHaveLength(1)
  })

  test('reloads when the store holds the production-wide dataset', async () => {
    const loads = await mountPage({
      isTVShow: true,
      currentEpisode: { id: 'ep-a' },
      sequencesLoadingKey: `${production.id}/all`
    })

    expect(loads).toHaveLength(1)
  })

  test('does not reload when the store holds the displayed episode', async () => {
    const loads = await mountPage({
      isTVShow: true,
      currentEpisode: { id: 'ep-a' },
      sequencesLoadingKey: `${production.id}/ep-a`
    })

    expect(loads).toHaveLength(0)
  })

  test('does not reload on a production without episodes', async () => {
    const loads = await mountPage({
      currentEpisode: { id: 'ep-a' },
      sequencesLoadingKey: `${production.id}/`
    })

    expect(loads).toHaveLength(0)
  })
})
