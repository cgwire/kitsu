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

export const buildShotIndex = (shots) => {
  const index = {}
  const shotIndex = {}
  shots.forEach((shot) => {
    let words = [shot.name, shot.sequence_name, shot.episode_name]
    indexWords(index, shotIndex, shot, words)
  })
  return index
}

export const indexSearch = (index, query) => {
  if (query.length === 0) {
    return null
  } else if (index[query.toLowerCase()]) {
    return index[query.toLowerCase()]
  } else {
    return []
  }
}
