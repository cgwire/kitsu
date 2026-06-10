import { flushPromises, mount } from '@vue/test-utils'

import filesApi from '@/store/api/files'

import DiffViewer from '@/components/players/viewers/DiffViewer.vue'

vi.mock('@/store/api/files', () => ({
  default: { getPreviewFileText: vi.fn() }
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))

const UNIFIED_DIFF = `diff --git a/a.py b/a.py
new file mode 100644
--- /dev/null
+++ b/a.py
@@ -0,0 +1,2 @@
+import os
+print(os.getcwd())
`

// The pretty-printed format some producers upload: no ---/+++ headers,
// no @@ hunk, line numbers baked into each "+N content" line. diff2html
// cannot parse it and returns an empty render.
const PRETTY_DIFF = `/dev/null → tests/test_demarrage.py
   +167 added, -0 removed, ~0 modified

+   1 """Unit tests."""
+   2 import asyncio
`

const mountViewer = () =>
  mount(DiffViewer, {
    props: { preview: { id: 'p1' } },
    global: { mocks: { $t: key => key } }
  })

describe('players/DiffViewer', () => {
  it('renders the diff2html output for a valid unified diff', async () => {
    filesApi.getPreviewFileText.mockResolvedValue(UNIFIED_DIFF)
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.find('.d2h-file-diff').exists()).toBe(true)
    expect(wrapper.find('.diff-raw').exists()).toBe(false)
  })

  it('falls back to readable raw text when the diff is not parseable', async () => {
    filesApi.getPreviewFileText.mockResolvedValue(PRETTY_DIFF)
    const wrapper = mountViewer()
    await flushPromises()
    const raw = wrapper.find('.diff-raw')
    expect(raw.exists()).toBe(true)
    expect(raw.text()).toContain('+167 added')
    expect(wrapper.find('.d2h-file-diff').exists()).toBe(false)
  })
})
