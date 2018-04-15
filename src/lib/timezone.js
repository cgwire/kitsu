import moment from 'moment-timezone'

import store from '../store'

export default {

  /*
   * Configure moment libs with the timezone extracted from user information.
   */
  setTimezone () {
    const timezone = store.state.user.user.timezone || moment.tz.guess()
    moment.tz.setDefault(timezone)
  }
}
