const drafts = {
  setTaskDraft(taskId, text) {
    return localStorage.setItem('draft-' + taskId, text)
  },

  getTaskDraft(taskId) {
    return localStorage.getItem('draft-' + taskId)
  },

  clearTaskDraft(taskId) {
    return localStorage.removeItem('draft-' + taskId)
  }
}

export default drafts
