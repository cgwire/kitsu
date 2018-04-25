const realtime = {

  handleEvent (msg) {
  }
  /*
  init: (source) => {
    realtime.subscribe(source, 'comment:new', (eventData) => {
      const commentId = eventData.id
      store.dispatch('loadComment', {id: commentId})
    })
    const assignationEventListener = (eventData) => {
      if (store.getters.user.id === eventData.person.id) {
        store.dispatch('loadTodos', {forced: true})
      }
      if (store.getters.route.path.indexOf(eventData.person.id) > 0) {
        store.dispatch('loadPersonTasks', {
          personId: eventData.person.id,
          forced: true
        })
      }
    }
    realtime.subscribe(source, 'task:assign', assignationEventListener)
    realtime.subscribe(source, 'task:unassign', assignationEventListener)

    realtime.subscribe(source, 'preview:add', (eventData) => {
      store.commit('ADD_PREVIEW_END', {
        preview: eventData.preview,
        taskId: eventData.task_id,
        commentId: eventData.comment_id
      })
    })

    return source
  }
  */

}

export default realtime
