import async from 'async'
import store from '../store'

const init = (callback) => {
  const storeActions = [
    'loadProductionStatus',
    'loadTaskStatuses',
    'loadAssetTypes',
    'loadTaskTypes',
    'loadOpenProductions'
  ]

  async.mapSeries(storeActions, store.dispatch, (err) => {
    if (err) {
      console.log('Init failed', err)
    }
    callback()
  })
}

export default init
