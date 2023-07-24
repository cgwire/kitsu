import {
  getTaskTypeStyle,
  renderComment,
  renderFileSize,
  renderMarkdown
} from '@/lib/render'

describe('render', () => {
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
      '<p>Text <strong>bold</strong> <img src=\"picture.png\" /></p>')
    input = 'Text **bold** <img src="picture.png" />'
    result = renderMarkdown(input)
    expect(result.trim()).toEqual(
      '<p>Text <strong>bold</strong> <img src=\"picture.png\" /></p>')
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
