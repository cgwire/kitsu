export default {
  getters: {
    currentProduction: () => ({
      id: 'production-1',
      name: 'Caminandes',
      team: ['person-2', 'person-3'],
      task_statuses: []
    }),
    productionTaskStatuses: () => [
      { id: 'task-status-1', name: 'Done', short_name: 'done' },
      { id: 'task-status-2', name: 'Wip', short_name: 'wip' }
    ],
    productionTaskTypes: () => [
      { id: 'task-type-1', name: 'Modeling' },
      { id: 'task-type-2', name: 'Animation' }
    ],
    productionAssetTypes: () => [
      { id: 'asset-type-1', name: 'Characters' },
      { id: 'asset-type-2', name: 'Sets' }
    ],
    isTVShow: () => false
  },
  actions: {}
}
