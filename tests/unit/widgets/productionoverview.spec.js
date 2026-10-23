import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import ProductionOverview from '@/components/widgets/ProductionOverview.vue'
import StatsBar from '@/components/widgets/StatsBar.vue'

const page = { template: '<div />' }
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: page },
    { name: 'playlists', path: '/productions/:production_id/playlists', component: page },
    { name: 'playlist', path: '/productions/:production_id/playlists/:playlist_id', component: page },
    { name: 'episode-playlists', path: '/productions/:production_id/episodes/:episode_id/playlists', component: page },
    { name: 'episode-playlist', path: '/productions/:production_id/episodes/:episode_id/playlists/:playlist_id', component: page },
    { name: 'sequence-stats', path: '/productions/:production_id/sequence-stats', component: page },
    { name: 'episode-stats', path: '/productions/:production_id/episode-stats', component: page }
  ]
})

const production = {
  id: 'production-1',
  name: 'Wing It',
  production_type: 'featurefilm',
  task_types: ['tt-layout', 'tt-anim', 'tt-compo']
}
const task = (task_type_id, task_status_id) => ({ task_type_id, task_status_id })
const entities = [
  {
    id: 'sh-1',
    type: 'Shot',
    tasks: [task('tt-layout', 'done'), task('tt-anim', 'wip')]
  },
  { id: 'sh-2', type: 'Shot', tasks: [task('tt-layout', 'done')] },
  { id: 'as-1', type: 'Asset', tasks: [] }
]
const playlist = (n, episode_id = null) => ({
  id: `playlist-${n}`,
  name: `Playlist ${n}`,
  episode_id,
  updated_at: '2026-10-14T10:00:00'
})

const mountOverview = (props = {}, getterOverrides = {}) => {
  const store = createStore({
    getters: {
      dateFormat: () => 'YYYY-MM-DD',
      getClientAccess: () => () => ({
        isStatsVisible: true,
        isTaskTypeVisible: () => true
      }),
      departmentMap: () =>
        new Map([
          ['dep-anim', { id: 'dep-anim', name: 'Animation', color: '#f00' }],
          ['dep-compo', { id: 'dep-compo', name: 'Compositing', color: '#00f' }]
        ]),
      organisation: () => ({}),
      taskStatusMap: () =>
        new Map([
          [
            'done',
            {
              id: 'done',
              name: 'Done',
              short_name: 'DONE',
              color: '#0f0',
              is_done: true
            }
          ],
          [
            'wip',
            { id: 'wip', name: 'Active', short_name: 'WIP', color: '#ff0' }
          ]
        ]),
      taskTypeMap: () =>
        new Map([
          ['tt-layout', { id: 'tt-layout', department_id: 'dep-anim' }],
          ['tt-anim', { id: 'tt-anim', department_id: 'dep-anim' }],
          ['tt-compo', { id: 'tt-compo', department_id: 'dep-compo' }]
        ]),
      use12HourClock: () => false,
      ...getterOverrides
    }
  })
  return mount(ProductionOverview, {
    props: { production, entities, playlists: [playlist(1)], ...props },
    global: {
      plugins: [router, store],
      mocks: { $t: key => key },
      stubs: { LightEntityThumbnail: true, Spinner: true }
    }
  })
}

