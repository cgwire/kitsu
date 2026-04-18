import store from '@/store/modules/studios'

const makeStudios = () => [
  { name: 'Beta Studio', id: '2', color: '#eeeeee' },
  { name: 'Alpha Studio', id: '1', color: '#ffffff' },
  { name: 'Gamma Studio', id: '3', color: '#dddddd', archived: true }
]

describe('Studios store', () => {
  describe('Getters', () => {
    let rootState

    beforeEach(() => {
      rootState = { studios: makeStudios() }
      store.mutations.LOAD_STUDIOS_END(rootState, rootState.studios)
    })

    test('studios returns non-archived studios', () => {
      const result = store.getters.studios(rootState)
      expect(result).toHaveLength(2)
      expect(result.every(s => !s.archived)).toBe(true)
    })

    test('archivedStudios returns only archived', () => {
      const result = store.getters.archivedStudios(rootState)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('3')
    })

    test('getStudio returns studio by id', () => {
      const studio = store.getters.getStudio(rootState)('1')
      expect(studio.name).toBe('Alpha Studio')
    })

    test('getStudio returns undefined for unknown id', () => {
      const studio = store.getters.getStudio(rootState)('unknown')
      expect(studio).toBeUndefined()
    })
  })

  describe('Mutations', () => {
    let rootState

    beforeEach(() => {
      rootState = { studios: [] }
    })

    test('LOAD_STUDIOS_END sorts studios by name', () => {
      store.mutations.LOAD_STUDIOS_END(rootState, makeStudios())
      expect(rootState.studios[0].name).toBe('Alpha Studio')
      expect(rootState.studios[1].name).toBe('Beta Studio')
      expect(rootState.studios[2].name).toBe('Gamma Studio')
    })

    test('LOAD_STUDIOS_END populates studioMap', () => {
      store.mutations.LOAD_STUDIOS_END(rootState, makeStudios())
      const map = store.getters.studioMap(rootState)
      expect(map.get('1').name).toBe('Alpha Studio')
      expect(map.get('2').name).toBe('Beta Studio')
    })

    test('EDIT_STUDIOS_END adds a new studio', () => {
      store.mutations.LOAD_STUDIOS_END(rootState, makeStudios())
      const newStudio = { name: 'Delta', id: '4', color: '#aaaaaa' }
      store.mutations.EDIT_STUDIOS_END(rootState, newStudio)
      expect(rootState.studios).toHaveLength(4)
      expect(store.getters.studioMap(rootState).get('4').name).toBe('Delta')
    })

    test('EDIT_STUDIOS_END updates an existing studio', () => {
      store.mutations.LOAD_STUDIOS_END(rootState, makeStudios())
      store.mutations.EDIT_STUDIOS_END(rootState, {
        id: '1',
        name: 'Alpha Renamed',
        color: '#000000'
      })
      const studio = store.getters.getStudio(rootState)('1')
      expect(studio.name).toBe('Alpha Renamed')
      expect(studio.color).toBe('#000000')
    })

    test('DELETE_STUDIOS_END removes studio', () => {
      store.mutations.LOAD_STUDIOS_END(rootState, makeStudios())
      store.mutations.DELETE_STUDIOS_END(rootState, { id: '2' })
      expect(rootState.studios).toHaveLength(2)
      expect(store.getters.getStudio(rootState)('2')).toBeUndefined()
    })

    test('DELETE_STUDIOS_END is safe with unknown id', () => {
      store.mutations.LOAD_STUDIOS_END(rootState, makeStudios())
      store.mutations.DELETE_STUDIOS_END(rootState, { id: 'unknown' })
      expect(rootState.studios).toHaveLength(3)
    })

    test('RESET_ALL clears state and map', () => {
      store.mutations.LOAD_STUDIOS_END(rootState, makeStudios())
      store.mutations.RESET_ALL(rootState)
      expect(rootState.studios).toEqual([])
      expect(store.getters.studioMap(rootState).size).toBe(0)
    })
  })
})
