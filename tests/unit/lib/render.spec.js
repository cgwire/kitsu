// @vitest-environment node

import {
  getTaskTypeStyle,
  renderComment,
  renderFileSize,
  renderMarkdown,
  safeUrl
} from '@/lib/render'

describe('render', () => {
  describe('safeUrl', () => {
    test('keeps http(s) and relative URLs', () => {
      expect(safeUrl('https://cg-wire.com')).toBe('https://cg-wire.com')
      expect(safeUrl('http://intranet/page')).toBe('http://intranet/page')
      expect(safeUrl('/productions/prod-1')).toBe('/productions/prod-1')
    })

    test('drops unsafe schemes and empty values (SEC-7)', () => {
      expect(safeUrl('javascript:alert(1)')).toBe(null)
      expect(safeUrl(' javascript:alert(1)')).toBe(null)
      expect(safeUrl('data:text/html,<script>x</script>')).toBe(null)
      expect(safeUrl('vbscript:msgbox')).toBe(null)
      expect(safeUrl('')).toBe(null)
      expect(safeUrl(undefined)).toBe(null)
    })
  })

  test('getTaskTypeStyle', () => {
    const task = { task_type_color: 'red' }
    expect(getTaskTypeStyle(task)).toEqual({
      'border-left': '4px solid red'
    })
    expect(getTaskTypeStyle(null)).toEqual({
      'border-left': '4px solid transparent'
    })
  })

  test('renderComment', () => {
    const input = 'Text @Jhon Doe'
    const mentions = ['person-1']
    const personMap = new Map(Object.entries(
      { 'person-1': { id: 'person-1', full_name: 'Jhon Doe' } }
    ))
    const result = renderComment(input, mentions, [], personMap, {})
    expect(result.trim()).toEqual(
      '<p>Text <a class="mention" href="/people/person-1">@Jhon Doe</a></p>'
    )
  })

  test('renderComment with departments', () => {
    const input = 'Text @Modeling'
    const mentions = ['department-1']
    const departmentMap = new Map(Object.entries(
      {
        'department-1': {
          id: 'department-1', name: 'Modeling', color: 'red'
        }
      }
    ))
    const result = renderComment(input, [], mentions, {}, departmentMap)
    expect(result.trim()).toEqual(
      '<p>Text <span style="color: red">@Modeling</span></p>'
    )
  })

  test('renderMarkdown', () => {
    const input = 'Text **bold**'
    const result = renderMarkdown(input)
    expect(result.trim()).toEqual('<p>Text <strong>bold</strong></p>')
  })

  test('renderMarkdown - offensive script', () => {
    const input = 'Text **bold**<script>console.log(\'test\')</script>'
    const result = renderMarkdown(input)
    expect(result.trim()).toEqual('<p>Text <strong>bold</strong></p>')
  })

  test('renderMarkdown - offensive img', () => {
    let input =
      'Text **bold** <img onerror="console.log(\'test\')" src="picture.png" />'
    let result = renderMarkdown(input)
    expect(result.trim()).toEqual(
      '<p>Text <strong>bold</strong> <img src="picture.png" /></p>')
    input = 'Text **bold** <img src="picture.png" />'
    result = renderMarkdown(input)
    expect(result.trim()).toEqual(
      '<p>Text <strong>bold</strong> <img src="picture.png" /></p>')
  })

  test('renderMarkdown - strikethrough', () => {
    const result = renderMarkdown('this is ~~cut~~ kept')
    expect(result.trim()).toEqual('<p>this is <del>cut</del> kept</p>')
  })

  test('renderMarkdown - image keeps alt and title', () => {
    const result = renderMarkdown('![shot](shot.png "Shot 10")')
    expect(result.trim()).toEqual(
      '<p><img src="shot.png" alt="shot" title="Shot 10" /></p>'
    )
  })

  test('renderMarkdown - table column alignment', () => {
    const result = renderMarkdown('| a |\n|:--:|\n| 1 |')
    expect(result).toContain('<th align="center">a</th>')
    expect(result).toContain('<td align="center">1</td>')
  })

  test('renderMarkdown - task-list checkboxes stripped by default', () => {
    const result = renderMarkdown('- [ ] todo\n- [x] done')
    expect(result).not.toContain('<input')
  })

  test('renderMarkdown - task-list checkboxes kept with allowChecklist', () => {
    const result = renderMarkdown('- [ ] todo\n- [x] done', {
      allowChecklist: true
    })
    expect(result).toContain('<input disabled type="checkbox" /> todo')
    expect(result).toContain('<input checked disabled type="checkbox" /> done')
  })

  test('renderMarkdown - checkbox input cannot smuggle other attributes', () => {
    const result = renderMarkdown(
      '<input type="text" onfocus="alert(1)" value="x">',
      { allowChecklist: true }
    )
    expect(result).not.toContain('onfocus')
    expect(result).not.toContain('value')
  })

  test('renderFileSize', () => {
    let size = 1200000
    let result = renderFileSize(size)
    expect(result.trim()).toEqual('1.2M')
    size = 1200000000
    result = renderFileSize(size)
    expect(result.trim()).toEqual('1.2G')
  })
})
