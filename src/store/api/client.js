import superagent from 'superagent'
import errors from '@/lib/errors'

function handleResponse(res) {
  return res?.body
}

function handleError(err) {
  if (err?.response?.status === 401) {
    errors.backToLogin()
    // Return a pending promise to freeze the chain until the redirect happens.
    return new Promise(() => {})
  }
  err.body = err?.response?.body || ''
  throw err
}

// Bound regular API calls so a hung request cannot leave a spinner
// alive forever: 60s for the server to start answering, 5 min total.
// File uploads (ppostFile) stay unbounded — multi-GB movies are legit.
const REQUEST_TIMEOUT = { response: 60000, deadline: 300000 }

// Compact rows are positional arrays described by the field lists sent
// in the NDJSON header: always map by name, never by position.
function decodeCompactRow(row, fields, taskFields) {
  const entity = {}
  fields.forEach((field, index) => {
    entity[field] =
      field === 'tasks'
        ? row[index].map(task => decodeCompactTask(task, taskFields))
        : row[index]
  })
  return entity
}

// Compact rows may omit the assignees relation; downstream code treats
// task.assignees as an array, so default it here.
function decodeCompactTask(row, taskFields) {
  const task = decodeCompactRow(row, taskFields)
  task.assignees ||= []
  return task
}

async function handleNdjsonResponse(response) {
  let header = null
  let entityFields = null
  const entities = []
  const handleLine = line => {
    if (!line) return
    if (!header) {
      header = JSON.parse(line)
      const fieldsKey = Object.keys(header).find(
        key => key.endsWith('_fields') && key !== 'task_fields'
      )
      entityFields = header[fieldsKey]
      return
    }
    const row = JSON.parse(line)
    entities.push(
      header.compact
        ? decodeCompactRow(row, entityFields, header.task_fields)
        : row
    )
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    lines.forEach(handleLine)
  }
  handleLine((buffer + decoder.decode()).trim())
  return entities
}

const client = {
  request(method, path, data) {
    return superagent(method, path)
      .timeout(REQUEST_TIMEOUT)
      .send(data)
      .then(handleResponse)
      .catch(handleError)
  },

  pget(path) {
    return client.request('GET', path)
  },

  // Kitsu-only mode of the with-tasks routes: the server streams NDJSON
  // (a header line, then one entity per line as compact positional
  // arrays), which halves the payload and keeps the full response out
  // of the server memory. Any answer that is not NDJSON — older Zou
  // rejecting the parameters, proxy in between — falls back to the
  // legacy plain JSON request.
  pgetNdjson(path) {
    const separator = path.includes('?') ? '&' : '?'
    const streamPath = `${path}${separator}stream=true&compact=true`
    return fetch(streamPath, {
      headers: { Accept: 'application/x-ndjson' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT.deadline)
    }).then(
      response => {
        if (response.status === 401) {
          errors.backToLogin()
          // Freeze the chain until the redirect happens.
          return new Promise(() => {})
        }
        const contentType = response.headers.get('Content-Type') || ''
        if (!response.ok || !contentType.includes('ndjson')) {
          // Real HTTP errors (403…) are re-raised by the legacy request
          // with the error shape the stores already handle.
          return client.pget(path)
        }
        return handleNdjsonResponse(response)
      },
      () => client.pget(path)
    )
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

  getText(path) {
    return superagent('GET', path)
      .timeout(REQUEST_TIMEOUT)
      .then(res => res.text)
      .catch(handleError)
  },

  getBlob(path) {
    return superagent('GET', path)
      .responseType('blob')
      .then(res => res.body)
      .catch(handleError)
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

  getLoginLogs(after, before, limit, lastLoginLogId = null) {
    let path = `/api/data/events/login-logs/last?limit=${limit}`
    if (after) path += `&after=${after}`
    if (before) path += `&before=${before}`
    if (lastLoginLogId) path += `&cursor_login_log_id=${lastLoginLogId}`
    return client.pget(path)
  },

  searchData(query, limit, offset, index_names, productionId) {
    const path = '/api/data/search'
    const data = { query, limit, offset, index_names }
    if (productionId && productionId !== 'all') data.project_id = productionId
    return client.ppost(path, data)
  }
}

export default client
