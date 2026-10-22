import { getProductionRole } from '@/lib/people'

// The client sees a comment flagged for it or written by a client, share
// link guests included, with the name and avatar of whoever answers it.
// As in zou, the author is a client through its role on the production of
// the task: projectRoles holds the roles of that team.
export const isClientThread = (comment, projectRoles = {}) =>
  Boolean(comment.for_client) ||
  (Boolean(comment.person) &&
    getProductionRole(comment.person, projectRoles) === 'client')

// The client is shown who answers the threads it sees: there, the production
// managers answer for the studio, and the client once mentioned. A client
// also answers its own comments and the clients of its studio. The other
// threads reach the client emptied of their text, so only the studio answers.
export const isCommentReplyable = (
  comment,
  {
    user,
    teamRoles,
    isManager = false,
    isClient = false,
    isAssigned = false,
    isMentioned = false,
    isDepartmentSupervisor = false
  }
) => {
  if (isManager) return true
  const author = comment.person
  const isAuthor = Boolean(user) && user.id === author?.id
  if (isClient) {
    const isClientOfStudio =
      author?.role === 'client' && user?.studio_id === author.studio_id
    return (
      isAuthor ||
      isClientOfStudio ||
      (isClientThread(comment, teamRoles) && (isAssigned || isMentioned))
    )
  }
  return (
    !isClientThread(comment, teamRoles) &&
    (isAuthor || isAssigned || isMentioned || isDepartmentSupervisor)
  )
}

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
