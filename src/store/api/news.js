import client from './client'
import { buildQueryString } from '../../lib/query'

export default {
  getLastNews (params) {
    return new Promise((resolve, reject) => {
      const productionId = params.productionId
      delete params.productionId
      const path = buildQueryString(
        `/api/data/projects/${productionId}/news`,
        params
      )
      client.get(path, (err, newsList) => {
        if (err) reject(err)
        else resolve(newsList)
      })
    })
  },

  getNews (projectId, newsId) {
    return new Promise((resolve, reject) => {
      const path = `/api/data/projects/${projectId}/news/${newsId}`
      client.get(path, (err, news) => {
        if (err) reject(err)
        else resolve(news[0])
      })
    })
  }
}
