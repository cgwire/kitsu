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
      .thenBy((a, b) => {
        if (a.episode_name) {
          return a.episode_name.localeCompare(b.episode_name)
        } else {
          return 0
        }
      })
      .thenBy((a, b) => a.sequence_name.localeCompare(b.sequence_name))
      .thenBy((a, b) => a.name.localeCompare(b.name))
  )
}

export const sortSequences = (sequences) => {
  return sequences.sort(
    firstBy('canceled')
      .thenBy((a, b) => {
        if (a.episode_name) {
          return a.episode_name.localeCompare(b.episode_name)
        } else {
          return 0
        }
      })
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
    firstBy('priority', -1)
      .thenBy((a, b) => {
        if (a.project_name) {
          return a.project_name.localeCompare(b.project_name)
        } else {
          return 0
        }
      })
      .thenBy((a, b) => a.task_type_name.localeCompare(b.task_type_name))
      .thenBy((a, b) => {
        if (a.full_entity_name) {
          return a.full_entity_name.localeCompare(b.full_entity_name)
        } else {
          return a.entity_name.localeCompare(b.entity_name)
        }
      })
  )
}

export const sortTaskTypes = (taskTypes) => {
  return taskTypes.sort(
    firstBy('for_shots')
      .thenBy('priority')
      .thenBy('name')
  )
}

export const sortPlaylists = (playlists) => {
  return playlists.sort(
    firstBy('created_at', -1)
      .thenBy((a, b) => a.project_name.localeCompare(b.project_name))
      .thenBy('name')
  )
}

export const sortPeople = (people) => {
  return people.sort(
    firstBy('active', -1)
      .thenBy((a, b) => a.first_name.localeCompare(b.first_name))
      .thenBy((a, b) => a.last_name.localeCompare(b.last_name))
  )
}

export const sortByName = (entries) => {
  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

export const sortByDate = (entries) => {
  return entries.sort(firstBy('created_at', -1))
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
