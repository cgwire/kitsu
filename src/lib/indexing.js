// Bookkeeping kept on every index so single entries can be added, updated
// or removed without a full O(N × L²) rebuild. Symbol keys stay invisible
// to the string-keyed substring lookups and to Object.keys/for-in.
const ENTRY_IDS = Symbol('entryIds') // substr → { entryId: true }
const ENTRY_WORDS = Symbol('entryWords') // Map<entryId, lowercased words>

const createIndexPair = () => {
  const index = Object.create(null)
  index[ENTRY_IDS] = Object.create(null)
  index[ENTRY_WORDS] = new Map()
  return { index, entryIndex: index[ENTRY_IDS] }
}

/*
 * Build a simple index based on entry names.
 */
export const buildNameIndex = (entries, split = true, withEmail = false) => {
  const { index, entryIndex } = createIndexPair()
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
 * Build an exact-name index. Used by filter parsers like `fx=DONE` or
 * `department=fx`, which must match the full name and not a substring —
 * otherwise filtering by "fx" would also pick up "cfx", "vfx", etc.
 */
export const buildExactNameIndex = entries => {
  const index = Object.create(null)
  entries.forEach(entry => {
    if (entry?.name) {
      const name = entry.name.toLowerCase()
      if (!index[name]) index[name] = []
      index[name].push(entry)
    }
  })
  return index
}

/*
 * Generate an index to find task type easily.
 */
export const buildTaskTypeIndex = taskTypes => {
  return buildExactNameIndex(taskTypes)
}

/*
 * Generate an index to find task status easily.
 */
export const buildTaskStatusIndex = taskStatuses => {
  const index = Object.create(null)
  taskStatuses.forEach(taskStatus => {
    if (taskStatus?.short_name) {
      const shortName = taskStatus.short_name.toLowerCase()
      index[shortName] = taskStatus
    }
  })
  return index
}

/*
 * Generate an index to find task easily. Search will be based on the task
 * entity name and words appearing into it.
 * The result is an array of tasks.
 */
export const buildTaskIndex = tasks => {
  const { index, entryIndex } = createIndexPair()
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
    indexWords(index, entryIndex, task, words)
  })
  return index
}

/*
 * Generate an index to find task easily. Search will be based on the task
 * entity name, the words appearing into it, the task status name.
 * The result is an array of tasks.
 */
export const buildSupervisorTaskIndex = (tasks, personMap, taskStatusMap) => {
  const { index, entryIndex } = createIndexPair()
  tasks.forEach(task => {
    const stringToIndex = task.entity_name.replace(/_/g, ' ').replace(/-/g, ' ')
    const taskStatus = taskStatusMap.get(task.task_status_id)
    const words = stringToIndex
      .toLowerCase()
      .split(' ')
      .concat([task.entity_name, taskStatus?.short_name ?? ''])
    task.assignees.forEach(personId => {
      const person = personMap.get(personId)
      if (person) words.push(person.first_name, person.last_name)
    })
    indexWords(index, entryIndex, task, words)
  })
  return index
}

/*
 * Generate an index to find asset easily. Search will be based on the asse
 * type name, and words appearing in the asset name.
 * Results are arrays of assets.
 */
export const getAssetIndexWords = asset => {
  const stringToIndex = asset.name.replace(/_/g, ' ').replace(/-/g, ' ')
  let words = []
    .concat(asset.asset_type_name.split(' '))
    .concat(stringToIndex.split(' '))
    .concat([asset.name])
  const camelWords = stringToIndex.match(/[A-Z]+[a-z0-9]*/g)
  if (camelWords) words = words.concat(camelWords)
  return [...new Set(words.map(word => word.toLowerCase()))]
}

export const buildAssetIndex = entries => {
  const { index, entryIndex } = createIndexPair()
  entries.forEach(asset => {
    indexWords(index, entryIndex, asset, getAssetIndexWords(asset))
  })
  return index
}

/*
 * Generate an index to find shot easily. Search will be based on the episode,
 * sequence and shot names at the same time.
 * Results are arrays of shots.
 */
export const getShotIndexWords = shot => [
  shot.name,
  shot.sequence_name,
  shot.episode_name
]

export const buildShotIndex = shots => {
  const { index, entryIndex } = createIndexPair()
  shots.forEach(shot => {
    indexWords(index, entryIndex, shot, getShotIndexWords(shot))
  })
  return index
}

/*
 * Generate an index to find edit easily. Search will be based on the episode
 * and edit names at the same time.
 * Results are arrays of edits.
 */
export const buildEditIndex = edits => {
  const { index, entryIndex } = createIndexPair()
  edits.forEach(edit => {
    const words = [edit.name, edit.episode_name]
    indexWords(index, entryIndex, edit, words)
  })
  return index
}

/*
 * Generate an index to find sequence easily. Search will be based on the
 * episode and sequence names at the same time.
 * Results are arrays of sequences.
 */
export const buildSequenceIndex = sequences => {
  const { index, entryIndex } = createIndexPair()
  sequences.forEach(sequence => {
    const words = [sequence.name, sequence.episode_name]
    indexWords(index, entryIndex, sequence, words)
  })
  return index
}

/*
 * Generate an index to find episode easily. Search will be based on the
 * episode name.
 * Results are arrays of episodes.
 */
export const buildEpisodeIndex = episodes => {
  const { index, entryIndex } = createIndexPair()
  episodes.forEach(episode => {
    const words = [episode.name]
    indexWords(index, entryIndex, episode, words)
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
  const lowerWords = []
  for (const word of words) {
    if (word) {
      const lowerWord = word.toLowerCase()
      lowerWords.push(lowerWord)
      for (let start = 0; start < lowerWord.length; start++) {
        for (let len = 1; len <= lowerWord.length - start; len++) {
          const substr = lowerWord.substring(start, start + len)
          if (index[substr] === undefined) {
            index[substr] = []
            entryIndex[substr] = Object.create(null)
          }

          if (!entryIndex[substr][entry.id]) {
            index[substr].push(entry)
            entryIndex[substr][entry.id] = true
          }
        }
      }
    }
  }
  index[ENTRY_WORDS]?.set(entry.id, lowerWords)
  return index
}

/*
 * Remove a single entry from an index built by one of the build functions
 * above. The words it was indexed under are stored on the index, so this
 * works even after the entry was renamed.
 */
export const removeEntryFromIndex = (index, entry) => {
  const words = index?.[ENTRY_WORDS]?.get(entry.id)
  if (!words) return
  const entryIds = index[ENTRY_IDS]
  const seen = new Set()
  for (const word of words) {
    for (let start = 0; start < word.length; start++) {
      for (let len = 1; len <= word.length - start; len++) {
        const substr = word.substring(start, start + len)
        if (!seen.has(substr)) {
          seen.add(substr)
          const bucket = index[substr]
          if (bucket) {
            const bucketIndex = bucket.findIndex(item => item.id === entry.id)
            if (bucketIndex !== -1) bucket.splice(bucketIndex, 1)
            if (entryIds[substr]) delete entryIds[substr][entry.id]
          }
        }
      }
    }
  }
  index[ENTRY_WORDS].delete(entry.id)
}

/*
 * Add or refresh a single entry in an index without a full rebuild. The
 * words must come from the extractor matching the index type
 * (getShotIndexWords, getAssetIndexWords, …).
 */
export const updateEntryInIndex = (index, entry, words) => {
  if (!index?.[ENTRY_IDS]) return
  removeEntryFromIndex(index, entry)
  indexWords(index, index[ENTRY_IDS], entry, words)
}
