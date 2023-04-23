import superagent from 'superagent'
import errors from '@/lib/errors'

const client = {
  get(path, callback) {
    superagent.get(path).end((err, res) => {
      // if (res.statusCode === 401) return errors.backToLogin()
      callback(err, res.body)
    })
  },

  post(path, data, callback) {
    superagent
      .post(path)
      .send(data)
      .end((err, res) => {
        if (res.statusCode === 401) return errors.backToLogin()
        callback(err, res.body)
      })
  },

  put(path, data, callback) {
    superagent
      .put(path)
      .send(data)
      .end((err, res) => {
        if (res.statusCode === 401) return errors.backToLogin()
        callback(err, res.body)
      })
  },

  del(path, callback) {
    superagent.del(path).end((err, res) => {
      if (res.statusCode === 401) return errors.backToLogin()
      callback(err, res.body)
    })
  },

  pget(path) {
    return new Promise((resolve, reject) => {
      client.get(path, (err, model) => {
        if (err) reject(err)
        else resolve(model)
      })
    })
  },

  ppost(path, data) {
    return new Promise((resolve, reject) => {
      superagent
        .post(path)
        .send(data)
        .end((err, res) => {
          if (res.statusCode === 401) {
            errors.backToLogin()
            return reject(err)
          } else {
            if (err) {
              err.body = res ? res.body : ''
              return reject(err)
            } else return resolve(res.body)
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
          if (res.statusCode === 401) {
            errors.backToLogin()
            return reject(err)
          } else {
            if (err) return reject(err)
            else return resolve(res.body)
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
          if (res.statusCode === 401) {
            errors.backToLogin()
            reject(err)
          } else {
            if (err) {
              err.body = res ? res.body : ''
              return reject(err)
            } else return resolve(res.body)
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
          if (res.statusCode === 401) {
            errors.backToLogin()
            reject(err)
          } else {
            if (err) {
              err.body = res ? res.body : ''
              return reject(err)
            } else return resolve(res.body)
          }
        })
    })
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

  searchData(query, limit) {
    const path = '/api/data/search'
    return client.ppost(path, { query, limit })
  }
}

export default client
