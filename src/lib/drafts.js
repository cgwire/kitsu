const DRAFT_PREFIX = 'draft-'

const drafts = {
  setTaskDraft(taskId, text) {
    try {
      return localStorage.setItem(DRAFT_PREFIX + taskId, text)
    } catch (e) {
      console.warn('Failed to save draft:', e)
    }
  },

  getTaskDraft(taskId) {
    try {
      return localStorage.getItem(DRAFT_PREFIX + taskId)
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
