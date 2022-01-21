import descriptors from '@/lib/descriptors'

describe('descriptors', () => {
  test('getChoiceOptions', () => {
    const descriptor = {
      field_name: 'difficulty',
      choices: ['easy', 'medium', 'difficult']
    }
    expect(descriptors.getChoicesOptions(descriptor)).toEqual([
      { label: '', value: '' },
      { label: 'easy', value: 'easy' },
      { label: 'medium', value: 'medium' },
      { label: 'difficult', value: 'difficult' }
    ])
  })
})
