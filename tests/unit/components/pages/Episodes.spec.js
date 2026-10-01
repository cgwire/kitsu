import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditEpisodeModal from '@/components/modals/EditEpisodeModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import Episodes from '@/components/pages/Episodes.vue'

import { mountEntityPage, production } from '../../fixtures/entity-page'

const mountPage = options =>
  mountEntityPage(Episodes, { listName: 'EpisodeList', ...options })

const episodeMap = projectId =>
  new Map([['episode-1', { id: 'episode-1', project_id: projectId }]])

describe('Episodes page', () => {
  test('loads the episodes of the production on mount', async () => {
    const { dispatched } = await mountPage({
      getters: {
        episodeMap: episodeMap('other-production'),
        episodeValidationColumns: ['task-type-1']
      }
    })

    expect(dispatched('loadEpisodesWithTasks')).toHaveLength(1)
  })

  test('keeps the episodes the store already holds', async () => {
    const { dispatched, list } = await mountPage({
      getters: {
        episodeMap: episodeMap(production.id),
        episodeValidationColumns: ['task-type-1']
      }
    })
    await flushPromises()

    expect(dispatched('loadEpisodesWithTasks')).toHaveLength(0)
    expect(list.selectTaskFromQuery).toHaveBeenCalled()
  })

  test('writes the search in the URL', async () => {
    const { wrapper, router, searchField } = await mountPage({})

    searchField.value = 'e01'
    await wrapper.findComponent({ name: 'SearchField' }).vm.$emit('change')
    await flushPromises()

    expect(router.currentRoute.value.query.search).toBe('e01')
  })

  test('selects the task named in the URL', async () => {
    const { router, list, dispatched } = await mountPage({})
    list.selectTaskFromQuery.mockClear()

    await router.push({ query: { task_id: 'task-1' } })
    await flushPromises()

    expect(list.selectTaskFromQuery).toHaveBeenCalledTimes(1)
    expect(dispatched('clearSelectedEpisodes').length).toBeGreaterThan(0)
  })

  test('opens the edit modal on the episode of the list', async () => {
    const { wrapper } = await mountPage({})
    const episode = { id: 'episode-1', name: 'E01' }

    await wrapper
      .findComponent({ name: 'EpisodeList' })
      .vm.$emit('edit-clicked', episode)

    const modal = wrapper.findComponent(EditEpisodeModal)
    expect(modal.props('active')).toBe(true)
    expect(modal.props('episodeToEdit')).toEqual(episode)
  })

  // The hard delete modal, which asks for the name, replaced the plain one.
  test('opens one delete modal on the episode of the list', async () => {
    const { wrapper } = await mountPage({})

    await wrapper
      .findComponent({ name: 'EpisodeList' })
      .vm.$emit('delete-clicked', { id: 'episode-1', name: 'E01' })

    const openModals = [
      ...wrapper.findAllComponents(DeleteModal),
      ...wrapper.findAllComponents(HardDeleteModal)
    ].filter(modal => modal.props('active'))
    expect(openModals).toHaveLength(1)
    expect(openModals[0].props('lockText')).toBe('E01')
  })
})
