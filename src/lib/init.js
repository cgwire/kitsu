import store from '../store'

import {
  DATA_LOADING_START,
  DATA_LOADING_END
} from '../store/mutation-types'

/**
 * Load base data required to display properly all information.
 */
const init = (callback) => {
  store.commit(DATA_LOADING_START)
  store.dispatch('loadContext')
    .then(() => {
      // We run login success mutation when done because init
      // happens either after successful login or at first connexion
      // when the user have an active session.
      store.commit(DATA_LOADING_END)
      callback()
    })
    .catch((err) => {
      console.error('An init operation failed: ', err)
    })
}

export default init
