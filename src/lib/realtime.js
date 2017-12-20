import store from '../store'
import ReconnectingEventSource from 'reconnecting-eventsource'

const realtime = {
  createNewSource: () => {
    return new ReconnectingEventSource('/events')
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

    /*
    source.onerror((event) => {
      switch (event.target.readyState) {
        case EventSource.CONNECTING:
          console.log('Reconnecting...')
          break
        case EventSource.CLOSED:
          console.log('Reinitializing...')
          const evtSource = realtime.createNewSource()
          realtime.init(evtSource)
          break
      }
    })
    */
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
