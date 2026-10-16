// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { buildTaskPluginUrl } from '@/components/sides/taskPluginContext'

describe('buildTaskPluginUrl', () => {
  it('passes the active Kitsu Production, Task, entity and type as context hints', () => {
    const url = buildTaskPluginUrl(
      { plugin_id: 'vfx_files' },
      {
        id: 'task-2',
        project_id: 'production-2',
        entity_id: 'shot-2',
        entity_type_name: 'Shot',
        task_type_id: 'task-type-2'
      },
      { darkTheme: true, locale: 'ja-JP' }
    )

    const parsed = new URL(url, 'https://kitsu.test')
    expect(parsed.pathname).toBe('/api/plugins/vfx_files/frontend/')
    const params = parsed.searchParams
    expect(Object.fromEntries(params)).toEqual({
      production_id: 'production-2',
      task_id: 'task-2',
      entity_id: 'shot-2',
      entity_type: 'Shot',
      task_type_id: 'task-type-2',
      dark_theme: 'true',
      locale: 'ja'
    })
  })

  it('fails closed when the current Task lacks stable scope IDs', () => {
    expect(buildTaskPluginUrl({ plugin_id: 'vfx_files' }, { id: 'task-2' })).toBe('')
  })
})
