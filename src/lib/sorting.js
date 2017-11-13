import firstBy from 'thenby'

export const sortAssets = (assets) => {
  return assets.sort(
    firstBy('canceled')
      .thenBy((a, b) => a.asset_type_name.localeCompare(b.asset_type_name))
      .thenBy((a, b) => a.name.localeCompare(b.name))
  )
}

export const sortShots = (shots) => {
  return shots.sort(
    firstBy('canceled')
      .thenBy((a, b) => a.episode_name.localeCompare(b.episode_name))
      .thenBy((a, b) => a.sequence_name.localeCompare(b.sequence_name))
      .thenBy((a, b) => a.name.localeCompare(b.name))
  )
}

export const sortProductions = (productions) => {
  return productions.sort((a, b) => {
    if (a.project_status_name === b.project_status_name) {
      return a.name.localeCompare(b.name)
    } else {
      return -1 * a.project_status_name.localeCompare(b.project_status_name)
    }
  })
}

export const sortTasks = (tasks) => {
  return tasks.sort(
    firstBy((a, b) => a.project_name.localeCompare(b.project_name))
      .thenBy((a, b) => a.task_type_name.localeCompare(b.task_type_name))
      .thenBy((a, b) => a.entity_name.localeCompare(b.entity_name))
  )
}

export const sortByName = (entries) => {
  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

export const sortValidationColumns = (columns) => {
  return columns.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority > b.priority
    } else {
      return a.name.localeCompare(b.name)
    }
  })
}
