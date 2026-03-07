import { shallowMount } from '@vue/test-utils'

import Checklist from '@/components/widgets/Checklist.vue'

const makeChecklist = () => [
  { text: 'Fix eyes', checked: false, frame: -1, revision: -1 },
  { text: 'Adjust timing', checked: true, frame: 10, revision: 2 },
  { text: 'Add blur', checked: false, frame: -1, revision: -1 }
]

const mountChecklist = (props = {}) => {
  return shallowMount(Checklist, {
    props: { checklist: makeChecklist(), ...props },
    global: {
      directives: { autosize: () => {} },
      mocks: { $t: key => key }
    }
  })
}

describe('Checklist', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mountChecklist()
  })

  it('mounts successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders all checklist entries', () => {
    const entries = wrapper.findAll('.checklist-entry')
    expect(entries).toHaveLength(3)
  })

  it('filters out falsy entries', () => {
    const w = shallowMount(Checklist, {
      props: {
        checklist: [
          { text: 'Task 1', checked: false, frame: -1, revision: -1 },
          null,
          { text: 'Task 2', checked: false, frame: -1, revision: -1 }
        ]
      },
      global: {
        directives: { autosize: () => {} },
        mocks: { $t: key => key }
      }
    })
    expect(w.findAll('.checklist-entry')).toHaveLength(2)
  })

  it('renders checked icon for checked entries', () => {
    const entries = wrapper.findAll('.checklist-entry')
    expect(entries[1].classes()).toContain('checked')
  })

  it('renders unchecked icon for unchecked entries', () => {
    const entries = wrapper.findAll('.checklist-entry')
    expect(entries[0].classes()).not.toContain('checked')
  })

  it('toggles entry checked state on checkbox click when editable', async () => {
    const checkboxes = wrapper.findAll('.checklist-checkbox')
    await checkboxes[0].trigger('click')
    expect(wrapper.emitted('emit-change')).toBeTruthy()
  })

  it('does not toggle checked when not editable', async () => {
    const checklist = makeChecklist()
    const w = shallowMount(Checklist, {
      props: { checklist, isEditable: false },
      global: {
        directives: { autosize: () => {} },
        mocks: { $t: key => key }
      }
    })
    const originalChecked = checklist[0].checked
    const checkboxes = w.findAll('.checklist-checkbox')
    await checkboxes[0].trigger('click')
    expect(checklist[0].checked).toBe(originalChecked)
    expect(w.emitted('emit-change')).toBeFalsy()
  })

  it('applies disabled class when not editable', () => {
    const w = mountChecklist({ isEditable: false })
    const entries = w.findAll('.checklist-entry')
    expect(entries[0].classes()).toContain('disabled')
  })

  it('renders textareas for each entry', () => {
    const textareas = wrapper.findAll('.checklist-text')
    expect(textareas).toHaveLength(3)
    expect(textareas[0].element.value).toBe('Fix eyes')
  })

  it('emits add-item on Enter at last entry', async () => {
    const textareas = wrapper.findAll('.checklist-text')
    await textareas[2].trigger('keydown.enter')
    expect(wrapper.emitted('add-item')).toBeTruthy()
    expect(wrapper.emitted('add-item')[0][0]).toMatchObject({
      text: '',
      checked: false,
      frame: -1,
      revision: -1
    })
  })

  it('emits insert-item on Enter at middle entry', async () => {
    const textareas = wrapper.findAll('.checklist-text')
    await textareas[0].trigger('keydown.enter')
    expect(wrapper.emitted('insert-item')).toBeTruthy()
    expect(wrapper.emitted('insert-item')[0][0].index).toBe(1)
  })

  it('emits remove-task on Backspace when entry text is empty', async () => {
    const checklist = [
      { text: '', checked: false, frame: -1, revision: -1 },
      { text: 'Adjust timing', checked: true, frame: 10, revision: 2 }
    ]
    const w = shallowMount(Checklist, {
      props: { checklist },
      global: {
        directives: { autosize: () => {} },
        mocks: { $t: key => key }
      }
    })
    const textareas = w.findAll('.checklist-text')
    await textareas[0].trigger('keyup.backspace')
    expect(w.emitted('remove-task')).toBeTruthy()
    expect(w.emitted('remove-task')[0][0]).toStrictEqual(checklist[0])
  })

  it('does not emit remove-task on Backspace when entry has text', async () => {
    const textareas = wrapper.findAll('.checklist-text')
    await textareas[0].trigger('keyup.backspace')
    expect(wrapper.emitted('remove-task')).toBeFalsy()
  })

  it('shows frame info when entry has a frame', () => {
    const frames = wrapper.findAll('.frame')
    expect(frames).toHaveLength(1)
    expect(frames[0].text()).toContain('v2')
  })

  it('emits time-code-clicked when frame span is clicked', async () => {
    const frame = wrapper.find('.frame')
    await frame.trigger('click')
    expect(wrapper.emitted('time-code-clicked')).toBeTruthy()
    expect(wrapper.emitted('time-code-clicked')[0][0]).toMatchObject({
      frame: 10,
      revision: 2
    })
  })

  it('does not show clock icon when isMoviePreview is false', () => {
    const clocks = wrapper.findAll('.clock')
    expect(clocks).toHaveLength(0)
  })

  it('shows clock icons when isMoviePreview is true', () => {
    const w = mountChecklist({ isMoviePreview: true })
    const clocks = w.findAll('.clock')
    expect(clocks).toHaveLength(3)
  })
})
