import superagent from 'superagent'

export default {
  getAssets (callback) {
    superagent
      .get('/api/data/assets/all')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  getAssetType (callback) {
    superagent
      .get('/api/data/asset_type')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  newAsset (asset, callback) {
    const data = {
      name: asset.name,
      entity_type_id: asset.asset_type_id,
      project_id: asset.production_id
    }
    superagent
      .post(`/api/data/entities/`)
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  updateAsset (asset, callback) {
    const data = {
      name: asset.name,
      entity_type_id: asset.asset_type_id,
      project_id: asset.project_id
    }
    superagent
      .put(`/api/data/entities/${asset.id}`)
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  deleteAsset (asset, callback) {
    superagent
      .del(`/api/data/entities/${asset.id}`)
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}
