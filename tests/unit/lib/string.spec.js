// @vitest-environment node

import stringHelpers from '@/lib/string'

describe('lib/string', () => {
  it('generateNextName', () => {
    expect(stringHelpers.generateNextName('Test')).toEqual('')
    expect(stringHelpers.generateNextName('')).toEqual('')
    expect(stringHelpers.generateNextName('EP01')).toEqual('EP02')
    expect(stringHelpers.generateNextName('SH01')).toEqual('SH02')
    expect(stringHelpers.generateNextName('SE_01')).toEqual('SE_02')
    expect(stringHelpers.generateNextName('EP001')).toEqual('EP002')
    expect(stringHelpers.generateNextName('EP009')).toEqual('EP010')
    expect(stringHelpers.generateNextName('001')).toEqual('002')
    expect(stringHelpers.generateNextName('12')).toEqual('13')
  })

  it('generateNextName with step', () => {
    expect(stringHelpers.generateNextName('SH001', 10)).toEqual('SH010')
    expect(stringHelpers.generateNextName('SH010', 10)).toEqual('SH020')
    expect(stringHelpers.generateNextName('SH001', 2)).toEqual('SH003')
  })

  it('generateBulkShotNames', () => {
    expect(stringHelpers.generateBulkShotNames('SH010', 3, 10)).toEqual(['SH010', 'SH020', 'SH030'])
    expect(stringHelpers.generateBulkShotNames('SH001', 3, 1)).toEqual(['SH001', 'SH002', 'SH003'])
    expect(stringHelpers.generateBulkShotNames('SC0010', 3, 10)).toEqual(['SC0010', 'SC0020', 'SC0030'])
    expect(stringHelpers.generateBulkShotNames('SH090', 2, 10)).toEqual(['SH090', 'SH100'])
    expect(stringHelpers.generateBulkShotNames('MAIN', 3, 10)).toEqual([])
    expect(stringHelpers.generateBulkShotNames('SH010', 501, 1)).toHaveLength(500)
  })

  it('shortenText', () => {
    expect(stringHelpers.shortenText('long text', 0)).toEqual('...')
    expect(stringHelpers.shortenText('short text', 10)).toEqual('short text')
    expect(stringHelpers.shortenText('long text', 4)).toEqual('long...')
    expect(stringHelpers.shortenText(null, 4)).toEqual('')
  })

  it('cutToLength', () => {
    expect(stringHelpers.cutToLength('long text', 4)).toEqual('long')
    expect(stringHelpers.cutToLength('short', 10)).toEqual('short')
    // An emoji is one character for Zou, and two for a JavaScript string.
    expect(stringHelpers.cutToLength('😀😀😀', 2)).toEqual('😀😀')
  })

  it('slugify', () => {
    expect(stringHelpers.slugify('text spécial', 0)).toEqual('text_special')
  })

  it('filenameWithoutExtension', () => {
    expect(stringHelpers.filenameWithoutExtension('test')).toEqual('test')
    expect(stringHelpers.filenameWithoutExtension('test.jpg')).toEqual('test')
    expect(stringHelpers.filenameWithoutExtension('test.jpeg')).toEqual('test')
    expect(stringHelpers.filenameWithoutExtension('test.test.jpg')).toEqual('test.test')
  })

  it('toKebabCase', () => {
    expect(stringHelpers.toKebabCase('EP 01 / SQ01 / SH03')).toEqual(
      'ep-01-sq01-sh03'
    )
    expect(stringHelpers.toKebabCase('Été')).toEqual('ete')
    expect(stringHelpers.toKebabCase('')).toEqual('')
    expect(stringHelpers.toKebabCase(null)).toEqual('')
  })

  it('attachmentNamePrefix', () => {
    expect(
      stringHelpers.attachmentNamePrefix('EP 01 / SQ01 / SH03', 'Compositing')
    ).toEqual('ep-01-sq01-sh03-compositing')
    expect(stringHelpers.attachmentNamePrefix('Asset / Robot', '')).toEqual(
      'asset-robot'
    )
    expect(stringHelpers.attachmentNamePrefix('', null)).toEqual('')
  })

  it('snakeToCamel and snakeToPascal turn an icon name into a component name', () => {
    expect(stringHelpers.snakeToCamel('chevron-down')).toEqual('chevronDown')
    expect(stringHelpers.snakeToPascal('arrow-left-circle')).toEqual(
      'ArrowLeftCircle'
    )
    expect(stringHelpers.snakeToPascal('x')).toEqual('X')
  })

  describe('insertInTextArea', () => {
    const buildTextarea = (value, selectionStart, selectionEnd) => ({
      value,
      selectionStart,
      selectionEnd,
      focus: vi.fn(),
      setSelectionRange: vi.fn()
    })

    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('inserts the text at the cursor, then puts the cursor after it', () => {
      const textarea = buildTextarea('Hello world', 5, 5)

      expect(stringHelpers.insertInTextArea(textarea, ',')).toEqual(
        'Hello, world'
      )
      expect(textarea.setSelectionRange).not.toHaveBeenCalled()
      vi.runAllTimers()
      expect(textarea.setSelectionRange).toHaveBeenCalledWith(6, 6)
      expect(textarea.focus).toHaveBeenCalled()
    })

    it('replaces the selected text', () => {
      const textarea = buildTextarea('Hello world', 6, 11)

      expect(stringHelpers.insertInTextArea(textarea, 'there')).toEqual(
        'Hello there'
      )
      vi.runAllTimers()
      expect(textarea.setSelectionRange).toHaveBeenCalledWith(11, 11)
    })

    it('does nothing without a text area', () => {
      expect(stringHelpers.insertInTextArea(null, ',')).toBeUndefined()
    })
  })
})
