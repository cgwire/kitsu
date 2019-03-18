import superagent from 'superagent'
import errors from '../../lib/errors'

const client = {
  get (path, callback) {
    superagent
      .get(path)
      .end((err, res) => {
        if (res.statusCode === 401) return errors.backToLogin()
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
  }
}

export default client
