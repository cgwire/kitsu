/* eslint-disable no-undef */
import { describe, it, expect, vi, beforeEach } from 'vitest'

import drafts from '@/lib/drafts'

describe('drafts', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('sets and gets a task draft', () => {
    drafts.setTaskDraft('task-1', 'my draft text')
    expect(drafts.getTaskDraft('task-1')).toBe('my draft text')
  })

  it('returns null for a non-existent draft', () => {
    expect(drafts.getTaskDraft('unknown-id')).toBeNull()
  })

  it('clears a task draft', () => {
    drafts.setTaskDraft('task-2', 'some text')
    drafts.clearTaskDraft('task-2')
    expect(drafts.getTaskDraft('task-2')).toBeNull()
  })

  it('uses the draft- prefix in localStorage', () => {
    drafts.setTaskDraft('task-3', 'hello')
    expect(localStorage.getItem('draft-task-3')).toBe('hello')
  })

  it('handles localStorage errors gracefully on set', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })
    expect(() => drafts.setTaskDraft('task-4', 'text')).not.toThrow()
  })

  it('handles localStorage errors gracefully on get', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(drafts.getTaskDraft('task-5')).toBeNull()
  })

  it('handles localStorage errors gracefully on clear', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => drafts.clearTaskDraft('task-6')).not.toThrow()
  })
})
