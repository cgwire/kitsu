import store from '../store'

const realtime = {
  createNewSource: () => {
    return new EventSource('/events')
  },

  init: (source) => {
    realtime.subscribe('comment:new', (eventData) => {
      const commentId = eventData.id
      store.dispatch('loadComment', {id: commentId})
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
