import fallbackIcon from '@/assets/kitsu.png'

import {
  episodifyRoute,
  getPlaylistPath,
  pluralizeEntityType
} from '@/lib/path'

export const isMention = notification =>
  notification.notification_type === 'mention'

export const isReplyMention = notification =>
  notification.notification_type === 'reply-mention'

export const isReply = notification =>
  notification.notification_type === 'reply'

export const isAssignation = notification =>
  notification.notification_type === 'assignation'

export const isPlaylistReady = notification =>
  notification.notification_type === 'playlist-ready'

// Publish = a comment with preview_file_id. Other types may also carry one but aren't publish.
export const isPublish = notification =>
  notification.preview_file_id &&
  (!notification.notification_type ||
    notification.notification_type === 'comment')

// Excludes publish so the guards are mutually exclusive.
export const isComment = notification =>
  (!notification.notification_type ||
    notification.notification_type === 'comment') &&
  !isPublish(notification)

export const buildEntityRoute = (notification, taskTypeMap) => {
  const taskType = taskTypeMap?.get(notification.task_type_id)
  if (!taskType) return null
  return episodifyRoute(
    {
      name: 'task',
      params: {
        production_id: notification.project_id,
        task_id: notification.task_id,
        type: pluralizeEntityType(taskType.for_entity)
      }
    },
    notification.episode_id
  )
}

export const buildPlaylistRoute = (notification, productionMap) => {
  const isTVShow =
    productionMap?.get(notification.project_id)?.production_type === 'tvshow'
  let episodeId = null
  if (isTVShow) {
    // TV-show playlist with no episode = main pack.
    episodeId = notification.episode_id || 'main'
    if (notification.playlist_for_entity === 'asset') {
      episodeId = notification.playlist_is_for_all ? 'all' : 'main'
    }
  }
  return getPlaylistPath(
    notification.project_id,
    episodeId,
    notification.playlist_id
  )
}

const buildTitle = (notification, { t, personMap }) => {
  const authorName =
    personMap?.get(notification.author_id)?.full_name || t('main.unknown')
  if (isPlaylistReady(notification)) {
    return t('notifications.desktop.playlist_ready_title', {
      name: notification.playlist_name || t('main.unknown')
    })
  }
  if (isMention(notification) || isReplyMention(notification)) {
    return t('notifications.desktop.mention_title', { name: authorName })
  }
  if (isReply(notification)) {
    return t('notifications.desktop.reply_title', { name: authorName })
  }
  if (isAssignation(notification)) {
    return t('notifications.desktop.assignation_title', { name: authorName })
  }
  if (isPublish(notification)) {
    return t('notifications.desktop.publish_title', { name: authorName })
  }
  return t('notifications.desktop.comment_title', { name: authorName })
}

// Mirrors zou's email `task_name`: project / entity / task type.
// NDA-safe: no comment/reply text (lock-screen surface).
const buildBody = (notification, { taskTypeMap }) => {
  const segments = []
  if (notification.project_name) segments.push(notification.project_name)
  if (isPlaylistReady(notification)) {
    if (notification.playlist_name) segments.push(notification.playlist_name)
  } else {
    if (notification.full_entity_name) {
      segments.push(notification.full_entity_name)
    }
    const taskTypeName = taskTypeMap?.get(notification.task_type_id)?.name
    if (taskTypeName) segments.push(taskTypeName)
  }
  return segments.join(' / ')
}

const buildIcon = organisation => {
  if (organisation?.has_avatar) {
    return `/api/pictures/thumbnails/organisations/${organisation.id}.png`
  }
  return fallbackIcon
}

export const buildDesktopNotificationPayload = (notification, context) => {
  const { taskTypeMap, productionMap, organisation } = context
  const route = isPlaylistReady(notification)
    ? buildPlaylistRoute(notification, productionMap)
    : buildEntityRoute(notification, taskTypeMap) || { name: 'notifications' }
  return {
    title: buildTitle(notification, context),
    body: buildBody(notification, context),
    icon: buildIcon(organisation),
    tag: notification.id,
    route
  }
}

export const buildTestNotificationPayload = (t, organisation) => ({
  title: t('notifications.desktop.test_notification_title'),
  body: t('notifications.desktop.test_notification_body'),
  icon: buildIcon(organisation),
  route: { name: 'notifications' }
})
