import store from '@/store/modules/studios'

const studios = [
  {
    name: 'NAME1',
    id: '1',
    color: '#ffffff'
  },
  {
    name: 'NAME2',
    id: '2',
    color: '#eeeeee'
  }
]

const studioMap = new Map()
studios.forEach(studio => {
  studioMap.set(studio.id, studio)
})

describe('Productions store', () => {
  describe('Getters', () => {
    let rootState
    beforeEach(() => {
      rootState = {
        studios: [...studios],
        studioMap
      }
    })

    test('studios', () => {
      expect(store.getters.studios(rootState)).toStrictEqual(studios)
    }),
    test('getStudio', () => {
      expect(
        store.getters.getStudio(rootState)(studios[0].id))
        .toStrictEqual(studios[0])
    })
  })

  describe('Mutations', () => {
    let rootState
    beforeEach(() => {
      rootState = {
        studios,
        studioMap
      }
    })

    test('RESET_ALL', () => {
      store.mutations.RESET_ALL(rootState)
      expect(rootState.studios).toEqual([])
    }),

    test('EDIT_STUDIOS_END', () => {
      const newStudio = {
        name: 'NEW STUDIO',
        id: 'newId',
        color: '#eeeeee'
      }
      store.mutations.EDIT_STUDIOS_END(rootState, newStudio)
      const result = studios
      result.push(newStudio)
      expect(rootState.studios).toEqual(result)
    }),

    test('DELETE_STUDIOS_END', () => {
      store.mutations.DELETE_STUDIOS_END(
        rootState, rootState.studios[0])
      store.mutations.DELETE_STUDIOS_END(
        rootState, rootState.studios[0])
      store.mutations.DELETE_STUDIOS_END(
        rootState, rootState.studios[0])
      store.mutations.DELETE_STUDIOS_END(
        rootState, rootState.studios[0])
      expect(rootState.studios).toEqual([])
    })
  })
})
