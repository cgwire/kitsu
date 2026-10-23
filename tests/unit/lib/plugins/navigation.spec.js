// @vitest-environment node

import {
  paramsForNamedRoute,
  pathParamNames,
  pickHostParams,
  registerPluginPages,
  resetPluginPages,
  rewriteLocation
} from '@/lib/plugins/navigation'

const stubRouter = (params = {}, routes = []) => ({
  hasRoute: name => routes.some(route => route.name === name),
  getRoutes: () => routes,
  currentRoute: { value: { params } }
})

describe('plugin navigation rewrite', () => {
  afterEach(() => {
    resetPluginPages()
  })

  test('pickHostParams drops page params such as ticketId', () => {
    expect(
      pickHostParams({
        plugin_id: 'tickets',
        production_id: 'prod-1',
        ticketId: 't-1'
      })
    ).toEqual({
      plugin_id: 'tickets',
      production_id: 'prod-1'
    })
  })

  test('pathParamNames reads colon params from a path', () => {
    expect([
      ...pathParamNames(
        '/productions/:production_id/plugins/:plugin_id/:ticketId'
      )
    ]).toEqual(['production_id', 'plugin_id', 'ticketId'])
  })

  test('paramsForNamedRoute keeps only params declared on the target path', () => {
    const router = stubRouter(
      {},
      [
        {
          name: 'tickets-production-plugin-list',
          path: '/productions/:production_id/plugins/:plugin_id'
        }
      ]
    )

    expect(
      paramsForNamedRoute(router, 'tickets-production-plugin-list', {
        plugin_id: 'tickets',
        production_id: 'prod-1',
        ticketId: 'from-detail'
      })
    ).toEqual({
      plugin_id: 'tickets',
      production_id: 'prod-1'
    })
  })

  test('rewrites a short name and keeps only host params from the current route', () => {
    registerPluginPages('tickets', ['list', 'detail'])

    const rewritten = rewriteLocation(
      stubRouter(
        {
          plugin_id: 'tickets',
          production_id: 'prod-1',
          ticketId: 'from-detail'
        },
        [
          {
            name: 'tickets-production-plugin-list',
            path: '/productions/:production_id/plugins/:plugin_id'
          }
        ]
      ),
      { name: 'list' }
    )

    expect(rewritten).toEqual({
      name: 'tickets-production-plugin-list',
      params: {
        plugin_id: 'tickets',
        production_id: 'prod-1'
      }
    })
  })

  test('keeps explicit page params such as ticketId on the target', () => {
    registerPluginPages('tickets', ['detail'])

    const rewritten = rewriteLocation(
      stubRouter(
        {
          plugin_id: 'tickets',
          production_id: 'prod-1'
        },
        [
          {
            name: 'tickets-production-plugin-detail',
            path: '/productions/:production_id/plugins/:plugin_id/:ticketId'
          }
        ]
      ),
      { name: 'detail', params: { ticketId: 't-1' } }
    )

    expect(rewritten).toEqual({
      name: 'tickets-production-plugin-detail',
      params: {
        plugin_id: 'tickets',
        production_id: 'prod-1',
        ticketId: 't-1'
      }
    })
  })
})
