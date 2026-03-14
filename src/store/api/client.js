import superagent from 'superagent'
import errors from '@/lib/errors'

function handleResponse(res) {
  return res?.body
}

function handleError(err) {
  if (err?.response?.status === 401) {
    errors.backToLogin()
    return
  }
  err.body = err?.response?.body || ''
  throw err
}

const client = {
  request(method, path, data) {
    return superagent(method, path)
      .send(data)
      .then(handleResponse)
      .catch(handleError)
  },

  pget(path) {
    return client.request('GET', path)
  },

  ppost(path, data) {
    return client.request('POST', path, data)
  },

  ppostFile(path, data) {
    const request = superagent
      .post(path)
      .send(data)
      .on('progress', e => e)
    const promise = request.then(handleResponse).catch(handleError)
    return { request, promise }
  },

  pput(path, data) {
    return client.request('PUT', path, data)
  },

  pdel(path, data) {
    return client.request('DELETE', path, data)
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

  getEvents(after, before, limit, lastEventId = null) {
    let path = `/api/data/events/last?after=${after}&before=${before}&limit=${limit}`
    if (lastEventId) {
      path += `&cursor_event_id=${lastEventId}`
    }
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
