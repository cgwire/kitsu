export default {
  getters: {
    isCurrentUserVendor: () => false,
    people: () => [
      { id: 'person-1', name: 'John', active: true },
      { id: 'person-2', name: 'James', active: true },
      { id: 'person-3', name: 'Ema', active: true }
    ],
    personMap: () => new Map(Object.entries({
      'person-1': { id: 'person-1', name: 'John', active: true },
      'person-2': { id: 'person-2', name: 'James', active: true },
      'person-3': { id: 'person-3', name: 'Ema', active: true }
    }))
  },
  actions: {}
}
