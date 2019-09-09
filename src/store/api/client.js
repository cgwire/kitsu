import superagent from 'superagent'
import errors from '../../lib/errors'

const client = {
  get (path, callback) {
    superagent
      .get(path)
      .end((err, res) => {
        // if (res.statusCode === 401) return errors.backToLogin()
        callback(err, res.body)
      })
  },

  post (path, data, callback) {
    superagent
      .post(path)
      .send(data)
      .end((err, res) => {
        if (res.statusCode === 401) return errors.backToLogin()
        callback(err, res.body)
      })
  },

  put (path, data, callback) {
    superagent
      .put(path)
      .send(data)
      .end((err, res) => {
        if (res.statusCode === 401) return errors.backToLogin()
        callback(err, res.body)
      })
  },

  del (path, callback) {
    superagent
      .del(path)
      .end((err, res) => {
        if (res.statusCode === 401) return errors.backToLogin()
        callback(err, res.body)
      })
  },

  pget (path) {
    return new Promise((resolve, reject) => {
      client.get(path, (err, model) => {
        if (err) reject(err)
        else resolve(model)
      })
    })
  },

  getModel (modelName, modelId) {
    return new Promise((resolve, reject) => {
      const path = `/api/data/${modelName}/${modelId}`
      client.get(path, (err, model) => {
        if (err) reject(err)
        else resolve(model)
      })
    })
  }
}

export default client
