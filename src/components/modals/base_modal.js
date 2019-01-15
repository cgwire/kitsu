/*
 * Mixin to add common features to modals including:
 *
 * * Close modal by using the escape key.
 */

export const modalMixin = {

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  computed: {
  },

  methods: {

    /*
     * Allow to close the modal when escape key is pressed.
     */
    onKeyDown (event) {
      if (event.key === 'Escape') {
        this.$emit('cancel')
      }
    }
  },

  watch: {

    /*
     * Make sure that the keydown event is removed each time, the modla is
     * hidden.
     */
    active () {
      if (this.active) {
        window.addEventListener('keydown', this.onKeyDown, false)
      } else {
        window.removeEventListener('keydown', this.onKeyDown)
      }
    }
  }
}
