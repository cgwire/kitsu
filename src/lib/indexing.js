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
    let stringToIndex =
      task.full_entity_name.replace(/_/g, ' ').replace(/-/g, ' ')
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
 * Generate an index to find sequence easily. Search will be based on the
 * episode and sequence names at the same time.
 * Results are arrays of sequences.
 */
export const buildSequenceIndex = (sequences) => {
  const index = {}
  const sequenceIndex = {}
  sequences.forEach((sequence) => {
    let words = [sequence.name, sequence.episode_name]
    indexWords(index, sequenceIndex, sequence, words)
  })
  return index
}

/*
 * Generate an index to find episode easily. Search will be based on the
 * episode name.
 * Results are arrays of episodes.
 */
export const buildEpisodeIndex = (episodes) => {
  const index = {}
  const episodeIndex = {}
  episodes.forEach((episode) => {
    let words = [episode.name]
    indexWords(index, episodeIndex, episode, words)
  })
  return index
}

/*
 * Run a non case sensitive search on given index. It accepts different search
 * terms separated by spaces. Terms dedicated to task status filtering (like
 * modeling:wip) are ignored. The result is the intersection of queries.
 */
export const indexSearch = (index, queryText) => {
  if (queryText.length === 0) {
    return null
  } else {
    const queries = queryText.split(' ')
    const results = queries
      .map((query) => indexSearchWord(index, query))
      .filter((result) => result !== null)

    if (results.length > 0) {
      return results.reduce(resultIntersection, [...results[0]])
    } else {
      return null
    }
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
