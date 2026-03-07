import { shallowMount } from '@vue/test-utils'

import SearchField from '@/components/widgets/SearchField.vue'

describe('SearchField', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchField, {
      props: {},
      global: {
        directives: {
          focus: () => {}
        }
      }
    })
  })

  it('mounts successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a search input', () => {
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })

  it('emits change event on input', async () => {
    const input = wrapper.find('.search-input')
    await input.setValue('hello')
    await input.trigger('input')
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')[0]).toEqual(['hello'])
  })

  it('emits enter event on keyup.enter', async () => {
    const input = wrapper.find('.search-input')
    await input.setValue('search term')
    await input.trigger('keyup.enter')
    expect(wrapper.emitted('enter')).toBeTruthy()
    expect(wrapper.emitted('enter')[0]).toEqual(['search term'])
  })

  it('clears search and emits change on clear click', async () => {
    const input = wrapper.find('.search-input')
    await input.setValue('some text')
    const clearButton = wrapper.find('.erase-search .tag')
    await clearButton.trigger('click')
    expect(wrapper.vm.getValue()).toBe('')
    expect(wrapper.emitted('change').pop()).toEqual([''])
  })

  it('does not show save button by default', () => {
    expect(wrapper.find('.save-search').exists()).toBe(false)
  })

  it('shows save button when canSave is true', async () => {
    await wrapper.setProps({ canSave: true })
    expect(wrapper.find('.save-search').exists()).toBe(true)
  })

  it('emits save event when save button is clicked with text', async () => {
    await wrapper.setProps({ canSave: true })
    const input = wrapper.find('.search-input')
    await input.setValue('my query')
    const saveBtn = wrapper.find('.save-button')
    await saveBtn.trigger('click')
    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')[0]).toEqual(['my query'])
  })

  it('does not emit save when search is empty', async () => {
    await wrapper.setProps({ canSave: true })
    const saveBtn = wrapper.find('.save-button')
    await saveBtn.trigger('click')
    expect(wrapper.emitted('save')).toBeFalsy()
  })

  it('renders placeholder', async () => {
    await wrapper.setProps({ placeholder: 'Search...' })
    expect(wrapper.find('.search-input').attributes('placeholder')).toBe(
      'Search...'
    )
  })

  describe('exposed methods', () => {
    it('getValue returns current search text', async () => {
      const input = wrapper.find('.search-input')
      await input.setValue('test')
      expect(wrapper.vm.getValue()).toBe('test')
    })

    it('setValue updates the search text', () => {
      wrapper.vm.setValue('new value')
      expect(wrapper.vm.getValue()).toBe('new value')
    })

    it('clearSearch resets search and emits change', async () => {
      const input = wrapper.find('.search-input')
      await input.setValue('something')
      wrapper.vm.clearSearch()
      expect(wrapper.vm.getValue()).toBe('')
      expect(wrapper.emitted('change').pop()).toEqual([''])
    })
  })

  it('adds focused class on focus', async () => {
    const input = wrapper.find('.search-input')
    await input.trigger('focus')
    expect(wrapper.find('.search-field-wrapper').classes()).toContain('focused')
  })

  it('removes focused class on blur', async () => {
    const input = wrapper.find('.search-input')
    await input.trigger('focus')
    await input.trigger('blur')
    expect(wrapper.find('.search-field-wrapper').classes()).not.toContain(
      'focused'
    )
  })
})
