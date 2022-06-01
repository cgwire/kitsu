import client from '@/store/api/client'
import { buildQueryString } from '@/lib/query'

export default {
  getLastNews (params) {
    const productionId = params.productionId
    if (productionId) {
      delete params.productionId
      const path = buildQueryString(
        `/api/data/projects/${productionId}/news`,
        params
      )
      return client.pget(path)
    } else {
      return Promise.resolve({ data: [], total: 0, stats: [] })
    }
  },

  getNews (projectId, newsId) {
    const path = `/api/data/projects/${projectId}/news/${newsId}`
    return client.pget(path)
  }
}
