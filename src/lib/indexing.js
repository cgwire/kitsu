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

export const indexSearch = (index, query) => {
  if (query.length === 0) {
    return null
  } else if (index[query.toLowerCase()]) {
    return index[query.toLowerCase()]
  } else {
    return []
  }
}
