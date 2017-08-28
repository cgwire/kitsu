import superagent from 'superagent'

export default {
  getAssetTypes (callback) {
    superagent
      .get('/api/data/asset-types')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  newAssetType (assetType, callback) {
    const data = {
      name: assetType.name
    }
    superagent
      .post('/api/data/entity-types')
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
      .put(`/api/data/entity-types/${assetType.id}`)
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  deleteAssetType (assetType, callback) {
    superagent
      .del(`/api/data/entity-types/${assetType.id}`)
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}
