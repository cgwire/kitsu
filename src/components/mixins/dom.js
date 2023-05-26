/*
 * Helpers to access dom through vanilla javascript.
 */
export const domMixin = {
  created() {},

  mounted() {},

  beforeDestroy() {},

  computed: {},

  methods: {
    isFocusTextArea() {
      return document.activeElement.nodeName === 'TEXTAREA'
    },

    clearFocus() {
      document.activeElement.blur()
    },

    focusInput(inputEl) {
      inputEl.focus()
      inputEl.setSelectionRange(0, inputEl.value.length)
      inputEl.className = 'input'
    },

    onInputBlur(event) {
      event.target.className = 'input stylehidden'
    },

    onInputMouseOut(event) {
      if (document.activeElement !== event.target) {
        event.target.className = 'input stylehidden'
      }
    },

    onInputMouseOver(event) {
      event.target.className = 'input'
    },

    pauseEvent(e) {
      if (e.stopPropagation) e.stopPropagation()
      if (e.preventDefault) e.preventDefault()
      e.cancelBubble = true
      e.returnValue = false
      return false
    },

    addEvents(events) {
      events.forEach(([type, listener]) => {
        document.addEventListener(type, listener)
      })
    },

    removeEvents(events) {
      events.forEach(([type, listener]) => {
        document.removeEventListener(type, listener)
      })
    },

    getClientX(event) {
      return event.touches?.[0].clientX || event.clientX
    },

    getClientY(event) {
      return event.touches?.[0].clientY || event.clientY
    }
  }
}
