import async from 'async'
import store from '../store'

const init = (callback) => {
  const storeActions = [
    'loadProductionStatus',
    'loadTaskStatuses',
    'loadAssetTypes',
    'loadTaskTypes',
    'loadCustomActions',
    'loadPeople',
    'loadOpenProductions'
  ]

  async.mapSeries(storeActions, store.dispatch, (err) => {
    if (err) {
      console.log('Init failed', err)
    }
    store.commit('LOGIN_SUCCESS')
    callback()
  })
}

export default init
