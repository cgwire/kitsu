import newsApi from '@/store/api/news'
import { sortByDate } from '@/lib/sorting'
import { formatFullDateWithTimezone } from '@/lib/time'

import {
  CLEAR_NEWS,
  ADD_PREVIOUS_NEWS,
  ADD_FIRST_NEWS,
  UPDATE_NEWS,
  REMOVE_NEWS,
  DELETE_NEWS,
  NEWS_ADD_PREVIEW,
  NEWS_SET_COMPLETE,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  newsList: [],
  // Each new load of the feed changes it: the answers of the requests sent
  // before go nowhere.
  newsListVersion: 0,
  // A page shorter than asked for is the last one: the count of the first
  // answer drifts as soon as news arrive or go.
  isNewsListComplete: false
}

const state = {
  ...initialState,
  // The news Zou deleted: an answer that left before keeps them out.
  deletedNewsIds: new Set()
}

const getters = {
  newsList: state => state.newsList,
  isNewsListComplete: state => state.isNewsListComplete,

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
    const version = state.newsListVersion
    const newsList = await newsApi.getLastNews(params)
    if (state.newsListVersion === version) {
      commit(ADD_PREVIOUS_NEWS, newsList.data)
      commit(NEWS_SET_COMPLETE, newsList.data.length < params.limit)
    }
  },

  // The number of news the page added, null when the feed loaded again
  // meanwhile.
  async loadMoreNews({ commit, state }, params) {
    const version = state.newsListVersion
    const newsList = await newsApi.getLastNews(params)
    if (state.newsListVersion !== version) return null
    const count = state.newsList.length
    commit(ADD_PREVIOUS_NEWS, newsList.data)
    commit(NEWS_SET_COMPLETE, newsList.data.length < params.limit)
    return state.newsList.length - count
  },

  // The feed adds the news itself: it alone knows its filters. Null when
  // the feed loaded again meanwhile.
  async getSingleNews({ state }, { productionId, newsId }) {
    const version = state.newsListVersion
    const news = await newsApi.getNews(productionId, newsId)
    return state.newsListVersion === version ? news : null
  }
}

const mutations = {
  [CLEAR_NEWS](state) {
    state.newsList = []
    state.newsListVersion += 1
    state.isNewsListComplete = false
  },

  // Zou pages by offset: a news posted since the first page moves the next
  // ones back, so a page can start with news already listed.
  [ADD_PREVIOUS_NEWS](state, newsList) {
    const listedIds = new Set(state.newsList.map(news => news.id))
    state.newsList = state.newsList.concat(
      sortByDate(
        newsList.filter(
          news => !listedIds.has(news.id) && !state.deletedNewsIds.has(news.id)
        )
      )
    )
  },

  [ADD_FIRST_NEWS](state, news) {
    if (state.deletedNewsIds.has(news.id)) return
    const existingNews = state.newsList.find(n => n.id === news.id)
    if (existingNews) {
      Object.assign(existingNews, news)
    } else {
      state.newsList.unshift(news)
    }
  },

  [UPDATE_NEWS](state, news) {
    const existingNews = state.newsList.find(n => n.id === news.id)
    if (existingNews) Object.assign(existingNews, news)
  },

  [REMOVE_NEWS](state, newsId) {
    const index = state.newsList.findIndex(news => news.id === newsId)
    if (index !== -1) state.newsList.splice(index, 1)
  },

  [DELETE_NEWS](state, newsId) {
    state.deletedNewsIds.add(newsId)
    const index = state.newsList.findIndex(news => news.id === newsId)
    if (index !== -1) state.newsList.splice(index, 1)
  },

  [NEWS_ADD_PREVIEW](state, { commentId, previewId, extension }) {
    if (!commentId) return
    const news = state.newsList.find(news => news.comment_id === commentId)
    if (news) {
      news.preview_file_id = previewId
      news.preview_file_extension = extension
    }
  },

  [NEWS_SET_COMPLETE](state, isComplete) {
    state.isNewsListComplete = isComplete
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState, deletedNewsIds: new Set() })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
