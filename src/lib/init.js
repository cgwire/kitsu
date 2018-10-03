import async from 'async'
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
  const storeActions = [
    'loadProductionStatus',
    'loadTaskStatuses',
    'loadAssetTypes',
    'loadTaskTypes',
    'loadPeople',
    'loadOpenProductions',
    'loadCustomActions',
    'loadUserSearchFilters',
    'loadNotifications'
  ]

  async.mapSeries(storeActions, store.dispatch, (err) => {
    if (err) {
      console.log('An init operation failed: ', err)
    }

    // We run login success mutation when done because init
    // happens either after successful login or at first connexion
    // when the user have an active session.
    store.commit(DATA_LOADING_END)
    callback()
  })
}

export default init
