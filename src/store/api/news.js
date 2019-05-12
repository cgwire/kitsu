import client from './client'

export default {
  getLastNews (projectId, page = 1) {
    return new Promise((resolve, reject) => {
      const path = `/api/data/projects/${projectId}/news?page=${page}`
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
