export default {
  /*
   * Detect if number are present in the name and generate the next
   * increment. If there is no number, we consider that a new name
   * must be written.
   */
  generateNextName(name, padding = 1) {
    const matches = name.match(/\d+$/)
    if (matches) {
      const number = matches[0]
      const rootName = name.substring(0, name.length - number.length)
      let numberInt = parseInt(number)
      if (numberInt === 1 && padding === 10) numberInt = 10
      else numberInt += padding
      return rootName + String(numberInt).padStart(number.length, '0')
    } else {
      return ''
    }
  },

  shortenText(text, maxLength) {
    let result = text || ''
    if (text?.length > maxLength) {
      result = text.slice(0, maxLength) + '...'
      result = result.replace(/\n/g, ' ')
    }
    return result
  },

  slugify(str) {
    str = str.replace(/^\s+|\s+$/g, '').toLowerCase()

    const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:'
    const to = 'aaaaeeeeiiiioooouuuunc------'
    for (let i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
    }

    return str
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '_')
      .replace(/-+/g, '_')
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  filenameWithoutExtension(filename) {
    return filename.replace(/\.[^/.]+$/, '')
  },

  insertInTextArea(textarea, text) {
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const textBefore = textarea.value.substring(0, start)
    const textAfter = textarea.value.substring(end)
    const newText = textBefore + text + textAfter
    const newPosition = start + text.length
    setTimeout(() => {
      textarea.setSelectionRange(newPosition, newPosition)
      textarea.focus()
    }, 0)
    return newText
  }
}
