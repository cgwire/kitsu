import autosize from 'autosize'

const vAutosize = {
  mounted(el) {
    if (el.tagName === 'TEXTAREA') {
      autosize(el)
      el._autosizeLastValue = el.value
    }
  },
  updated(el) {
    if (el.tagName === 'TEXTAREA' && el.value !== el._autosizeLastValue) {
      el._autosizeLastValue = el.value
      autosize.update(el)
    }
  },
  unmounted(el) {
    autosize.destroy(el)
  }
}

export default vAutosize
