import superagent from 'superagent'
import errors from '@/lib/errors'

const client = {
  get(path, callback) {
    superagent.get(path).end((err, res) => {
      // if (res?.statusCode === 401) return errors.backToLogin()
      callback(err, res?.body)
    })
  },

  post(path, data, callback) {
    superagent
      .post(path)
      .send(data)
      .end((err, res) => {
        if (res?.statusCode === 401) return errors.backToLogin()
        callback(err, res?.body)
      })
  },

  put(path, data, callback) {
    superagent
      .put(path)
      .send(data)
      .end((err, res) => {
        if (res?.statusCode === 401) return errors.backToLogin()
        callback(err, res?.body)
      })
  },

  del(path, callback) {
    superagent.del(path).end((err, res) => {
      if (res?.statusCode === 401) return errors.backToLogin()
      callback(err, res?.body)
    })
  },

  pget(path) {
    return superagent.get(path).then(res => res?.body)
  },

  ppost(path, data) {
    return new Promise((resolve, reject) => {
      superagent
        .post(path)
        .send(data)
        .end((err, res) => {
          if (res?.statusCode === 401) {
            errors.backToLogin()
            return reject(err)
          } else {
            if (err) {
              err.body = res ? res.body : ''
              return reject(err)
            } else return resolve(res?.body)
          }
        })
    })
  },

  ppatch(path, data) {
    return new Promise((resolve, reject) => {
      superagent
        .patch(path)
        .send(data)
        .end((err, res) => {
          if (res?.statusCode === 401) {
            errors.backToLogin()
            return reject(err)
          } else {
            if (err) {
              err.body = res ? res.body : ''
              return reject(err)
            } else return resolve(res?.body)
          }
        })
    })
  },

  ppostFile(path, data) {
    const request = superagent
      .post(path)
      .send(data)
      .on('progress', e => e)
    return {
      request,
      promise: new Promise((resolve, reject) => {
        request.end((err, res) => {
          if (res?.statusCode === 401) {
            errors.backToLogin()
            return reject(err)
          } else {
            if (err) return reject(err)
            else return resolve(res?.body)
          }
        })
      })
    }
  },

  pput(path, data) {
    return new Promise((resolve, reject) => {
      superagent
        .put(path)
        .send(data)
        .end((err, res) => {
          if (res?.statusCode === 401) {
            errors.backToLogin()
            reject(err)
          } else {
            if (err) {
              err.body = res ? res.body : ''
              return reject(err)
            } else return resolve(res?.body)
          }
        })
    })
  },

  pdel(path, data) {
    return new Promise((resolve, reject) => {
      superagent
        .del(path)
        .send(data)
        .end((err, res) => {
          if (res?.statusCode === 401) {
            errors.backToLogin()
            reject(err)
          } else {
            if (err) {
              err.body = res ? res.body : ''
              return reject(err)
            } else return resolve(res?.body)
          }
        })
    })
  },

  getConfig() {
    const path = '/api/config'
    return client.pget(path)
  },

  getModel(modelName, modelId, relations = false) {
    let path = `/api/data/${modelName}/${modelId}`
    if (relations) path += '?relations=true'
    return client.pget(path)
  },

  getEvents(after, before) {
    const path = `/api/data/events/last?after=${after}&before=${before}&page_size=100000`
    return client.pget(path)
  },

  searchData(query, limit, offset, index_names, productionId) {
    const path = '/api/data/search'
    const data = { query, limit, offset, index_names }
    if (productionId !== 'all') data.project_id = productionId
    return client.ppost(path, data)
  }
}

export default client
