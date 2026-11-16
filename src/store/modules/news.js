import newsApi from '@/store/api/news'
import { sortByDate } from '@/lib/sorting'
import { formatFullDateWithTimezone } from '@/lib/time'

import {
  CLEAR_NEWS,
  ADD_PREVIOUS_NEWS,
  ADD_NEWS,
  UPDATE_NEWS,
  REMOVE_NEWS,
  DELETE_NEWS,
  SYNC_NEWS,
  NEWS_ADD_PREVIEW,
  NEWS_SET_COMPLETE,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  newsList: [],
  // Each new load of the feed changes it: the answers of the requests sent
  // before go nowhere.
  newsListVersion: 0,
  // Changes with the list, and when a resync starts the feed over: the
  // pages asked for before no longer follow the list.
  newsPagesVersion: 0,
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

// The socket may come back twice while a first page loads again: an older
// page taken after a newer one would bring back the news deleted between
// them.
let lastSyncId = 0
let lastMergedSyncId = 0

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

  // The number of news the page added, null when the feed loaded again or
  // started over meanwhile.
  async loadMoreNews({ commit, state }, params) {
    const version = state.newsPagesVersion
    const newsList = await newsApi.getLastNews(params)
    if (state.newsPagesVersion !== version) return null
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
  },

  // The first page again, for the events Zou sent while the socket was
  // down. True when the feed starts over from it, null when the feed loaded
  // again or took a newer first page meanwhile.
  async syncNews({ commit, dispatch, state }, params) {
    const listVersion = state.newsListVersion
    const version = state.newsPagesVersion
    const mergedSyncId = lastMergedSyncId
    const syncId = ++lastSyncId
    // A news listed while the page loads is not missing from it.
    const listedIds = new Set(state.newsList.map(news => news.id))
    const newsList = await newsApi.getLastNews({ ...params, page: 1 })
    if (state.newsListVersion !== listVersion || syncId < lastMergedSyncId) {
      return null
    }
    // An older first page was merged meanwhile: the news it brought would
    // pass for news listed while this one loaded. This one is asked again.
    if (lastMergedSyncId !== mergedSyncId) return dispatch('syncNews', params)
    lastMergedSyncId = syncId
    commit(SYNC_NEWS, {
      newsList: newsList.data,
      listedIds,
      isComplete: newsList.data.length < params.limit
    })
    return state.newsPagesVersion !== version
  }
}

// The order of Zou: the newest first, then the highest id.
const isNewsBefore = (news, otherNews) =>
  news.created_at > otherNews.created_at ||
  (news.created_at === otherNews.created_at && news.id > otherNews.id)

const mutations = {
  [CLEAR_NEWS](state) {
    state.newsList = []
    state.newsListVersion += 1
    state.newsPagesVersion += 1
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

  // A live news goes where its date puts it: a moved comment keeps the date
  // of its first post. Older than every news listed, it waits for its page.
  [ADD_NEWS](state, news) {
    if (state.deletedNewsIds.has(news.id)) return
    const existingNews = state.newsList.find(n => n.id === news.id)
    if (existingNews) {
      Object.assign(existingNews, news)
      return
    }
    const index = state.newsList.findIndex(n => isNewsBefore(news, n))
    if (index !== -1) {
      state.newsList.splice(index, 0, news)
    } else if (state.isNewsListComplete || state.newsList.length === 0) {
      state.newsList.push(news)
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

  // A news listed when the first page was asked for and missing from it is
  // gone, unless it is older than the whole page. A full page holding none
  // of them may hide news below it: the feed starts over from that page.
  [SYNC_NEWS](state, { newsList, listedIds, isComplete }) {
    const pageIds = new Set(newsList.map(news => news.id))
    const oldestNews = newsList[newsList.length - 1]
    const isJoined = isComplete || newsList.some(news => listedIds.has(news.id))
    const isInPage = news => isComplete || !isNewsBefore(oldestNews, news)
    const keptNews = state.newsList.filter(
      news =>
        !pageIds.has(news.id) &&
        (isInPage(news) ? !listedIds.has(news.id) : isJoined)
    )
    state.newsList = newsList
      .filter(news => !state.deletedNewsIds.has(news.id))
      .concat(keptNews)
      .sort((news, otherNews) => (isNewsBefore(news, otherNews) ? -1 : 1))
    state.isNewsListComplete =
      isComplete || (isJoined && state.isNewsListComplete)
    if (!isJoined) state.newsPagesVersion += 1
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
