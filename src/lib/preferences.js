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
  }
}
