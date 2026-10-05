// @vitest-environment node

import conceptsApi from '@/store/api/concepts'
import store from '@/store/modules/concepts'

describe('Concepts store', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Actions', () => {
    // The page shows its error state on a rejection: a swallowed error
    // left it on "no concept".
    test('loadConcepts rejects when the request fails', async () => {
      const error = new Error('Request has been terminated')
      vi.spyOn(conceptsApi, 'getConcepts').mockRejectedValue(error)
      const commit = vi.fn()

      await expect(
        store.actions.loadConcepts({
          commit,
          rootGetters: { currentProduction: { id: 'production-1' } }
        })
      ).rejects.toBe(error)
      expect(commit).toHaveBeenLastCalledWith('LOAD_CONCEPTS_ERROR')
    })
  })
})
