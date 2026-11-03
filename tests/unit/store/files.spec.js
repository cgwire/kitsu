// @vitest-environment node

import { vi } from 'vitest'

import filesApi from '@/store/api/files'
import store from '@/store/modules/files'

describe('Files store', () => {
  test('loadPreviewFileText calls the API and returns its answer', async () => {
    vi.spyOn(filesApi, 'getPreviewFileText').mockResolvedValue('text')

    await expect(
      store.actions.loadPreviewFileText(
        {},
        { previewId: 'p1', extension: 'md', urlPrefix: '/prefix' }
      )
    ).resolves.toBe('text')

    expect(filesApi.getPreviewFileText).toHaveBeenCalledWith(
      'p1',
      'md',
      '/prefix'
    )
  })
})
