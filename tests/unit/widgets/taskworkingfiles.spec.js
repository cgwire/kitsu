import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TaskWorkingFiles from '@/components/widgets/TaskWorkingFiles.vue'
import filesApi from '@/store/api/files'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))

vi.mock('@/store/api/files', () => ({
  default: {
    getTaskWorkingFiles: vi.fn(),
    getWorkingSoftwares: vi.fn(),
    createTaskWorkingFile: vi.fn(),
    uploadWorkingFile: vi.fn(),
    getWorkingFileBlob: vi.fn()
  }
}))

describe('TaskWorkingFiles', () => {
  let wrapper

  const existingFile = {
    id: 'working-1',
    name: 'main',
    revision: 2,
    path: '/working/main_v002.nk',
    size: 12,
    software_id: 'nuke'
  }

  const mountComponent = async () => {
    wrapper = mount(TaskWorkingFiles, {
      props: { task: { id: 'task-1' }, canAccess: true, canUpload: true },
      global: { mocks: { $t: key => key } }
    })
    await flushPromises()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    filesApi.getTaskWorkingFiles.mockResolvedValue([existingFile])
    filesApi.getWorkingSoftwares.mockResolvedValue([
      {
        id: 'nuke',
        name: 'Nuke',
        file_extension: 'nk',
        secondary_extensions: [],
        archived: false
      }
    ])
  })

  it('lists the server revision and downloads through the authenticated API client', async () => {
    const content = new Blob(['working-content'])
    filesApi.getWorkingFileBlob.mockResolvedValue(content)
    await mountComponent()

    expect(wrapper.text()).toContain('tasks.working_files.revision')
    expect(wrapper.text()).toContain('main_v002.nk')
    await wrapper.find('.working-file-row button').trigger('click')
    await flushPromises()

    expect(filesApi.getWorkingFileBlob).toHaveBeenCalledWith('working-1')
  })

  it('orders revisions newest first within a working-file group', async () => {
    filesApi.getTaskWorkingFiles.mockResolvedValue([
      { ...existingFile, id: 'working-1', revision: 1, path: '/working/main_v001.nk' },
      existingFile
    ])
    await mountComponent()

    const revisions = wrapper.findAll('.working-file-row strong')
    expect(revisions.map(row => row.text())).toEqual([
      'main_v002.nk',
      'main_v001.nk'
    ])
  })

  it('allows an unassigned user to view only when access is explicitly granted', async () => {
    wrapper = mount(TaskWorkingFiles, {
      props: { task: { id: 'task-1' }, canAccess: true, canUpload: false },
      global: { mocks: { $t: key => key } }
    })
    await flushPromises()

    expect(filesApi.getTaskWorkingFiles).toHaveBeenCalledWith('task-1')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('creates a server-numbered revision and uploads the selected file', async () => {
    filesApi.createTaskWorkingFile.mockResolvedValue({ id: 'working-3' })
    const request = { on: vi.fn() }
    filesApi.uploadWorkingFile.mockReturnValue({ request, promise: Promise.resolve() })
    await mountComponent()

    const input = wrapper.get('[data-testid="working-file-input"]')
    const file = new File(['synthetic'], 'shot.nk', { type: 'application/octet-stream' })
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(filesApi.createTaskWorkingFile).toHaveBeenCalledWith('task-1', {
      name: 'main',
      mode: 'working',
      revision: 0,
      software_id: 'nuke'
    })
    expect(filesApi.uploadWorkingFile).toHaveBeenCalledWith(
      'working-3',
      expect.any(FormData)
    )
  })

  it('keeps the same revision id and file when upload fails', async () => {
    filesApi.createTaskWorkingFile.mockResolvedValue({ id: 'working-3' })
    const request = { on: vi.fn() }
    let rejectFirstUpload
    filesApi.uploadWorkingFile
      .mockReturnValueOnce({
        request,
        promise: new Promise((resolve, reject) => {
          rejectFirstUpload = reject
        })
      })
      .mockReturnValueOnce({ request, promise: Promise.resolve() })
    await mountComponent()

    const input = wrapper.get('[data-testid="working-file-input"]')
    const file = new File(['synthetic'], 'shot.nk')
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    rejectFirstUpload({ status: 503 })
    await flushPromises()
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(filesApi.createTaskWorkingFile).toHaveBeenCalledTimes(1)
    expect(filesApi.uploadWorkingFile).toHaveBeenNthCalledWith(
      1,
      'working-3',
      expect.any(FormData)
    )
    expect(filesApi.uploadWorkingFile).toHaveBeenNthCalledWith(
      2,
      'working-3',
      expect.any(FormData)
    )
  })

  it('hides submission and reports denied access when Zou rejects the task list', async () => {
    filesApi.getTaskWorkingFiles.mockRejectedValue({ status: 403 })
    await mountComponent()

    expect(wrapper.text()).toContain('tasks.working_files.errors.forbidden')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('shows download failures to read-only users', async () => {
    filesApi.getWorkingFileBlob.mockRejectedValue({ status: 503 })
    wrapper = mount(TaskWorkingFiles, {
      props: { task: { id: 'task-1' }, canAccess: true, canUpload: false },
      global: { mocks: { $t: key => key } }
    })
    await flushPromises()

    expect(wrapper.find('form').exists()).toBe(false)
    await wrapper.find('.working-file-row button').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe(
      'tasks.working_files.errors.request_failed'
    )
  })

  it('does not fetch or render Working files for a user without task access', async () => {
    wrapper = mount(TaskWorkingFiles, {
      props: { task: { id: 'task-1' }, canAccess: false, canUpload: false },
      global: { mocks: { $t: key => key } }
    })
    await flushPromises()

    expect(filesApi.getTaskWorkingFiles).not.toHaveBeenCalled()
    expect(wrapper.find('.task-working-files').exists()).toBe(false)
  })
})
