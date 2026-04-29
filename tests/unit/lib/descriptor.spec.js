import { getDescriptorChoicesOptions } from '@/lib/descriptors'

describe('descriptors', () => {
  test('getDescriptorChoicesOptions', () => {
    const descriptor = {
      field_name: 'difficulty',
      choices: ['easy', 'medium', 'difficult']
    }
    expect(getDescriptorChoicesOptions(descriptor)).toEqual([
      { label: '', value: '' },
      { label: 'easy', value: 'easy' },
      { label: 'medium', value: 'medium' },
      { label: 'difficult', value: 'difficult' }
    ])
  })

  test('getDescriptorChoicesOptions with missing choices', () => {
    expect(getDescriptorChoicesOptions({})).toEqual([{ label: '', value: '' }])
    expect(getDescriptorChoicesOptions(null)).toEqual([
      { label: '', value: '' }
    ])
  })

  test('getDescriptorChoicesOptions without empty choice', () => {
    const descriptor = { choices: ['a', 'b'] }
    expect(getDescriptorChoicesOptions(descriptor, false)).toEqual([
      { label: 'a', value: 'a' },
      { label: 'b', value: 'b' }
    ])
  })
})
