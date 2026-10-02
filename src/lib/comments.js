// The client sees a comment flagged for it or written by a client, share
// link guests included, with the name and avatar of whoever answers it.
export const isClientThread = comment =>
  Boolean(comment.for_client) || comment.person?.role === 'client'
