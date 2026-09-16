import client from '@/store/api/client'
import { buildQueryString } from '@/lib/query'

export default {
  // Works on a copy: the news feed compares the params it passed once the load
  // is over, and a removed key would read as a filter change.
  getLastNews(params) {
    const { isStudio, productionId, ...query } = params
    if (isStudio) {
      const path = buildQueryString(`/api/data/projects/news`, query)
      return client.pget(path)
    } else if (productionId) {
      const path = buildQueryString(
        `/api/data/projects/${productionId}/news`,
        query
      )
      return client.pget(path)
    } else {
      return Promise.resolve({ data: [], total: 0, stats: [] })
    }
  },

  getNews(projectId, newsId) {
    const path = `/api/data/projects/${projectId}/news/${newsId}`
    return client.pget(path)
  }
}
