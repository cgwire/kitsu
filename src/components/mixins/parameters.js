/*
 * Helpers to apply and save parameters to the url and local storage.
 */
import preferences from '@/lib/preferences'

export const parametersMixin = {
  methods: {
    applyParametersToUrl() {
      const query = Object.keys(this.parameters).reduce((acc, key) => {
        if (this.parameters[key]) {
          acc[key] = this.parameters[key]
          if (acc[key] === 'true') {
            acc[key] = true
          } else if (acc[key] === 'false') {
            acc[key] = false
          }
        }
        return acc
      }, {})
      this.$router.replace({ query })
    },

    getParametersFromUrl() {
      return this.$route.query
    },

    applyQueryParameters(params) {
      const urlParams = this.getParametersFromUrl()
      Object.assign(params, urlParams || {})
      return params
    },

    saveParametersToPreferences() {
      preferences.setObjectPreference(
        `parameters:${this.parameterNamespace}`,
        this.parameters
      )
    },

    getParametersFromPreferences(defaultParameters) {
      return (
        preferences.getObjectPreference(
          `parameters:${this.parameterNamespace}`
        ) || defaultParameters
      )
    }
  },

  watch: {
    parameters: {
      deep: true,
      handler() {
        this.applyParametersToUrl()
        this.saveParametersToPreferences()
      }
    }
  }
}
