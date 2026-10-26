// @vitest-environment node

import {
  PLUGIN_SCOPE_PARENTS,
  pluginRouteName
} from '@/lib/plugins/route-names'

describe('plugin route-names', () => {
  test('maps each scope to the Kitsu parent route name', () => {
    expect(PLUGIN_SCOPE_PARENTS).toEqual({
      studio: 'plugin',
      production: 'production-plugin',
      episode: 'episode-production-plugin'
    })
  })

  test('namespaces short page names under the plugin and parent', () => {
    expect(pluginRouteName('tickets', 'studio', 'list')).toBe(
      'tickets-plugin-list'
    )
    expect(pluginRouteName('tickets', 'production', 'bank')).toBe(
      'tickets-production-plugin-bank'
    )
    expect(pluginRouteName('tickets', 'episode', 'index')).toBe(
      'tickets-episode-production-plugin-index'
    )
  })

  test('rejects an unknown scope', () => {
    expect(() => pluginRouteName('tickets', 'unknown', 'list')).toThrow(
      /Unknown Kitsu plugin route scope/
    )
  })
})
