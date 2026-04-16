const DRAFT_PREFIX = 'draft-'

const EMPTY_DRAFT = { text: '', checklist: [] }

const normalize = draft => {
  if (!draft) return null
  if (typeof draft === 'string') {
    return { text: draft, checklist: [] }
  }
  return {
    text: draft.text || '',
    checklist: Array.isArray(draft.checklist) ? draft.checklist : []
  }
}

const isEmpty = draft => {
  return (
    !draft ||
    ((!draft.text || draft.text.length === 0) &&
      (!draft.checklist || draft.checklist.length === 0))
  )
}

const drafts = {
  setTaskDraft(taskId, draft) {
    try {
      const normalized = normalize(draft) || EMPTY_DRAFT
      if (isEmpty(normalized)) {
        return localStorage.removeItem(DRAFT_PREFIX + taskId)
      }
      return localStorage.setItem(
        DRAFT_PREFIX + taskId,
        JSON.stringify(normalized)
      )
    } catch (e) {
      console.warn('Failed to save draft:', e)
    }
  },

  getTaskDraft(taskId) {
    try {
      const raw = localStorage.getItem(DRAFT_PREFIX + taskId)
      if (raw === null) return null
      // Legacy drafts were plain text strings. Try JSON first; on parse
      // failure fall back to treating the value as the draft text.
      try {
        return normalize(JSON.parse(raw))
      } catch {
        return normalize(raw)
      }
    } catch (e) {
      console.warn('Failed to read draft:', e)
      return null
    }
  },

  clearTaskDraft(taskId) {
    try {
      return localStorage.removeItem(DRAFT_PREFIX + taskId)
    } catch (e) {
      console.warn('Failed to clear draft:', e)
    }
  }
}

export default drafts
