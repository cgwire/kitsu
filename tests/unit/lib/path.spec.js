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
    expect(getTaskEntityPath({
      entity_type_name: 'Sequence',
      entity: { id: 2 },
      project_id: 3
    }, null)).toEqual({
      name: 'sequence',
      params: {
        production_id: 3,
        sequence_id: 2
      }
    })
    expect(getTaskEntityPath({
      entity_type_name: 'Sequence',
      entity: { id: 2 },
      project_id: 3
    }, 4)).toEqual({
      name: 'episode-sequence',
      params: {
        production_id: 3,
        sequence_id: 2,
        episode_id: 4
      }
    })
    expect(getTaskEntityPath({
      entity_type_name: 'Edit',
      entity: { id: 2 },
      project_id: 3
    }, null)).toEqual({
      name: 'edit',
      params: {
        production_id: 3,
        edit_id: 2
      }
    })
    expect(getTaskEntityPath({
      entity_type_name: 'Edit',
      entity: { id: 2 },
      project_id: 3
    }, 4)).toEqual({
      name: 'episode-edit',
      params: {
        production_id: 3,
        edit_id: 2,
        episode_id: 4
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
    expect(getEntityPath(1, 2, 'asset', null, { param: 'test' })).toEqual({
      name: 'asset',
      params: {
        production_id: 2,
        asset_id: 1
      },
      query: {
        param: 'test'
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
  test('getTaskPath with a missing task type', () => {
    // vue-router rejects an empty required param, so the :type segment must
    // still resolve when the task type is absent from the map.
    expect(
      getTaskPath(
        {
          id: 1,
          project_id: 2,
          task_type_id: 'gone',
          entity_type_name: 'Shot'
        },
        { id: 5 },
        false,
        null,
        new Map()
      )
    ).toEqual({
      name: 'task',
      params: {
        production_id: 2,
        task_id: 1,
        type: 'shots'
      }
    })

    // an asset task type name is not an entity type, so it falls back to Asset
    expect(
      getTaskPath(
        {
          id: 1,
          project_id: 2,
          task_type_id: 'gone',
          entity_type_name: 'Character'
        },
        { id: 5 },
        false,
        null,
        new Map()
      ).params.type
    ).toEqual('assets')
  })

  test('getTaskPath with an incomplete task type', () => {
    // a task type without for_entity must not produce an empty :type either
    expect(
      getTaskPath(
        {
          id: 1,
          project_id: 2,
          task_type_id: 3,
          entity_type_name: 'Shot'
        },
        { id: 5 },
        false,
        null,
        new Map([[3, { id: 3 }]])
      ).params.type
    ).toEqual('shots')

    // an episode task without entity_id keeps the regular task route, since
    // episode-episode-task would be missing its required episode_id
    expect(
      getTaskPath(
        {
          id: 1,
          project_id: 2,
          task_type_id: 3,
          entity_type_name: 'Episode'
        },
        { id: 5 },
        false,
        null,
        new Map()
      )
    ).toEqual({
      name: 'task',
      params: {
        production_id: 2,
        task_id: 1,
        type: 'episodes'
      }
    })
  })

  test('getTaskPath with an episode holding no id', () => {
    // callers build the episode from an optional first_episode_id, so the
    // object is truthy while its id is not: episode-task would then be
    // missing its required episode_id
    expect(
      getTaskPath(
        {
          id: 1,
          project_id: 2,
          task_type_id: 3
        },
        { id: 5 },
        true,
        { id: undefined },
        new Map([[3, { for_entity: 'Shot' }]])
      )
    ).toEqual({
      name: 'task',
      params: {
        production_id: 2,
        task_id: 1,
        type: 'shots'
      }
    })

    // a resolvable episode id still episodifies the route
    expect(
      getTaskPath(
        {
          id: 1,
          project_id: 2,
          task_type_id: 3
        },
        { id: 5 },
        true,
        { id: 6 },
        new Map([[3, { for_entity: 'Shot' }]])
      )
    ).toEqual({
      name: 'episode-task',
      params: {
        production_id: 2,
        task_id: 1,
        episode_id: 6,
        type: 'shots'
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
