import { isFreeEscape } from '@/lib/keyboard'

describe('lib/keyboard', () => {
  describe('isFreeEscape', () => {
    const pageElements = []

    const addToPage = (tag, attributes = {}) => {
      const element = document.createElement(tag)
      Object.entries(attributes).forEach(([name, value]) =>
        element.setAttribute(name, value)
      )
      document.body.appendChild(element)
      pageElements.push(element)
      return element
    }

    // Read from a window listener, where the page handles its Escape, once
    // the handlers of the target ran.
    const isFreeFrom = (target, init = {}) => {
      let isFree = null
      const listener = event => {
        isFree = isFreeEscape(event)
      }
      window.addEventListener('keydown', listener)
      target.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          keyCode: 27,
          bubbles: true,
          cancelable: true,
          ...init
        })
      )
      window.removeEventListener('keydown', listener)
      return isFree
    }

    afterEach(() => {
      pageElements.splice(0).forEach(element => element.remove())
    })

    test('is free on the page when nothing else is open', () => {
      expect(isFreeFrom(document.body)).toBe(true)
      expect(isFreeFrom(addToPage('a'))).toBe(true)
    })

    test('is about Escape only', () => {
      expect(isFreeFrom(document.body, { key: 'Enter', keyCode: 13 })).toBe(
        false
      )
    })

    test('is taken by a handler that closed something on it', () => {
      const combobox = addToPage('div', { role: 'combobox' })
      combobox.addEventListener('keydown', event => event.preventDefault())

      expect(isFreeFrom(combobox)).toBe(false)
    })

    test('is not repeated by a held key', () => {
      expect(isFreeFrom(document.body, { repeat: true })).toBe(false)
    })

    // jsdom has no isContentEditable: set it as a browser does.
    const addEditor = text => {
      const editor = addToPage('div', { contenteditable: 'true' })
      Object.defineProperty(editor, 'isContentEditable', { value: true })
      editor.textContent = text
      return editor
    }

    const addField = (tag, value, attributes = {}) => {
      const field = addToPage(tag, attributes)
      field.value = value
      return field
    }

    test('belongs to the field holding the text it is typed in', () => {
      expect(isFreeFrom(addField('input', 'Draft'))).toBe(false)
      expect(isFreeFrom(addField('input', 'SH0', { type: 'search' }))).toBe(
        false
      )
      expect(isFreeFrom(addField('input', '12', { type: 'number' }))).toBe(
        false
      )
      expect(isFreeFrom(addField('textarea', 'Draft comment'))).toBe(false)
      expect(isFreeFrom(addEditor('Draft'))).toBe(false)
    })

    test('is free in an empty field, like a comment box focused by itself', () => {
      expect(isFreeFrom(addField('input', ''))).toBe(true)
      expect(isFreeFrom(addField('textarea', ''))).toBe(true)
      expect(isFreeFrom(addEditor(''))).toBe(true)
    })

    test('is free in a read-only field', () => {
      const field = addField('input', 'Note 3')
      field.readOnly = true

      expect(isFreeFrom(field)).toBe(true)
    })

    test.each([
      'button',
      'checkbox',
      'color',
      'file',
      'image',
      'radio',
      'range',
      'reset',
      'submit'
    ])('is free on an input of type %s, which holds no text', type => {
      expect(isFreeFrom(addToPage('input', { type, value: 'on' }))).toBe(true)
    })

    test('is free on a closed select', () => {
      const select = addToPage('select')
      select.appendChild(new Option('Hard', 'hard', true, true))

      expect(isFreeFrom(select)).toBe(true)
    })

    test('belongs to an open modal', () => {
      const modal = addToPage('div', { class: 'modal' })
      expect(isFreeFrom(document.body)).toBe(true)

      modal.classList.add('is-active')
      expect(isFreeFrom(document.body)).toBe(false)
    })

    test('belongs to a list or a picker open behind its click mask', () => {
      const mask = addToPage('div', { class: 'c-mask' })
      expect(isFreeFrom(document.body)).toBe(true)

      mask.classList.add('is-active')
      expect(isFreeFrom(document.body)).toBe(false)
    })

    test('belongs to an expanded combobox', () => {
      const combobox = addToPage('div', {
        role: 'combobox',
        'aria-expanded': 'false'
      })
      expect(isFreeFrom(document.body)).toBe(true)

      combobox.setAttribute('aria-expanded', 'true')
      expect(isFreeFrom(document.body)).toBe(false)
    })
  })
})
