import { mount } from '@vue/test-utils'
import AnnotationBar from '../../src/components/pages/playlists/AnnotationBar'

describe('AnnotationBar', () => {
  const wrapper = mount(AnnotationBar)
  test('should mount for testing', () => {
    expect(1).toEqual(1);
  })
})
