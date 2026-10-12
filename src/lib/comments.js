import { getProductionRole } from '@/lib/people'

// The client sees a comment flagged for it or written by a client, share
// link guests included, with the name and avatar of whoever answers it.
// As in zou, the author is a client through its role on the production of
// the task: projectRoles holds the roles of that team.
export const isClientThread = (comment, projectRoles = {}) =>
  Boolean(comment.for_client) ||
  (Boolean(comment.person) &&
    getProductionRole(comment.person, projectRoles) === 'client')

// As in zou, a comment moves its task only when no later comment did: one
// posted with an older date leaves the status alone. Zou serializes both
// dates the same way, so they compare as text.
export const isLatestTaskComment = (task, comment) =>
  !task.last_comment_date ||
  !comment.created_at ||
  comment.created_at >= task.last_comment_date

// After a deletion, the last comment a list shows was posted during the
// reload when it is not the deleted one and is newer than the one reloaded.
// The last comment Zou lists with a task has no id nor created_at.
export const isPostedSince = (shown = {}, reloaded = {}, deletedId) =>
  shown.id !== deletedId && shown.created_at > (reloaded.created_at ?? '')
