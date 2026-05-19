import {
  buildDesktopNotificationPayload,
  buildEntityRoute,
  buildPlaylistRoute,
  isAssignation,
  isComment,
  isMention,
  isPlaylistReady,
  isPublish,
  isReply,
  isReplyMention
} from '@/lib/notifications'

const t = (key, params = {}) =>
  Object.keys(params).length === 0
    ? key
    : `${key}(${JSON.stringify(params)})`

const baseContext = () => ({
  t,
  personMap: new Map([['author-1', { full_name: 'Alice' }]]),
  productionMap: new Map([
    ['project-1', { production_type: 'short' }],
    ['project-tvshow-1', { production_type: 'tvshow' }]
  ]),
  taskTypeMap: new Map([
    ['task-type-1', { for_entity: 'Shot', name: 'Animation' }]
  ]),
  organisation: { id: 'organisation-1', name: 'My Studio', has_avatar: true }
})

const baseNotification = overrides => ({
  id: 'notification-1',
  author_id: 'author-1',
  project_id: 'project-1',
  project_name: 'My Project',
  full_entity_name: 'Sequence / Shot',
  task_id: 'task-1',
  task_type_id: 'task-type-1',
  created_at: '2026-01-01T00:00:00Z',
  read: false,
  ...overrides
})

describe('notifications type guards', () => {
  test('detects each notification_type', () => {
    expect(isMention(baseNotification({ notification_type: 'mention' }))).toBe(
      true
    )
    expect(
      isReplyMention(baseNotification({ notification_type: 'reply-mention' }))
    ).toBe(true)
    expect(isReply(baseNotification({ notification_type: 'reply' }))).toBe(true)
    expect(
      isAssignation(baseNotification({ notification_type: 'assignation' }))
    ).toBe(true)
    expect(
      isPlaylistReady(
        baseNotification({ notification_type: 'playlist-ready' })
      )
    ).toBe(true)
    expect(isComment(baseNotification({ notification_type: 'comment' }))).toBe(
      true
    )
    expect(
      isPublish(
        baseNotification({
          notification_type: 'comment',
          preview_file_id: 'preview-file-1'
        })
      )
    ).toBe(true)
    // Legacy notifications may have an undefined notification_type.
    expect(isComment(baseNotification({ notification_type: undefined }))).toBe(
      true
    )
    expect(
      isPublish(
        baseNotification({
          notification_type: undefined,
          preview_file_id: 'preview-file-1'
        })
      )
    ).toBe(true)
  })

  test('isPublish is false for non-comment types even with preview_file_id', () => {
    expect(
      isPublish(
        baseNotification({
          notification_type: 'assignation',
          preview_file_id: 'preview-file-1'
        })
      )
    ).toBe(false)
    expect(
      isPublish(
        baseNotification({
          notification_type: 'playlist-ready',
          preview_file_id: 'preview-file-1'
        })
      )
    ).toBe(false)
  })
})

describe('buildEntityRoute', () => {
  test('returns task route when no episode', () => {
    const route = buildEntityRoute(
      baseNotification(),
      baseContext().taskTypeMap
    )
    expect(route).toEqual({
      name: 'task',
      params: {
        production_id: 'project-1',
        task_id: 'task-1',
        type: 'shots'
      }
    })
  })

  test('returns episode-task route when episode is set', () => {
    const route = buildEntityRoute(
      baseNotification({ episode_id: 'episode-1' }),
      baseContext().taskTypeMap
    )
    expect(route.name).toBe('episode-task')
    expect(route.params.episode_id).toBe('episode-1')
  })

  test('returns null when task type is unknown', () => {
    expect(
      buildEntityRoute(
        baseNotification({ task_type_id: 'unknown-task-type' }),
        new Map()
      )
    ).toBeNull()
  })
})

describe('buildPlaylistRoute', () => {
  test('returns playlist route for non-TV project', () => {
    const route = buildPlaylistRoute(
      baseNotification({ playlist_id: 'playlist-1' }),
      baseContext().productionMap
    )
    expect(route).toEqual({
      name: 'playlist',
      params: { production_id: 'project-1', playlist_id: 'playlist-1' }
    })
  })

  test('returns episode-playlist with all/main for asset playlists on TV show', () => {
    const route = buildPlaylistRoute(
      baseNotification({
        project_id: 'project-tvshow-1',
        playlist_id: 'playlist-1',
        playlist_for_entity: 'asset',
        playlist_is_for_all: true
      }),
      baseContext().productionMap
    )
    expect(route.name).toBe('episode-playlist')
    expect(route.params.episode_id).toBe('all')
  })

  test('returns regular playlist route when productionMap is empty', () => {
    const route = buildPlaylistRoute(
      baseNotification({ playlist_id: 'playlist-1' }),
      new Map()
    )
    expect(route).toEqual({
      name: 'playlist',
      params: { production_id: 'project-1', playlist_id: 'playlist-1' }
    })
  })

  test('TV show non-asset playlist uses episode_id from notification', () => {
    const route = buildPlaylistRoute(
      baseNotification({
        project_id: 'project-tvshow-1',
        playlist_id: 'playlist-1',
        playlist_for_entity: 'shot',
        episode_id: 'episode-42'
      }),
      baseContext().productionMap
    )
    expect(route.name).toBe('episode-playlist')
    expect(route.params.episode_id).toBe('episode-42')
  })

  test('TV show non-asset playlist without episode_id routes to main pack', () => {
    const route = buildPlaylistRoute(
      baseNotification({
        project_id: 'project-tvshow-1',
        playlist_id: 'playlist-1',
        playlist_for_entity: 'shot',
        episode_id: null
      }),
      baseContext().productionMap
    )
    expect(route.name).toBe('episode-playlist')
    expect(route.params.episode_id).toBe('main')
  })
})

