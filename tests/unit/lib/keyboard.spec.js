import { isCaretMoveOnMac, isFreeEscape, isSearchShortcut } from '@/lib/keyboard'

import { onPlatform } from '../fixtures/platform'

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

  describe('isSearchShortcut', () => {
    const shortcut = init =>
      isSearchShortcut(
        new KeyboardEvent('keydown', { ctrlKey: true, altKey: true, ...init })
      )

    it('matches ctrl+alt+f on a QWERTY or AZERTY layout', () => {
      expect(shortcut({ key: 'f', code: 'KeyF' })).toBe(true)
    })

    it('matches the f of a layout that puts it on another key', () => {
      // bépo types its f on the physical slash key
      expect(shortcut({ key: 'f', code: 'Slash' })).toBe(true)
    })

    it('matches cmd+alt+f on macOS, where alt turns the key into ƒ', () => {
      expect(
        shortcut({ ctrlKey: false, metaKey: true, key: 'ƒ', code: 'KeyF' })
      ).toBe(true)
    })

    it('ignores f without both modifiers', () => {
      expect(shortcut({ altKey: false, key: 'f', code: 'KeyF' })).toBe(false)
      expect(shortcut({ ctrlKey: false, key: 'f', code: 'KeyF' })).toBe(false)
    })

    it('ignores another letter typed on the physical F key', () => {
      // bépo types its e on the physical F key
      expect(shortcut({ key: 'e', code: 'KeyF' })).toBe(false)
    })
  })

  describe('isCaretMoveOnMac', () => {
    afterEach(() => {
      document.body.innerHTML = ''
    })

    const element = html => {
      document.body.innerHTML = html
      return document.body.firstElementChild
    }

    // A keydown of Alt and Left by default, sent from the given element.
    const keydownFrom = (target, init = {}) => {
      const event = new KeyboardEvent('keydown', {
        altKey: true,
        key: 'ArrowLeft',
        ...init
      })
      target.dispatchEvent(event)
      return event
    }

    it('leaves Option and an arrow to a field holding text on macOS', () => {
      onPlatform('MacIntel')
      const input = element('<input type="text" value="Shot">')
      const arrows = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']

      arrows.forEach(key => {
        expect(isCaretMoveOnMac(keydownFrom(input, { key }))).toBe(true)
      })
      const textarea = element('<textarea>A draft</textarea>')
      expect(isCaretMoveOnMac(keydownFrom(textarea))).toBe(true)
    })

    it('reads the arrow from its key code too', () => {
      onPlatform('MacIntel')
      const event = new KeyboardEvent('keydown', { altKey: true })
      Object.defineProperty(event, 'keyCode', { value: 37 })
      element('<input value="Shot">').dispatchEvent(event)

      expect(isCaretMoveOnMac(event)).toBe(true)
    })

    it('leaves the key to the page anywhere else', () => {
      onPlatform('Win32')
      const field = element('<input value="Shot">')
      expect(isCaretMoveOnMac(keydownFrom(field))).toBe(false)

      onPlatform('MacIntel')
      const input = element('<input value="Shot">')
      expect(isCaretMoveOnMac(keydownFrom(input, { altKey: false }))).toBe(
        false
      )
      expect(isCaretMoveOnMac(keydownFrom(input, { key: 'a' }))).toBe(false)
      const checkbox = element('<input type="checkbox">')
      expect(isCaretMoveOnMac(keydownFrom(checkbox))).toBe(false)
      expect(isCaretMoveOnMac(keydownFrom(document.body))).toBe(false)
    })

    // An empty field has no caret to move: the list walks from it.
    it('leaves the key to the page from an empty field', () => {
      onPlatform('MacIntel')

      expect(isCaretMoveOnMac(keydownFrom(element('<input>')))).toBe(false)
      expect(isCaretMoveOnMac(keydownFrom(element('<textarea />')))).toBe(false)
    })

    it('leaves the key to an editable element holding text', () => {
      onPlatform('MacIntel')
      const editor = element('<div contenteditable="true">A draft</div>')
      // jsdom has no isContentEditable: set it as a browser does.
      Object.defineProperty(editor, 'isContentEditable', { value: true })

      expect(isCaretMoveOnMac(keydownFrom(editor))).toBe(true)

      editor.textContent = ''
      expect(isCaretMoveOnMac(keydownFrom(editor))).toBe(false)
    })
  })
})
