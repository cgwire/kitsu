/*
 * Build a simple index based on entry names.
 */
export const buildNameIndex = (entries, split = true, withEmail = false) => {
  const index = Object.create(null)
  const entryIndex = Object.create(null)
  entries.forEach(entry => {
    if (entry) {
      let words
      if (entry.name || entry.full_name) {
        if (split) {
          words = entry.name.toLowerCase().split(' ')
          if (withEmail && entry.email) {
            words = words
              .concat(entry.email.toLowerCase().split('@')[0].split('.'))
              .concat([entry.email.toLowerCase().split('@')[1].split('.')[0]])
          }
        } else {
          words = [entry.name]
        }
      } else {
        words = []
      }
      indexWords(index, entryIndex, entry, words)
    }
  })
  return index
}

/*
 * Build a simple index based on entry names and the email field..
 */
export const buildPeopleIndex = (entries, split = true) => {
  return buildNameIndex(entries, split, true)
}

/*
 * Generate an index to find task type easily.
 */
export const buildTaskTypeIndex = taskTypes => {
  const sortedTaskTypes = [...taskTypes].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      numeric: true
    })
  )
  return buildNameIndex(sortedTaskTypes, false)
}

/*
 * Generate an index to find task status easily.
 */
export const buildTaskStatusIndex = taskStatuses => {
  const taskStatusShortNameIndex = {}
  taskStatuses.forEach(taskStatus => {
    const shortName = taskStatus.short_name.toLowerCase()
    taskStatusShortNameIndex[shortName] = taskStatus
  })
  return taskStatusShortNameIndex
}

/*
 * Generate an index to find task easily. Search will be based on the task
 * entity name and words appearing into it.
 * The result is an array of tasks.
 */
export const buildTaskIndex = tasks => {
  const index = Object.create(null)
  const taskIndex = Object.create(null)
  tasks.forEach(task => {
    const stringToIndex = task.full_entity_name
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
    const words = stringToIndex
      .toLowerCase()
      .split(' ')
      .concat([
        task.task_type_name,
        task.task_status_short_name,
        task.project_name
      ])
    indexWords(index, taskIndex, task, words)
  })
  return index
}

/*
 * Generate an index to find task easily. Search will be based on the task
 * entity name, the words appearing into it, the task status name.
 * The result is an array of tasks.
 */
export const buildSupervisorTaskIndex = (tasks, personMap, taskStatusMap) => {
  const index = Object.create(null)
  const taskIndex = Object.create(null)
  tasks.forEach(task => {
    const stringToIndex = task.entity_name.replace(/_/g, ' ').replace(/-/g, ' ')
    const taskStatus = taskStatusMap.get(task.task_status_id)
    const words = stringToIndex
      .toLowerCase()
      .split(' ')
      .concat([task.entity_name, taskStatus.short_name])
    task.assignees.forEach(personId => {
      const person = personMap.get(personId)
      if (person) words.push(person.first_name, person.last_name)
    })
    indexWords(index, taskIndex, task, words)
  })
  return index
}

/*
 * Generate an index to find asset easily. Search will be based on the asse
 * type name, and words appearing in the asset name.
 * Results are arrays of assets.
 */
export const buildAssetIndex = entries => {
  const index = Object.create(null)
  const assetIndex = Object.create(null)
  entries.forEach(asset => {
    const stringToIndex = asset.name.replace(/_/g, ' ').replace(/-/g, ' ')
    let words = []
      .concat(asset.asset_type_name.split(' '))
      .concat(stringToIndex.split(' '))
      .concat([asset.name])
    const camelWords = stringToIndex.match(/[A-Z]+[a-z0-9]*/g)
    if (camelWords) words = words.concat(camelWords)
    words = [...new Set(words.map(word => word.toLowerCase()))]
    indexWords(index, assetIndex, asset, words)
  })
  return index
}

/*
 * Generate an index to find shot easily. Search will be based on the episode,
 * sequence and shot names at the same time.
 * Results are arrays of shots.
 */
export const buildShotIndex = shots => {
  const index = Object.create(null)
  const shotIndex = Object.create(null)
  shots.forEach(shot => {
    const words = [shot.name, shot.sequence_name, shot.episode_name]
    indexWords(index, shotIndex, shot, words)
  })
  return index
}

/*
 * Generate an index to find edit easily. Search will be based on the episode
 * and edit names at the same time.
 * Results are arrays of edits.
 */
export const buildEditIndex = edits => {
  const index = Object.create(null)
  const editIndex = Object.create(null)
  edits.forEach(edit => {
    const words = [edit.name, edit.episode_name]
    indexWords(index, editIndex, edit, words)
  })
  return index
}

/*
 * Generate an index to find sequence easily. Search will be based on the
 * episode and sequence names at the same time.
 * Results are arrays of sequences.
 */
export const buildSequenceIndex = sequences => {
  const index = Object.create(null)
  const sequenceIndex = Object.create(null)
  sequences.forEach(sequence => {
    const words = [sequence.name, sequence.episode_name]
    indexWords(index, sequenceIndex, sequence, words)
  })
  return index
}

/*
 * Generate an index to find episode easily. Search will be based on the
 * episode name.
 * Results are arrays of episodes.
 */
export const buildEpisodeIndex = episodes => {
  const index = Object.create(null)
  const episodeIndex = Object.create(null)
  episodes.forEach(episode => {
    const words = [episode.name]
    indexWords(index, episodeIndex, episode, words)
  })
  return index
}

/*
 * Run a non case sensitive search on given index. It accepts different search
 * terms separated by spaces. Terms dedicated to task status filtering (like
 * modeling=wip) are ignored. The result is the intersection of queries.
 */
export const indexSearch = (index, keywords) => {
  if (!keywords) keywords = []
  const results = keywords
    .map(query => indexSearchWord(index, query))
    .filter(result => result !== null)

  if (results.length > 0) {
    return results.reduce(resultIntersection, [...results[0]])
  } else {
    return null
  }
}

/*
 * Turn an array of sets in an array which is the intersection of elements of
 * all sets.
 */
const resultIntersection = (a, b) => {
  return a.filter(x => b.has(x))
}

/*
 * Return search result for a given word and a given index. Empty word or task
 * type queries are returned as null.
 */
const indexSearchWord = (index, word) => {
  if (word && word.indexOf('=') < 0) {
    if (index[word.toLowerCase()]) {
      return new Set(index[word.toLowerCase()])
    } else {
      return new Set([])
    }
  } else {
    return null
  }
}

/*
 * Index all words in given index. An intermediary index is required
 * to make indexation faster (it is used to know if an asset is linked
 * with current key).
 */
const indexWords = (index, entryIndex, entry, words) => {
  for (const word of words) {
    let currentString = ''
    if (word) {
      for (const character of word) {
        currentString += character.toLowerCase()
        if (index[currentString] === undefined) {
          index[currentString] = []
          entryIndex[currentString] = Object.create(null)
        }

        if (!entryIndex[currentString][entry.id]) {
          index[currentString].push(entry)
          entryIndex[currentString][entry.id] = true
        }
      }
    }
  }
  return index
}
