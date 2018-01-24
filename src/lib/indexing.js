/*
 * Build a simple index based on entry names.
 */
export const buildNameIndex = (entries) => {
  const index = {}
  entries.forEach((entry) => {
    let currentString = ''
    for (let character of entry.name) {
      currentString += character.toLowerCase()
      if (index[currentString] === undefined) index[currentString] = []
      index[currentString].push(entry)
    }
  })
  return index
}

/*
 * Generate an index to find task easily. Search will be based on the task
 * entity name and words appearing into it.
 * The result is an array of tasks.
 */
export const buildTaskIndex = (tasks) => {
  const index = {}
  const taskIndex = {}
  tasks.forEach((task) => {
    let stringToIndex = task.full_entity_name.replace(/_/g, ' ').replace(/-/g, ' ')
    let words = stringToIndex.split(' ').concat([
      task.task_type_name,
      task.task_status_short_name
    ])
    indexWords(index, taskIndex, task, words)
  })
  return index
}

/*
 * Generate an index to find asset easily. Search will be based on the asse
 * type name, and words appearing in the asset name.
 * Results are arrays of assets.
 */
export const buildAssetIndex = (entries) => {
  const index = {}
  const assetIndex = {}
  entries.forEach((asset) => {
    let stringToIndex = asset.name.replace(/_/g, ' ').replace(/-/g, ' ')
    let words = stringToIndex.split(' ').concat([asset.asset_type_name])
    indexWords(index, assetIndex, asset, words)
  })
  return index
}

/*
 * Generate an index to find shot easily. Search will be based on the episode,
 * sequence and shot names at the same time.
 * Results are arrays of shots.
 */
export const buildShotIndex = (shots) => {
  const index = {}
  const shotIndex = {}
  shots.forEach((shot) => {
    let words = [shot.name, shot.sequence_name, shot.episode_name]
    indexWords(index, shotIndex, shot, words)
  })
  return index
}

/*
 * Run a non case sensitive search on given index.
 */
export const indexSearch = (index, query) => {
  if (query.length === 0) {
    return null
  } else if (index[query.toLowerCase()]) {
    return index[query.toLowerCase()]
  } else {
    return []
  }
}

/*
 * Index all words in given index. An intermediary index is required
 * to make indexation faster (it is used to know if an asset is linked
 * with current key).
 */
const indexWords = (index, entryIndex, entry, words) => {
  for (let word of words) {
    let currentString = ''
    for (let character of word) {
      currentString += character.toLowerCase()
      if (index[currentString] === undefined) {
        index[currentString] = []
        entryIndex[currentString] = {}
      }

      if (!entryIndex[currentString][entry.id]) {
        index[currentString].push(entry)
        entryIndex[currentString][entry.id] = true
      }
    }
  }
  return index
}
