// @vitest-environment node

 
import { describe, it, expect, vi, beforeEach } from 'vitest'

import drafts from '@/lib/drafts'

// The error cases below make localStorage throw on purpose. drafts.js catches
// and logs, so without this the warning lands in the test output as noise.
const silenceWarn = () => vi.spyOn(console, 'warn').mockImplementation(() => {})

describe('drafts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    drafts.setUserScope()
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
    const warn = silenceWarn()
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })
    expect(() =>
      drafts.setTaskDraft('task-4', { text: 'text', checklist: [] })
    ).not.toThrow()
    expect(setItem).toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith('Failed to save draft:', expect.any(Error))
  })

  it('handles localStorage errors gracefully on get', () => {
    const warn = silenceWarn()
    const getItem = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(drafts.getTaskDraft('task-5')).toBeNull()
    expect(getItem).toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith('Failed to read draft:', expect.any(Error))
  })

  it('handles localStorage errors gracefully on clear', () => {
    const warn = silenceWarn()
    const removeItem = vi
      .spyOn(localStorage, 'removeItem')
      .mockImplementation(() => {
        throw new Error('SecurityError')
      })
    expect(() => drafts.clearTaskDraft('task-6')).not.toThrow()
    expect(removeItem).toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith('Failed to clear draft:', expect.any(Error))
  })

  it('keeps the drafts of each user apart', () => {
    drafts.setUserScope('user-1')
    drafts.setTaskDraft('task-7', 'for my eyes only')
    expect(localStorage.getItem('draft-user-1-task-7')).not.toBeNull()

    drafts.setUserScope('user-2')
    expect(drafts.getTaskDraft('task-7')).toBeNull()

    drafts.setUserScope('user-1')
    expect(drafts.getTaskDraft('task-7').text).toEqual('for my eyes only')
  })
})
