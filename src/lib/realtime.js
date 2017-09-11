import store from '../store'

let source

const realtime = {
  subscribe: (eventName, listener) => {
    source.addEventListener(eventName, (event) => {
      const data = JSON.parse(event.data)
      listener(data.data)
    }, false)
  },

  init: () => {
    source = new EventSource('/events')

    realtime.subscribe('comment:new', (eventData) => {
      const commentId = eventData.id
      store.dispatch('loadComment', {id: commentId})
    })
  }
}

export default realtime
