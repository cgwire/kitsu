import store from '../../src/store'
import {
  RESET_ALL
} from '../../src/store/mutation-types'

const helpers = {
  reset () {
    store.commit(RESET_ALL)
  },

  runAction (action, payload, callback) {
    if (typeof(payload) === 'function') {
      callback = payload
      return store._actions[action][0](callback)
    } else {
      return store._actions[action][0](payload, callback)
    }
  }
}

export default helpers
