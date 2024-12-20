import newsApi from '@/store/api/news'
import { sortByDate } from '@/lib/sorting'
import { formatFullDateWithTimezone } from '@/lib/time'

import {
  CLEAR_NEWS,
  ADD_PREVIOUS_NEWS,
  ADD_FIRST_NEWS,
  NEWS_ADD_PREVIEW,
  NEWS_SET_STATS,
  NEWS_SET_TOTAL,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  newsList: [],
  newsStats: {},
  newsTotal: 0
}

const state = {
  ...initialState
}

const getters = {
  newsList: state => state.newsList,
  newsTotal: state => state.newsTotal,
  newsStats: state => state.newsStats,

  newsListByDay: state => timezone => {
    if (state.newsList.length === 0) return []
    const listsByDay = []
    let runningList = []
    const tzDate = formatFullDateWithTimezone(
      state.newsList[0].created_at,
      timezone
    )
    let currentDay = tzDate.substring(0, 10)

    state.newsList.forEach(news => {
      const newsDay = formatFullDateWithTimezone(
        news.created_at,
        timezone
      ).substring(0, 10)
      if (newsDay !== currentDay) {
        listsByDay.push(runningList)
        currentDay = newsDay
        runningList = []
      }
      runningList.push(news)
    })

    if (runningList.length !== 0) {
      listsByDay.push(runningList)
    }

    return listsByDay
  }
}

const actions = {
  async loadNews({ commit, state }, params) {
    commit(CLEAR_NEWS)
    const newsList = await newsApi.getLastNews(params)
    commit(ADD_PREVIOUS_NEWS, newsList.data)
    commit(NEWS_SET_TOTAL, newsList.total)
    commit(NEWS_SET_STATS, newsList.stats)
  },

  async loadMoreNews({ commit, state }, params) {
    const newsList = await newsApi.getLastNews(params)
    commit(ADD_PREVIOUS_NEWS, newsList.data)
  },

  async loadSingleNews({ commit, state }, { productionId, newsId }) {
    const news = await newsApi.getNews(productionId, newsId)
    return commit(ADD_FIRST_NEWS, news)
  }
}

const mutations = {
  [CLEAR_NEWS](state) {
    state.newsList = []
    state.newsTotal = 0
  },

  [ADD_PREVIOUS_NEWS](state, newsList) {
    state.newsList = state.newsList.concat(sortByDate(newsList))
  },

  [ADD_FIRST_NEWS](state, news) {
    const existingNews = state.newsList.find(n => n.id === news.id)
    if (existingNews) {
      Object.assign(existingNews, news)
    } else {
      state.newsList.unshift(news)
    }
  },

  [NEWS_ADD_PREVIEW](state, { commentId, previewId, extension }) {
    if (!commentId) return
    const news = state.newsList.find(news => news.comment_id === commentId)
    if (news) {
      news.preview_file_id = previewId
      news.preview_file_extension = extension
    }
  },

  [NEWS_SET_TOTAL](state, count) {
    state.newsTotal = count
  },

  [NEWS_SET_STATS](state, stats) {
    state.newsStats = stats
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
