// @vitest-environment node

vi.mock('@/store/api/news', () => ({
  default: { getLastNews: vi.fn(), getNews: vi.fn() }
}))

import newsApi from '@/store/api/news'
import store from '@/store/modules/news'

const timezone = 'Europe/Paris'

describe('News store', () => {
  describe('Getters', () => {
    test('newsByDay empty', () => {
      const state = {
        newsList: []
      }
      const newsListByDay = store.getters.newsListByDay(state)(timezone)
      expect(newsListByDay).toEqual([])
    })

    test('newsByDay - 1 day', () => {
      const state = {
        newsList: [
          { id: 'news-2', created_at: '2019-05-04T13:12:23' },
          { id: 'news-1', created_at: '2019-05-04T11:12:23' }
        ]
      }
      const newsListByDay = store.getters.newsListByDay(state)(timezone)
      expect(newsListByDay).toEqual([
        [
          { id: 'news-2', created_at: '2019-05-04T13:12:23' },
          { id: 'news-1', created_at: '2019-05-04T11:12:23' }
        ]
      ])
    })

    test('newsByDay - 2 day because of timezone', () => {
      const state = {
        newsList: [
          { id: 'news-2', created_at: '2019-05-04T23:12:23' },
          { id: 'news-1', created_at: '2019-05-04T21:12:23' }
        ]
      }
      const newsListByDay = store.getters.newsListByDay(state)(timezone)
      expect(newsListByDay).toEqual([
        [
          { id: 'news-2', created_at: '2019-05-04T23:12:23' }
        ],
        [
          { id: 'news-1', created_at: '2019-05-04T21:12:23' }
        ]
      ])
    })

    test('newsByDay - 2 days', () => {
      const state = {
        newsList: [
          { id: 'news-3', created_at: '2019-05-04T13:12:23' },
          { id: 'news-2', created_at: '2019-05-04T11:12:23' },
          { id: 'news-1', created_at: '2019-05-03T13:12:23' }
        ]
      }
      const newsListByDay = store.getters.newsListByDay(state)(timezone)
      expect(newsListByDay).toEqual([
        [
          { id: 'news-3', created_at: '2019-05-04T13:12:23' },
          { id: 'news-2', created_at: '2019-05-04T11:12:23' }
        ],
        [
          { id: 'news-1', created_at: '2019-05-03T13:12:23' }
        ]
      ])
    })

    test('newsByDay - 3 days', () => {
      const state = {
        newsList: [
          { id: 'news-3', created_at: '2019-05-04T13:12:23' },
          { id: 'news-2', created_at: '2019-05-03T11:12:23' },
          { id: 'news-1', created_at: '2019-05-02T13:12:23' }
        ]
      }
      const newsListByDay = store.getters.newsListByDay(state)(timezone)
      expect(newsListByDay).toEqual([
        [
          { id: 'news-3', created_at: '2019-05-04T13:12:23' }
        ],
        [
          { id: 'news-2', created_at: '2019-05-03T11:12:23' }
        ],
        [
          { id: 'news-1', created_at: '2019-05-02T13:12:23' }
        ]
      ])
    })
  })

  describe('Actions', () => {
    const newState = () => ({
      deletedNewsIds: new Set(),
      isNewsListComplete: false,
      newsList: [],
      newsListVersion: 0
    })
    const runner = state => ({
      commit: (type, payload) => store.mutations[type](state, payload),
      state
    })

    test('loadNews - answer of a load sent before the last one', async () => {
      const state = newState()
      let answerFirst = null
      newsApi.getLastNews
        .mockImplementationOnce(
          () =>
            new Promise(resolve => {
              answerFirst = resolve
            })
        )
        .mockResolvedValueOnce({
          data: [{ id: 'news-2', created_at: '2019-05-03T21:12:23' }]
        })

      const firstLoad = store.actions.loadNews(runner(state), { limit: 50 })
      await store.actions.loadNews(runner(state), { limit: 50 })
      answerFirst({
        data: [{ id: 'news-1', created_at: '2019-05-02T23:12:23' }]
      })
      await firstLoad

      expect(state.newsList.map(news => news.id)).toEqual(['news-2'])
    })
  })

  describe('Mutations', () => {
    let state
    beforeEach(() => {
      state = {
        deletedNewsIds: new Set(),
        newsList: [
          { id: 'news-3', created_at: '2019-05-04T23:12:23' },
          { id: 'news-2', created_at: '2019-05-03T21:12:23' },
          { id: 'news-1', created_at: '2019-05-02T23:12:23' }
        ]
      }
    })

    test('CLEAR_NEWS', () => {
      store.mutations.CLEAR_NEWS(state)
      expect(state.newsList).toEqual([])
    })

    test('CLEAR_NEWS - list to load again', () => {
      state.isNewsListComplete = true
      store.mutations.CLEAR_NEWS(state)
      expect(state.isNewsListComplete).toBe(false)
    })

    test('CLEAR_NEWS - new version of the list', () => {
      state.newsListVersion = 2
      store.mutations.CLEAR_NEWS(state)
      expect(state.newsListVersion).toEqual(3)
    })

    test('ADD_PREVIOUS_NEWS', () => {
      store.mutations.ADD_PREVIOUS_NEWS(state, [
        { id: 'news-before-3', created_at: '2019-05-01T23:12:23' },
        { id: 'news-before-2', created_at: '2019-04-30T21:12:23' },
        { id: 'news-before-1', created_at: '2019-04-29T23:12:23' }
      ])
      expect(state.newsList).toEqual([
        { id: 'news-3', created_at: '2019-05-04T23:12:23' },
        { id: 'news-2', created_at: '2019-05-03T21:12:23' },
        { id: 'news-1', created_at: '2019-05-02T23:12:23' },
        { id: 'news-before-3', created_at: '2019-05-01T23:12:23' },
        { id: 'news-before-2', created_at: '2019-04-30T21:12:23' },
        { id: 'news-before-1', created_at: '2019-04-29T23:12:23' }
      ])
    })

    test('ADD_PREVIOUS_NEWS - news already listed', () => {
      store.mutations.ADD_PREVIOUS_NEWS(state, [
        { id: 'news-1', created_at: '2019-05-02T23:12:23' },
        { id: 'news-before-1', created_at: '2019-04-29T23:12:23' }
      ])
      expect(state.newsList.map(news => news.id)).toEqual([
        'news-3',
        'news-2',
        'news-1',
        'news-before-1'
      ])
    })

    test('ADD_NEWS', () => {
      store.mutations.ADD_NEWS(state, {
        id: 'news-4', created_at: '2019-05-06T23:12:23'
      })
      expect(state.newsList).toEqual([
        { id: 'news-4', created_at: '2019-05-06T23:12:23' },
        { id: 'news-3', created_at: '2019-05-04T23:12:23' },
        { id: 'news-2', created_at: '2019-05-03T21:12:23' },
        { id: 'news-1', created_at: '2019-05-02T23:12:23' }
      ])
    })

    test('ADD_NEWS - at its date', () => {
      store.mutations.ADD_NEWS(state, {
        id: 'news-moved',
        created_at: '2019-05-03T22:12:23'
      })
      store.mutations.ADD_NEWS(state, {
        id: 'news-2b',
        created_at: '2019-05-03T21:12:23'
      })
      expect(state.newsList.map(news => news.id)).toEqual([
        'news-3',
        'news-moved',
        'news-2b',
        'news-2',
        'news-1'
      ])
    })

    test('ADD_NEWS - older than every news listed', () => {
      const oldNews = { id: 'news-0', created_at: '2019-05-01T23:12:23' }
      state.isNewsListComplete = false
      store.mutations.ADD_NEWS(state, oldNews)
      expect(state.newsList).toHaveLength(3)
      state.isNewsListComplete = true
      store.mutations.ADD_NEWS(state, oldNews)
      expect(state.newsList[3]).toEqual(oldNews)
    })

    test('UPDATE_NEWS', () => {
      store.mutations.UPDATE_NEWS(state, {
        id: 'news-2',
        change: true,
        created_at: '2019-05-03T21:12:23'
      })
      expect(state.newsList[1]).toEqual({
        id: 'news-2',
        change: true,
        created_at: '2019-05-03T21:12:23'
      })
    })

    test('UPDATE_NEWS - unknown news', () => {
      store.mutations.UPDATE_NEWS(state, {
        id: 'news-4',
        created_at: '2019-05-06T23:12:23'
      })
      expect(state.newsList).toHaveLength(3)
    })

    test('REMOVE_NEWS', () => {
      store.mutations.REMOVE_NEWS(state, 'news-2')
      expect(state.newsList).toEqual([
        { id: 'news-3', created_at: '2019-05-04T23:12:23' },
        { id: 'news-1', created_at: '2019-05-02T23:12:23' }
      ])
    })

    test('REMOVE_NEWS - unknown news', () => {
      store.mutations.REMOVE_NEWS(state, 'news-4')
      expect(state.newsList).toHaveLength(3)
    })

    test('DELETE_NEWS', () => {
      store.mutations.DELETE_NEWS(state, 'news-2')
      store.mutations.ADD_NEWS(state, {
        id: 'news-2',
        created_at: '2019-05-03T21:12:23'
      })
      store.mutations.ADD_PREVIOUS_NEWS(state, [
        { id: 'news-2', created_at: '2019-05-03T21:12:23' }
      ])
      expect(state.newsList.map(news => news.id)).toEqual(['news-3', 'news-1'])
    })

    test('NEWS_ADD_PREVIEW', () => {
      state.newsList[1].comment_id = 'comment-1'
      store.mutations.NEWS_ADD_PREVIEW(state, {
        commentId: 'comment-1',
        previewId: 'preview-1',
        extension: 'mp4'
      })
      expect(state.newsList[1].preview_file_id).toEqual('preview-1')
      expect(state.newsList[1].preview_file_extension).toEqual('mp4')
    })
  })
})
