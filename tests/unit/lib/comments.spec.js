// @vitest-environment node

import { isClientThread, isLatestTaskComment } from '@/lib/comments'

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
