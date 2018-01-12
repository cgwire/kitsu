import async from 'async'
import store from '../store'

const init = (callback) => {
  const storeActions = [
    'loadProductionStatus',
    'loadTaskStatuses',
    'loadAssetTypes',
    'loadTaskTypes',
    'loadPeople',
    'loadOpenProductions'
  ]

  if (store.getters.isCurrentUserManager) {
    storeActions.push('loadCustomActions')
  }

  async.mapSeries(storeActions, store.dispatch, (err) => {
    if (err) {
      console.log('An init operation failed: ', err)
    }
    store.commit('LOGIN_SUCCESS')
    callback()
  })
}

export default init
