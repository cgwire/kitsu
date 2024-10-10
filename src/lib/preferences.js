export default {
  setPreference(key, item) {
    return localStorage.setItem(key, item)
  },

  getPreference(key) {
    return localStorage.getItem(key)
  },

  getBoolPreference(key, defvalue = true) {
    const item = this.getPreference(key)
    return item === 'true' ? true : item === 'undefined' ? defvalue : false
  },

  getIntPreference(key, defvalue = 0) {
    const item = this.getPreference(key)
    return item ? parseInt(item) : defvalue
  },

  setObjectPreference(key, data) {
    return localStorage.setItem(key, JSON.stringify(data))
  },

  getObjectPreference(key) {
    const item = this.getPreference(key)
    try {
      return JSON.parse(item)
    } catch (e) {
      return null
    }
  }
}
