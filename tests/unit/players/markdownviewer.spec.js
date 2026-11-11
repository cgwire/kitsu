import { flushPromises, mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import MarkdownViewer from '@/components/players/viewers/MarkdownViewer.vue'

const actions = { loadPreviewFileText: vi.fn() }

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))

const mountViewer = async text => {
  actions.loadPreviewFileText.mockResolvedValue(text)
  const wrapper = mount(MarkdownViewer, {
    props: { preview: { id: 'p1' } },
    global: { plugins: [createStore({ actions })] }
  })
  await flushPromises()
  return wrapper
}

describe('players/MarkdownViewer', () => {
  it('keeps the standard escapes of a markdown file', async () => {
    const wrapper = await mountViewer(String.raw`\*literal\* and \_lib`)
    expect(wrapper.find('.markdown-content').html()).toContain(
      '<p>*literal* and _lib</p>'
    )
  })

  it('renders the checklist of a markdown file', async () => {
    const wrapper = await mountViewer('- [x] done')
    expect(wrapper.find('.markdown-content input').attributes()).toMatchObject(
      { checked: '', disabled: '', type: 'checkbox' }
    )
  })
})
