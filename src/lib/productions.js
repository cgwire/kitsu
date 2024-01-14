export const PRODUCTION_TYPE_OPTIONS = [
  {
    label: 'short',
    value: 'short'
  },
  {
    label: 'tvshow',
    value: 'tvshow'
  },
  {
    label: 'featurefilm',
    value: 'featurefilm'
  },
  {
    label: 'assets',
    value: 'assets'
  },
  {
    label: 'shots',
    value: 'shots'
  }
]

export const PRODUCTION_STYLE_OPTIONS = [
  { label: '2d', value: '2d' },
  { label: '3d', value: '3d' },
  { label: '2d3d', value: '2d3d' },
  { label: 'vfx', value: 'vfx' },
  { label: 'commercial', value: 'commercial' },
  { label: 'vr', value: 'vr' },
  { label: 'motion_design', value: 'motion-design' },
  { label: 'archviz', value: 'archviz' },
  { label: 'stop_motion', value: 'stop-motion' },
  { label: 'catalog', value: 'catalog' },
  { label: 'nft', value: 'nft' },
  { label: 'video_game', value: 'video-game' },
  { label: 'immersive', value: 'immersive' },
  { label: 'ar', value: 'ar' }
]

export const HOME_PAGE_OPTIONS = [
  { label: 'assets', value: 'assets' },
  { label: 'shots', value: 'shots' },
  { label: 'sequences', value: 'sequences' }
]

export function getTaskTypePriorityOfProd(taskType, production) {
  if (!taskType) {
    return 1
  }
  const productionPriority = production?.task_types_priority?.[taskType.id]
  return productionPriority || taskType.priority
}

export function getTaskStatusPriorityOfProd(taskStatus, production) {
  if (!taskStatus) {
    return 1
  }
  const productionPriority =
    production?.task_statuses_link?.[taskStatus.id]?.priority
  return productionPriority || taskStatus.priority
}
