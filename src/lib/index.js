let index = {}

export default {
  index (entry) {
    let stringsToIndex = []
    for (let stringToIndex of stringsToIndex) {
      for (let i = 0; i < stringsToIndex.length; i++) {
        let key = stringToIndex.substring(0, i)
        if (index[key] === undefined) index[key] = {}
        index[key][entry.id] = entry
      }
    }
  },

  get (query) {
    query = query.toString().replace(/ |,/g, '') // trim query
    let results = []
    let entries = index[query] || {}
    for (let key of Object.keys(entries)) {
      results.push(entries[key])
    }
    return results
  },

  clear () {
    index = {}
  }
}
