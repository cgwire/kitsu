import { describe, expect, it, vi } from 'vitest'
import { sendTaskPluginPreferences } from '../../src/components/sides/taskPluginPreferences'
import { nextTaskPluginTabIndex } from '../../src/components/sides/taskPluginTabs'

const hostWindow = { location: { href: 'http://kitsu.test/task', origin: 'http://kitsu.test' } }

function createFrame(pluginId = 'files', src = '/plugins/files/frontend/') {
  return {
    dataset: { taskPluginId: pluginId },
    getAttribute: vi.fn(() => src),
    contentWindow: { postMessage: vi.fn() }
  }
}

describe('Task plugin preference synchronization', () => {
  it('sends only locale and theme to the selected same-origin plugin iframe', () => {
    const frame = createFrame()

    expect(sendTaskPluginPreferences({
      frame,
      pluginId: 'files',
      url: '/plugins/files/frontend/',
      locale: 'ja',
      darkTheme: true,
      hostWindow
    })).toBe(true)
    expect(frame.contentWindow.postMessage).toHaveBeenCalledWith({
      type: 'kitsu.task-plugin.preferences',
      version: 1,
      locale: 'ja',
      darkTheme: true
    }, hostWindow.location.origin)
  })

  it('does not message an unexpected iframe or cross-origin plugin', () => {
    const frame = createFrame()
    const preferences = { frame, pluginId: 'files', locale: 'en', darkTheme: false, hostWindow }
    expect(sendTaskPluginPreferences({ ...preferences, url: '/plugins/other/frontend/' })).toBe(false)
    expect(sendTaskPluginPreferences({ ...preferences, url: 'https://plugin.example/frontend/' })).toBe(false)
    expect(frame.contentWindow.postMessage).not.toHaveBeenCalled()
  })
})

describe('Task plugin tab keyboard navigation', () => {
  it('wraps arrows and supports Home and End', () => {
    expect(nextTaskPluginTabIndex(0, 3, 'ArrowLeft')).toBe(2)
    expect(nextTaskPluginTabIndex(0, 3, 'ArrowRight')).toBe(1)
    expect(nextTaskPluginTabIndex(2, 3, 'ArrowRight')).toBe(0)
    expect(nextTaskPluginTabIndex(1, 3, 'Home')).toBe(0)
    expect(nextTaskPluginTabIndex(1, 3, 'End')).toBe(2)
    expect(nextTaskPluginTabIndex(1, 3, 'Tab')).toBe(null)
  })
})
