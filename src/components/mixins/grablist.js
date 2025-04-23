export const grabListMixin = {
  emits: [],

  methods: {
    startBrowsing(event) {
      if (event.target.tagName === 'INPUT') return

      document.body.style.cursor = 'grabbing'
      this.isBrowsingX = true
      this.isBrowsingY = true
      this.initialClientX = this.getClientX(event)
      this.initialClientY = this.getClientY(event)
    },

    startBrowsingX(event) {
      document.body.style.cursor = 'grabbing'
      this.isBrowsingX = true
      this.initialClientX = this.getClientX(event)
    },

    startBrowsingY(event) {
      document.body.style.cursor = 'grabbing'
      this.isBrowsingY = true
      this.initialClientY = this.getClientY(event)
    },

    stopBrowsing(event) {
      document.body.style.cursor = 'default'
      this.isBrowsingX = false
      this.isBrowsingY = false
      this.initialClientX = null
      this.initialClientY = null
    },

    onMouseMove(event) {
      if (this.isBrowsingX) this.scrollTableLeft(event)
      if (this.isBrowsingY) this.scrollTableTop(event)
    },

    scrollTableLeft(event) {
      const tableWrapper = this.$refs.body
      const previousLeft = tableWrapper.scrollLeft
      const movementX =
        event.movementX || this.getClientX(event) - this.initialClientX
      const newLeft = previousLeft - movementX
      this.initialClientX = this.getClientX(event)
      tableWrapper.scrollLeft = newLeft
    },

    scrollTableTop(event) {
      const tableWrapper = this.$refs.body
      const previousTop = tableWrapper.scrollTop
      const movementY =
        event.movementY || this.getClientY(event) - this.initialClientY
      const newTop = previousTop - movementY
      this.initialClientY = this.getClientY(event)
      tableWrapper.scrollTop = newTop
    }
  }
}