describe('buildDesktopNotificationPayload', () => {
  test('comment notification', () => {
    const payload = buildDesktopNotificationPayload(
      baseNotification({
        notification_type: 'comment',
        comment_text: '<p>Looks great</p>'
      }),
      baseContext()
    )
    expect(payload.title).toBe(
      'notifications.desktop.comment_title({"name":"Alice"})'
    )
    expect(payload.body).toBe('My Project / Sequence / Shot / Animation')
    expect(payload.tag).toBe('notification-1')
    expect(payload.icon).toBe(
      '/api/pictures/thumbnails/organisations/organisation-1.png'
    )
    expect(payload.route.name).toBe('task')
  })

  test('body never includes comment or reply text (NDA-safe)', () => {
    const payload = buildDesktopNotificationPayload(
      baseNotification({
        notification_type: 'mention',
        comment_text: 'Hey <strong>Alice</strong>',
        reply_text: 'secret pong'
      }),
      baseContext()
    )
    expect(payload.body).not.toMatch(/Hey|Alice|secret|pong/)
    expect(payload.body).toBe('My Project / Sequence / Shot / Animation')
  })

  test('mention notification uses mention title', () => {
    const payload = buildDesktopNotificationPayload(
      baseNotification({ notification_type: 'mention' }),
      baseContext()
    )
    expect(payload.title).toBe(
      'notifications.desktop.mention_title({"name":"Alice"})'
    )
  })

  test('reply-mention notification uses mention title', () => {
    const payload = buildDesktopNotificationPayload(
      baseNotification({ notification_type: 'reply-mention' }),
      baseContext()
    )
    expect(payload.title).toBe(
      'notifications.desktop.mention_title({"name":"Alice"})'
    )
  })

  test('reply notification uses reply title', () => {
    const payload = buildDesktopNotificationPayload(
      baseNotification({ notification_type: 'reply' }),
      baseContext()
    )
    expect(payload.title).toBe(
      'notifications.desktop.reply_title({"name":"Alice"})'
    )
  })

  test('assignation notification uses assignation title', () => {
    const payload = buildDesktopNotificationPayload(
      baseNotification({ notification_type: 'assignation' }),
      baseContext()
    )
    expect(payload.title).toBe(
      'notifications.desktop.assignation_title({"name":"Alice"})'
    )
  })

  // assignation + preview_file_id stays an assignation: the preview is
  // incidental task data, not a publish event.
  test('assignation with preview_file_id stays an assignation, not a publish', () => {
    const payload = buildDesktopNotificationPayload(
      baseNotification({
        notification_type: 'assignation',
        preview_file_id: 'preview-file-1'
      }),
      baseContext()
    )
    expect(payload.title).toBe(
      'notifications.desktop.assignation_title({"name":"Alice"})'
    )
    expect(payload.title).not.toContain('publish')
  })

  test('publish notification (comment with preview) uses publish title', () => {
    const payload = buildDesktopNotificationPayload(
      baseNotification({
        notification_type: 'comment',
        preview_file_id: 'preview-file-1'
      }),
      baseContext()
    )
    expect(payload.title).toBe(
      'notifications.desktop.publish_title({"name":"Alice"})'
    )
  })

  test('playlist-ready notification uses playlist route + title', () => {
    const payload = buildDesktopNotificationPayload(
      baseNotification({
        notification_type: 'playlist-ready',
        playlist_id: 'playlist-1',
        playlist_name: 'Daily Friday'
      }),
      baseContext()
    )
    expect(payload.title).toBe(
      'notifications.desktop.playlist_ready_title({"name":"Daily Friday"})'
    )
    expect(payload.body).toBe('My Project / Daily Friday')
    expect(payload.route.name).toBe('playlist')
  })

  test('falls back to /notifications when entity route cannot be built', () => {
    const ctx = baseContext()
    ctx.taskTypeMap = new Map()
    const payload = buildDesktopNotificationPayload(
      baseNotification({ notification_type: 'comment' }),
      ctx
    )
    expect(payload.route).toEqual({ name: 'notifications' })
  })

  test('uses Unknown when author is missing from personMap', () => {
    const ctx = baseContext()
    ctx.personMap = new Map()
    const payload = buildDesktopNotificationPayload(
      baseNotification({ notification_type: 'mention' }),
      ctx
    )
    expect(payload.title).toContain('main.unknown')
  })
})

