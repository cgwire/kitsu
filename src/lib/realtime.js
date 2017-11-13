import store from '../store'

const realtime = {
  createNewSource: () => {
    return new EventSource('/events')
  },

  init: (source) => {
    realtime.subscribe(source, 'comment:new', (eventData) => {
      const commentId = eventData.id
      store.dispatch('loadComment', {id: commentId})
    })
    realtime.subscribe(source, 'task:assign', (eventData) => {
      store.dispatch('loadTodos')
    })
    realtime.subscribe(source, 'preview:add', (eventData) => {
      store.commit('ADD_PREVIEW_END', {
        preview: eventData.preview,
        taskId: eventData.task_id,
        commentId: eventData.comment_id
      })
    })

    return source
  },

  subscribe: (source, eventName, listener) => {
    source.addEventListener(eventName, (event) => {
      const data = JSON.parse(event.data)
      listener(data.data)
    }, false)
    return source
  }
}

export default realtime
