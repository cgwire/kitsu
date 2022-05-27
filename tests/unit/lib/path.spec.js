import {
  episodifyRoute,
  getEntityPath,
  getPlaylistPath,
  getProductionSchedulePath,
  getTaskEntityPath,
  getTaskPath,
  getTaskTypeSchedulePath
} from '@/lib/path'

describe('path', () => {
  test('getTaskPath', () => {
    expect(getTaskPath(
      {
        id: 1,
        project_id: 2,
        episode_id: 3,
        task_type_id: 3
      },
      {
        id: 5
      },
      true,
      {
        id: 6
      },
      new Map([[3, { for_entity: 'Shot' }]])
    )).toEqual({
      name: 'episode-task',
      params: {
        production_id: 2,
        task_id: 1,
        episode_id: 3,
        type: 'shots'
      }
    })
    expect(getTaskPath(
      {
        id: 1,
        project_id: 2,
        episode_id: 3,
        task_type_id: 3
      },
      {
        id: 5
      },
      false,
      {
        id: 6
      },
      new Map([[3, { for_entity: 'Shot' }]])
    )).toEqual({
      name: 'task',
      params: {
        production_id: 2,
        task_id: 1,
        type: 'shots'
      }
    })
    expect(getTaskPath(
      {
        id: 1,
        project_id: 2,
        episode_id: 3,
        task_type_id: 3
      },
      {
        id: 5
      },
      true,
      null,
      new Map([[3, { for_entity: 'Shot' }]])
    )).toEqual({
      name: 'task',
      params: {
        production_id: 2,
        task_id: 1,
        type: 'shots'
      }
    })
    expect(getTaskPath(
      {
        id: 1,
        project_id: null,
        episode_id: 3,
        task_type_id: 3
      },
      {
        id: 5
      },
      true,
      null,
      new Map([[3, { for_entity: 'Shot' }]])
    )).toEqual({
      name: 'task',
      params: {
        production_id: 5,
        task_id: 1,
        type: 'shots'
      }
    })
    expect(getTaskPath(
      {
        id: 1,
        project_id: null,
        episode_id: 3,
        task_type_id: 3
      },
      {
        id: 5
      },
      true,
      null,
      new Map([[3, { for_entity: 'Asset' }]])
    )).toEqual({
      name: 'task',
      params: {
        production_id: 5,
        task_id: 1,
        type: 'assets'
      }
    })
  })

  test('getTaskEntityPath', () => {
    expect(getTaskEntityPath({
      entity_type_name: 'Shot',
      entity: { id: 2 },
      project_id: 3
    }, 4)).toEqual({
      name: 'episode-shot',
      params: {
        production_id: 3,
        shot_id: 2,
        episode_id: 4
      }
    })
    expect(getTaskEntityPath({
      entity_type_name: 'Asset',
      entity: { id: 2 },
      project_id: 3
    }, 4)).toEqual({
      name: 'episode-asset',
      params: {
        production_id: 3,
        asset_id: 2,
        episode_id: 4
      }
    })
    expect(getTaskEntityPath({
      entity_type_name: 'Shot',
      entity: { id: 2 },
      project_id: 3
    }, null)).toEqual({
      name: 'shot',
      params: {
        production_id: 3,
        shot_id: 2
      }
    })
    expect(getTaskEntityPath({
      entity_type_name: 'Shot',
      entity_id: 2,
      project_id: 3
    }, null)).toEqual({
      name: 'shot',
      params: {
        production_id: 3,
        shot_id: 2
      }
    })
  })
  test('getEntityPath', () => {
    expect(getEntityPath(1, 2, 'other', null)).toEqual({
      name: 'other',
      params: {
        production_id: 2
      }
    })
    expect(getEntityPath(1, 2, 'shot', null)).toEqual({
      name: 'shot',
      params: {
        production_id: 2,
        shot_id: 1
      }
    })
    expect(getEntityPath(1, 2, 'asset', null)).toEqual({
      name: 'asset',
      params: {
        production_id: 2,
        asset_id: 1
      }
    })
    expect(getEntityPath(1, 2, 'shot', 3)).toEqual({
      name: 'episode-shot',
      params: {
        production_id: 2,
        shot_id: 1,
        episode_id: 3
      }
    })
  })
  test('episodifyRoute', () => {
    expect(episodifyRoute({ name: 'test-route', params: {} }, 56)).toEqual({
      name: 'episode-test-route',
      params: {
        episode_id: 56
      }
    })
  })
  test('getPlaylistPath', () => {
    expect(getPlaylistPath(1, null, 2, 'section')).toEqual({
      name: 'section-playlist',
      params: {
        production_id: 1,
        playlist_id: 2
      }
    })
    expect(getPlaylistPath(1, null, 2, null)).toEqual({
      name: 'playlist',
      params: {
        production_id: 1,
        playlist_id: 2
      }
    })
    expect(getPlaylistPath(1, 3, 2, 'section')).toEqual({
      name: 'episode-section-playlist',
      params: {
        production_id: 1,
        playlist_id: 2,
        episode_id: 3
      }
    })
  })
  test('getTaskTypeSchedulePath', () => {
    expect(getTaskTypeSchedulePath(1, 2, null, 'shot')).toEqual({
      name: 'task-type-schedule',
      params: {
        task_type_id: 1,
        type: 'shots',
        production_id: 2
      }
    })
    expect(getTaskTypeSchedulePath(1, 2, 3, 'shot')).toEqual({
      name: 'episode-task-type-schedule',
      params: {
        task_type_id: 1,
        type: 'shots',
        production_id: 2,
        episode_id: 3
      }
    })
  })
  test('getProductionSchedulePath', () => {
    expect(getProductionSchedulePath(2)).toEqual({
      name: 'schedule',
      params: {
        production_id: 2
      }
    })
  })
})
