import { wrapPastedPath } from '@/lib/paste'

const PATH = 'S:\\8_anim\\_lib'

const createTextarea = (value = '', start = value.length, end = start) => {
  const textarea = document.createElement('textarea')
  document.body.appendChild(textarea)
  textarea.value = value
  textarea.setSelectionRange(start, end)
  textarea.addEventListener('paste', wrapPastedPath)
  return textarea
}

const paste = (textarea, text, files = []) => {
  const event = new Event('paste', { bubbles: true, cancelable: true })
  event.clipboardData = {
    files,
    getData: type => (type === 'text/plain' ? text : '')
  }
  textarea.dispatchEvent(event)
  return event
}

describe('lib/paste', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    delete document.execCommand
  })

  describe('wrapPastedPath', () => {
    test('wraps a Windows path pasted alone in backticks', () => {
      const textarea = createTextarea()
      const event = paste(textarea, PATH)
      expect(event.defaultPrevented).toBe(true)
      expect(textarea.value).toBe('`S:\\8_anim\\_lib`')
    })

    test('inserts the path at the caret and puts the caret after it', () => {
      const textarea = createTextarea('See  please', 4)
      paste(textarea, PATH)
      expect(textarea.value).toBe('See `S:\\8_anim\\_lib` please')
      expect(textarea.selectionStart).toBe(20)
      expect(textarea.selectionEnd).toBe(20)
    })

    test('replaces the selected text', () => {
      const textarea = createTextarea('old path here', 0, 8)
      paste(textarea, PATH)
      expect(textarea.value).toBe('`S:\\8_anim\\_lib` here')
    })

    test.each([
      ['a network path', '\\\\NAS\\share\\_lib', '`\\\\NAS\\share\\_lib`'],
      [
        'the quotes of Copy as path',
        '"S:\\8_anim\\_lib\\shot.ma"',
        '`"S:\\8_anim\\_lib\\shot.ma"`'
      ],
      [
        'a path with spaces',
        'C:\\Program Files\\Kitsu',
        '`C:\\Program Files\\Kitsu`'
      ],
      ['a path copied with its line break', `${PATH}\r\n`, `\`${PATH}\``]
    ])('wraps %s', (_, text, expected) => {
      const textarea = createTextarea()
      paste(textarea, text)
      expect(textarea.value).toBe(expected)
    })

    test('tells v-model about the new text', () => {
      const textarea = createTextarea()
      const onInput = vi.fn()
      textarea.addEventListener('input', onInput)
      paste(textarea, PATH)
      expect(onInput).toHaveBeenCalledTimes(1)
    })

    test.each([
      ['a sentence around the path', `see ${PATH}`],
      ['several lines', `${PATH}\nS:\\8_anim\\_old`],
      ['a Unix path', '/mnt/projects/8_anim/_lib'],
      ['a path with forward slashes', 'S:/8_anim/_lib'],
      ['a drive letter alone', 'S:'],
      ['empty text', '']
    ])('leaves %s to the browser', (_, text) => {
      const textarea = createTextarea('Draft')
      const event = paste(textarea, text)
      expect(event.defaultPrevented).toBe(false)
      expect(textarea.value).toBe('Draft')
    })

    test('leaves a pasted file to the attachment handler', () => {
      const textarea = createTextarea()
      const file = new File(['image'], 'shot.png', { type: 'image/png' })
      const event = paste(textarea, PATH, [file])
      expect(event.defaultPrevented).toBe(false)
      expect(textarea.value).toBe('')
    })

    test.each([
      ['an inline code span', 'see `'],
      ['a code block', 'see\n```\n'],
      ['a tilde code block', '~~~\nold path\n']
    ])('leaves the path alone inside %s', (_, value) => {
      const textarea = createTextarea(value)
      const event = paste(textarea, PATH)
      expect(event.defaultPrevented).toBe(false)
      expect(textarea.value).toBe(value)
    })

    test('wraps the path after a closed code span and a closed block', () => {
      const value = '`a` and\n```\nb\n```\n'
      const textarea = createTextarea(value)
      paste(textarea, PATH)
      expect(textarea.value).toBe(`${value}\`${PATH}\``)
    })

    // The stubbed command inserts nothing: the field stays empty unless the
    // fallback inserts the text a second time.
    test('inserts through the editing command when the browser runs it', () => {
      document.execCommand = vi.fn(() => true)
      const textarea = createTextarea()
      paste(textarea, PATH)
      expect(document.execCommand).toHaveBeenCalledWith(
        'insertText',
        false,
        '`S:\\8_anim\\_lib`'
      )
      expect(textarea.value).toBe('')
    })

    // Firefox before 89 refuses the command in a textarea.
    test('inserts the text itself when the browser refuses the command', () => {
      document.execCommand = vi.fn(() => false)
      const textarea = createTextarea()
      paste(textarea, PATH)
      expect(textarea.value).toBe('`S:\\8_anim\\_lib`')
    })
  })
})
