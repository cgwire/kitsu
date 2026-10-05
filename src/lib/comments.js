import { getProductionRole } from '@/lib/people'

// The client sees a comment flagged for it or written by a client, share
// link guests included, with the name and avatar of whoever answers it.
// As in zou, the author is a client through its role on the production of
// the task: projectRoles holds the roles of that team.
export const isClientThread = (comment, projectRoles = {}) =>
  Boolean(comment.for_client) ||
  (Boolean(comment.person) &&
    getProductionRole(comment.person, projectRoles) === 'client')
