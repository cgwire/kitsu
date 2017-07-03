import superagent from 'superagent'

export default {
  getAssetTypes (callback) {
    superagent
      .get('/api/data/asset_types')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  newAssetType (assetType, callback) {
    const data = {
      name: assetType.name
    }
    superagent
      .post('/api/data/entity_types/')
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  updateAssetType (assetType, callback) {
    const data = {
      name: assetType.name
    }
    superagent
      .put(`/api/data/entity_types/${assetType.id}`)
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  deleteAssetType (assetType, callback) {
    superagent
      .del(`/api/data/entity_types/${assetType.id}`)
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}
