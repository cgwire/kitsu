import colors from '@/lib/colors'

describe('colors', () => {
  test('validationTextColor', () => {
    const taskTodo = {
      id: 'task-1',
      task_status_short_name: 'todo',
      is_default: true
    }
    const taskRunning = {
      id: 'task-1',
      task_status_short_name: 'wip'
    }
    expect(colors.validationTextColor(taskTodo)).toEqual('#333')
    expect(colors.validationTextColor(taskRunning)).toEqual('white')
  })

  test('hexToRGBa', () => {
    expect(colors.hexToRGBa('#FFFFFF', 0.4)).toEqual(
      'rgba(255, 255, 255, 0.4)'
    )
    expect(colors.hexToRGBa('#000000', 0.2)).toEqual('rgba(0, 0, 0, 0.2)')
    expect(colors.hexToRGBa('#CC3211')).toEqual('rgb(204, 50, 17)')
  })

  test('darkenColor', () => {
    expect(colors.darkenColor('#FFFFFF')).toEqual(
      { color: [0, 0, 70], model: 'hsl', valpha: 1 }
    )
    expect(colors.darkenColor('#000000')).toEqual(
      { color: [0, 0, 0], model: 'hsl', valpha: 1 }
    )
    expect(colors.darkenColor('#123456')).toEqual(
      {
        color: [210, 104.61538461538464, 14.274509803921568],
        model: 'hsl',
        valpha: 1
      }
    )
  })

  test('lightenColor', () => {
    expect(colors.lightenColor('#FFFFFF')).toEqual(
      { color: [255, 255, 255], model: 'rgb', valpha: 0.7 }
    )
    expect(colors.lightenColor('#000000')).toEqual(
      { color: [0, 0, 0], model: 'rgb', valpha: 0.7 }
    )
    expect(colors.lightenColor('#123456')).toEqual(
      {
        color: [18, 52, 86],
        model: 'rgb',
        valpha: 0.7
      }
    )
  })

  test('fromString', () => {
    expect(colors.fromString('123456')).toEqual('#f0ee75')
    expect(colors.fromString('Jhon Doe')).toEqual('#9e75f0')
  })
})
