import store from '../store'
import {
  RESET_ALL,
  USER_LOGOUT
} from '../store/mutation-types.js'

const errors = {
  backToLogin () {
    store.commit(RESET_ALL)
    store.commit(USER_LOGOUT)
    window.location.replace('/login')
  }
}
export default errors
