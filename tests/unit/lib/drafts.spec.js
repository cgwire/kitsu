/* eslint-disable no-undef */
import { describe, it, expect, vi, beforeEach } from 'vitest'

import drafts from '@/lib/drafts'

describe('drafts', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('sets and gets a task draft with text and checklist', () => {
    drafts.setTaskDraft('task-1', {
      text: 'my draft text',
      checklist: [{ text: 'item', checked: false }]
    })
    expect(drafts.getTaskDraft('task-1')).toEqual({
      text: 'my draft text',
      checklist: [{ text: 'item', checked: false }]
    })
  })

  it('accepts a text-only draft and returns an empty checklist', () => {
    drafts.setTaskDraft('task-text', { text: 'only text' })
    expect(drafts.getTaskDraft('task-text')).toEqual({
      text: 'only text',
      checklist: []
    })
  })

  it('returns null for a non-existent draft', () => {
    expect(drafts.getTaskDraft('unknown-id')).toBeNull()
  })

  it('clears a task draft', () => {
    drafts.setTaskDraft('task-2', { text: 'some text', checklist: [] })
    drafts.clearTaskDraft('task-2')
    expect(drafts.getTaskDraft('task-2')).toBeNull()
  })

  it('uses the draft- prefix in localStorage and stores JSON', () => {
    drafts.setTaskDraft('task-3', { text: 'hello', checklist: [] })
    expect(localStorage.getItem('draft-task-3')).toBe(
      JSON.stringify({ text: 'hello', checklist: [] })
    )
  })

  it('removes the entry when the draft is empty', () => {
    drafts.setTaskDraft('task-empty', { text: 'ok', checklist: [] })
    drafts.setTaskDraft('task-empty', { text: '', checklist: [] })
    expect(localStorage.getItem('draft-task-empty')).toBeNull()
  })

  it('reads legacy string drafts as text-only', () => {
    // Simulate a legacy draft written by a previous version of the app.
    localStorage.setItem('draft-legacy', 'legacy text')
    expect(drafts.getTaskDraft('legacy')).toEqual({
      text: 'legacy text',
      checklist: []
    })
  })

  it('handles localStorage errors gracefully on set', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })
    expect(() =>
      drafts.setTaskDraft('task-4', { text: 'text', checklist: [] })
    ).not.toThrow()
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
