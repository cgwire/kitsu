import { getTaskTypeStyle, renderComment } from '@/lib/render'

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
    const input = "Text @Jhon Doe"
    const mentions = ['person-1']
    const personMap = new Map(Object.entries(
      { 'person-1': { id: 'person-1', full_name: 'Jhon Doe' } }
    ))
    const result = renderComment(input, mentions, personMap)
    expect(result.trim()).toEqual(
      '<p>Text <a class="mention" href="/people/person-1">@Jhon Doe</a></p>'
    )
  })
})
