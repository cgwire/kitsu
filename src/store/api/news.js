import client from './client'
import { buildQueryString } from '../../lib/query'

export default {
  getLastNews (params) {
    const productionId = params.productionId
    delete params.productionId
    const path = buildQueryString(
      `/api/data/projects/${productionId}/news`,
      params
    )
    return client.pget(path)
  },

  getNews (projectId, newsId) {
    const path = `/api/data/projects/${projectId}/news/${newsId}`
    return client.pget(path)
  }
}
