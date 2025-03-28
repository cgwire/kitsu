export default {
  setPreference(key, item) {
    return localStorage.setItem(key, item)
  },

  getPreference(key) {
    return localStorage.getItem(key)
  },

  getBoolPreference(key, defaultValue = false) {
    const item = this.getPreference(key)
    return item === null ? defaultValue : item === 'true'
  },

  getIntPreference(key, defaultValue = 0) {
    const item = this.getPreference(key)
    const value = parseInt(item)
    return isNaN(value) ? defaultValue : value
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