describe('ProductionOverview', () => {
  it('shows the progress of each department holding tasks, done statuses first', () => {
    const wrapper = mountOverview()
    expect(
      wrapper.findAll('.department-name').map(name => name.text())
    ).toEqual(['Animation'])
    expect(wrapper.findComponent(StatsBar).props('data')).toEqual([
      ['Done', 2, '#0f0', true],
      ['Active', 1, '#ff0', false]
    ])
  })

  it('orders the statuses: done, retake, approval, then as the production does', () => {
    const taskStatusMap = new Map(
      [
        ['done', { name: 'Done', is_done: true }],
        ['retake', { name: 'Retake', is_retake: true }],
        ['wfa', { name: 'Waiting for approval', is_feedback_request: true }],
        ['wip', { name: 'Work in progress' }],
        ['todo', { name: 'Todo' }],
        ['loose', { name: 'Loose' }]
      ].map(([id, status]) => [id, { id, color: '#000', ...status }])
    )
    const wrapper = mountOverview(
      {
        production: {
          ...production,
          task_statuses: ['wip', 'todo', 'done', 'retake', 'wfa']
        },
        entities: [
          {
            id: 'sh-1',
            type: 'Shot',
            tasks: ['loose', 'todo', 'wip', 'wfa', 'retake', 'done'].map(
              status => task('tt-anim', status)
            )
          }
        ]
      },
      { taskStatusMap: () => taskStatusMap }
    )
    expect(
      wrapper
        .findComponent(StatsBar)
        .props('data')
        .map(row => row[0])
    ).toEqual([
      'Done',
      'Retake',
      'Waiting for approval',
      'Work in progress',
      'Todo',
      'Loose'
    ])
  })

  it('counts the episodes of a tv show under the logo', () => {
    const wrapper = mountOverview({
      production: { ...production, production_type: 'tvshow' },
      episodes: [{ id: 'ep-1' }, { id: 'ep-2' }, { id: 'ep-3', canceled: true }]
    })
    const counts = wrapper.findAll('.counts div').map(count => count.text())
    expect(counts).toEqual([
      '2 episodes.number',
      '2 shots.number',
      '1 assets.number'
    ])
  })

  it('links to the statistics of the production', () => {
    expect(mountOverview().find('a.all-stats').attributes('href')).toBe(
      '/productions/production-1/sequence-stats'
    )
    const tvshow = mountOverview({
      production: { ...production, production_type: 'tvshow' }
    })
    expect(tvshow.find('a.all-stats').attributes('href')).toBe(
      '/productions/production-1/episode-stats'
    )
    const assets = mountOverview({
      production: { ...production, production_type: 'assets' }
    })
    expect(assets.find('a.all-stats').exists()).toBe(false)
  })

  it('hides the progress and the stats link from a client with the stats off', () => {
    const wrapper = mountOverview(
      {},
      {
        getClientAccess: () => id => ({
          isStatsVisible: id !== 'production-1',
          isTaskTypeVisible: () => true
        })
      }
    )
    expect(wrapper.find('.progress-section').exists()).toBe(false)
    expect(wrapper.find('a.all-stats').exists()).toBe(false)
    expect(wrapper.find('a.all-playlists').exists()).toBe(true)
  })

  it('leaves the task types hidden from clients out of the progress', () => {
    const wrapper = mountOverview(
      {},
      {
        getClientAccess: () => () => ({
          isStatsVisible: true,
          isTaskTypeVisible: taskTypeId => taskTypeId !== 'tt-anim'
        })
      }
    )
    expect(wrapper.findComponent(StatsBar).props('data')).toEqual([
      ['Done', 2, '#0f0', true]
    ])
  })

  it('counts the shots and the assets under the logo', () => {
    const wrapper = mountOverview()
    const counts = wrapper.findAll('.counts div').map(count => count.text())
    expect(counts).toEqual(['2 shots.number', '1 assets.number'])
  })

  it('links the production and its playlists to the playlist pages', () => {
    const wrapper = mountOverview({
      production: { ...production, production_type: 'tvshow', first_episode_id: 'ep-1' },
      playlists: [
        playlist(1, 'ep-1'),
        { ...playlist(2), is_for_all: true },
        playlist(3)
      ]
    })
    expect(wrapper.find('a.production').attributes('href')).toBe(
      '/productions/production-1/episodes/ep-1/playlists'
    )
    // A playlist without episode is the main pack, unless it is for all.
    expect(
      wrapper.findAll('a.playlist').map(link => link.attributes('href'))
    ).toEqual([
      '/productions/production-1/episodes/ep-1/playlists/playlist-1',
      '/productions/production-1/episodes/all/playlists/playlist-2',
      '/productions/production-1/episodes/main/playlists/playlist-3'
    ])
  })

  it('keeps the three latest playlists', () => {
    const wrapper = mountOverview({
      playlists: [1, 2, 3, 4].map(n => playlist(n))
    })
    expect(wrapper.findAll('a.playlist')).toHaveLength(3)
    expect(wrapper.find('a.all-playlists').attributes('href')).toBe(
      '/productions/production-1/playlists'
    )
  })

  it('tells when there is nothing to show yet', () => {
    const wrapper = mountOverview({ entities: [], playlists: [] })
    expect(wrapper.text()).toContain('productions.home.no_progress')
    expect(wrapper.text()).toContain('productions.home.no_playlist')
    expect(wrapper.find('a.all-playlists').exists()).toBe(false)
  })
})
