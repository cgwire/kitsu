/*
 * Mixin to add common features to modals including:
 *
 * * Close modal by using the escape key.
 */

export const modalMixin = {

  computed: {
  },

  methods: {
    onKeyDown (event) {
      if (event.key === 'Escape') {
        this.$emit('cancel')
      }
    }
  },

  watch: {
    active () {
      if (this.active) {
        window.addEventListener('keydown', this.onKeyDown, false)
      } else {
        window.removeEventListener('keydown', this.onKeyDown)
      }
    }
  }
}
