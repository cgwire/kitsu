// @vitest-environment node

import {
  isClientThread,
  isCommentReplyable,
  isLatestTaskComment
} from '@/lib/comments'

describe('isClientThread', () => {
  // Zou reads the role the author holds on the production of the task: both
  // sides must agree, or Kitsu offers replies that zou rejects.
  test('follows the role the author holds on the production', () => {
    const projectRoles = { ann: 'client', bob: 'user' }
    const ann = { id: 'ann', role: 'user' }
    const bob = { id: 'bob', role: 'client' }
    expect(isClientThread({ person: ann }, projectRoles)).toBe(true)
    expect(isClientThread({ person: bob }, projectRoles)).toBe(false)
  })

  test('falls back to the global role of the author', () => {
    expect(isClientThread({ person: { id: 'ann', role: 'client' } })).toBe(true)
    expect(isClientThread({ person: { id: 'bob', role: 'user' } })).toBe(false)
  })

  test('holds for a comment flagged for the client, whoever wrote it', () => {
    expect(isClientThread({ for_client: true })).toBe(true)
  })

  test('does not hold for an internal comment without author', () => {
    expect(isClientThread({}, { ann: 'client' })).toBe(false)
  })
})

describe('isCommentReplyable', () => {
  const user = { id: 'user-1', studio_id: 'studio-1' }
  const comments = {
    internal: { person: { id: 'author-1', role: 'supervisor' } },
    forClient: { for_client: true, person: { id: 'author-1', role: 'user' } },
    own: { person: { id: 'user-1', role: 'user' } },
    ownForClient: { for_client: true, person: { id: 'user-1', role: 'user' } },
    sameStudio: {
      person: { id: 'client-2', role: 'client', studio_id: 'studio-1' }
    }
  }
  const replyable = viewer =>
    Object.fromEntries(
      Object.entries(comments).map(([name, comment]) => [
        name,
        isCommentReplyable(comment, { user, ...viewer })
      ])
    )

  test('lets a manager answer every comment', () => {
    expect(Object.values(replyable({ isManager: true }))).not.toContain(false)
  })

  test('lets a client answer its own comments and the clients of its studio', () => {
    expect(replyable({ isClient: true })).toEqual({
      internal: false,
      forClient: false,
      own: true,
      ownForClient: true,
      sameStudio: true
    })
  })

  // An internal comment reaches the client emptied of its text: an answer
  // there would land in a thread the client never sees.
  test.each(['isMentioned', 'isAssigned'])(
    'lets a client answer the client threads once %s',
    flag => {
      expect(replyable({ isClient: true, [flag]: true })).toEqual({
        internal: false,
        forClient: true,
        own: true,
        ownForClient: true,
        sameStudio: true
      })
    }
  )

  test.each(['isMentioned', 'isAssigned', 'isDepartmentSupervisor'])(
    'leaves the client threads to the managers once %s',
    flag => {
      expect(replyable({ [flag]: true })).toEqual({
        internal: true,
        forClient: false,
        own: true,
        ownForClient: false,
        sameStudio: false
      })
    }
  )

  test('lets the studio answer its own internal comments only', () => {
    expect(replyable({})).toEqual({
      internal: false,
      forClient: false,
      own: true,
      ownForClient: false,
      sameStudio: false
    })
  })

  test('reads the client threads from the roles of the production', () => {
    const comment = { person: { id: 'author-1', role: 'user' } }
    const teamRoles = { 'author-1': 'client' }
    expect(
      isCommentReplyable(comment, { user, isAssigned: true, teamRoles })
    ).toBe(false)
  })
})

describe('isLatestTaskComment', () => {
  const task = { last_comment_date: '2026-10-09T10:00:00' }

  test('holds for the comment Zou dated last', () => {
    expect(
      isLatestTaskComment(task, { created_at: '2026-10-09T10:00:00' })
    ).toBe(true)
    expect(
      isLatestTaskComment(task, { created_at: '2026-10-09T10:00:01' })
    ).toBe(true)
  })

  test('does not hold for a comment dated before the last one', () => {
    expect(
      isLatestTaskComment(task, { created_at: '2026-10-09T09:59:59' })
    ).toBe(false)
  })

  test('holds when a date is missing', () => {
    expect(isLatestTaskComment({}, { created_at: '2026-10-09T10:00:00' })).toBe(
      true
    )
    expect(isLatestTaskComment(task, {})).toBe(true)
  })
})
