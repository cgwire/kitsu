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
      newsListVersion: 0,
      newsPagesVersion: 0
    })
    const runner = state => ({
      commit: (type, payload) => store.mutations[type](state, payload),
      dispatch: (type, payload) => store.actions[type](runner(state), payload),
      state
    })

    // An answer a test left unused would go to the next one.
    afterEach(() => {
      newsApi.getLastNews.mockReset()
      newsApi.getNews.mockReset()
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

    // The answer of the next request, given on demand.
    const deferNextLoad = () => {
      let answer = null
      newsApi.getLastNews.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            answer = resolve
          })
      )
      return value => answer(value)
    }

    test('syncNews - first page whatever page the feed is at', async () => {
      newsApi.getLastNews.mockResolvedValueOnce({ data: [] })

      await store.actions.syncNews(runner(newState()), { limit: 50, page: 3 })

      expect(newsApi.getLastNews).toHaveBeenLastCalledWith({
        limit: 50,
        page: 1
      })
    })

    test('syncNews - answer once the feed loaded again', async () => {
      const state = newState()
      state.newsList = [{ id: 'news-1', created_at: '2019-05-02T23:12:23' }]
      const answer = deferNextLoad()

      const sync = store.actions.syncNews(runner(state), { limit: 50 })
      store.mutations.CLEAR_NEWS(state)
      answer({ data: [{ id: 'news-2', created_at: '2019-05-03T21:12:23' }] })

      expect(await sync).toBeNull()
      expect(state.newsList).toEqual([])
    })

    test('syncNews - news listed while the page loads', async () => {
      const state = newState()
      state.newsList = [
        { id: 'news-2', created_at: '2019-05-03T21:12:23' },
        { id: 'news-1', created_at: '2019-05-02T23:12:23' }
      ]
      const answer = deferNextLoad()

      const sync = store.actions.syncNews(runner(state), { limit: 2 })
      store.mutations.ADD_NEWS(state, {
        id: 'news-3',
        created_at: '2019-05-04T23:12:23'
      })
      answer({ data: state.newsList.slice(1) })

      expect(await sync).toBe(false)
      expect(state.newsList.map(news => news.id)).toEqual([
        'news-3',
        'news-2',
        'news-1'
      ])
    })

    test('syncNews - page with none of the listed news', async () => {
      const state = newState()
      state.newsList = [{ id: 'news-1', created_at: '2019-05-02T23:12:23' }]
      newsApi.getLastNews.mockResolvedValueOnce({
        data: [{ id: 'news-9', created_at: '2019-05-09T23:12:23' }]
      })

      expect(await store.actions.syncNews(runner(state), { limit: 1 })).toBe(
        true
      )
      expect(state.newsList.map(news => news.id)).toEqual(['news-9'])
    })

    // The socket may come back twice while a catch-up load is on its way.
    test('syncNews - answer sent before the one merged', async () => {
      const state = newState()
      state.newsList = [
        { id: 'news-2', created_at: '2019-05-03T21:12:23' },
        { id: 'news-1', created_at: '2019-05-02T23:12:23' }
      ]
      const answerFirst = deferNextLoad()
      const firstSync = store.actions.syncNews(runner(state), { limit: 50 })
      // news-2 deleted and news-1 changed during the second drop
      newsApi.getLastNews.mockResolvedValueOnce({
        data: [{ id: 'news-1', created_at: '2019-05-02T23:12:23', change: 1 }]
      })
      await store.actions.syncNews(runner(state), { limit: 50 })
      answerFirst({
        data: [
          { id: 'news-2', created_at: '2019-05-03T21:12:23' },
          { id: 'news-1', created_at: '2019-05-02T23:12:23' }
        ]
      })

      expect(await firstSync).toBeNull()
      expect(state.newsList).toEqual([
        { id: 'news-1', created_at: '2019-05-02T23:12:23', change: 1 }
      ])
    })

    test('syncNews - answer sent before one that failed', async () => {
      const state = newState()
      state.newsList = [{ id: 'news-1', created_at: '2019-05-02T23:12:23' }]
      const answerFirst = deferNextLoad()
      const firstSync = store.actions.syncNews(runner(state), { limit: 50 })
      newsApi.getLastNews.mockRejectedValueOnce(new Error('Bad Gateway'))
      await expect(
        store.actions.syncNews(runner(state), { limit: 50 })
      ).rejects.toThrow('Bad Gateway')
      answerFirst({
        data: [
          { id: 'news-2', created_at: '2019-05-03T21:12:23' },
          { id: 'news-1', created_at: '2019-05-02T23:12:23' }
        ]
      })

      expect(await firstSync).toBe(false)
      expect(state.newsList.map(news => news.id)).toEqual(['news-2', 'news-1'])
    })

    test('syncNews - answer once an older one started the feed over', async () => {
      const state = newState()
      state.newsList = [
        { id: 'news-2', created_at: '2019-05-03T21:12:23' },
        { id: 'news-1', created_at: '2019-05-02T23:12:23' }
      ]
      const news5 = { id: 'news-5', created_at: '2019-05-06T21:12:23' }
      const news4 = { id: 'news-4', created_at: '2019-05-05T21:12:23' }
      const news3 = { id: 'news-3', created_at: '2019-05-04T21:12:23' }
      const answerFirst = deferNextLoad()
      const answerSecond = deferNextLoad()
      // news-4 deleted during the second drop
      newsApi.getLastNews.mockResolvedValueOnce({ data: [news5, news3] })
      const firstSync = store.actions.syncNews(runner(state), { limit: 2 })
      const secondSync = store.actions.syncNews(runner(state), { limit: 2 })

      answerFirst({ data: [news5, news4] })
      expect(await firstSync).toBe(true)
      answerSecond({ data: [news5, news3] })

      expect(await secondSync).toBe(false)
      expect(state.newsList.map(news => news.id)).toEqual(['news-5', 'news-3'])
    })

    test('syncNews - answer once an older one was merged', async () => {
      const state = newState()
      state.newsList = [{ id: 'news-1', created_at: '2019-05-02T23:12:23' }]
      const news2 = { id: 'news-2', created_at: '2019-05-03T21:12:23' }
      const news1 = { id: 'news-1', created_at: '2019-05-02T23:12:23' }
      const answerFirst = deferNextLoad()
      const answerSecond = deferNextLoad()
      // news-2 posted during the first drop and deleted during the second one
      newsApi.getLastNews.mockResolvedValueOnce({ data: [news1] })
      const firstSync = store.actions.syncNews(runner(state), { limit: 50 })
      const secondSync = store.actions.syncNews(runner(state), { limit: 50 })

      answerFirst({ data: [news2, news1] })
      expect(await firstSync).toBe(false)
      answerSecond({ data: [news1] })

      expect(await secondSync).toBe(false)
      expect(state.newsList.map(news => news.id)).toEqual(['news-1'])
    })

    // A live news goes by its date, whatever page the feed starts over from.
    test('getSingleNews - answer once a resync started over', async () => {
      const state = newState()
      state.newsList = [{ id: 'news-1', created_at: '2019-05-02T23:12:23' }]
      const news = { id: 'news-10', created_at: '2019-05-10T23:12:23' }
      let answerNews = null
      newsApi.getNews.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            answerNews = resolve
          })
      )
      newsApi.getLastNews.mockResolvedValueOnce({
        data: [{ id: 'news-9', created_at: '2019-05-09T23:12:23' }]
      })

      const singleNews = store.actions.getSingleNews(runner(state), {
        productionId: 'production-1',
        newsId: 'news-10'
      })
      expect(await store.actions.syncNews(runner(state), { limit: 1 })).toBe(
        true
      )
      answerNews(news)

      expect(await singleNews).toEqual(news)
    })

    test('loadMoreNews - answer once a resync started over', async () => {
      const state = newState()
      state.newsList = [{ id: 'news-1', created_at: '2019-05-02T23:12:23' }]
      const answer = deferNextLoad()

      const moreNews = store.actions.loadMoreNews(runner(state), {
        limit: 1,
        page: 2
      })
      newsApi.getLastNews.mockResolvedValueOnce({
        data: [{ id: 'news-9', created_at: '2019-05-09T23:12:23' }]
      })
      await store.actions.syncNews(runner(state), { limit: 1 })
      answer({ data: [{ id: 'news-0', created_at: '2019-05-01T23:12:23' }] })

      expect(await moreNews).toBeNull()
      expect(state.newsList.map(news => news.id)).toEqual(['news-9'])
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

    test('CLEAR_NEWS - new version of the pages', () => {
      state.newsPagesVersion = 5
      store.mutations.CLEAR_NEWS(state)
      expect(state.newsPagesVersion).toEqual(6)
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

    describe('SYNC_NEWS', () => {
      const news4 = { id: 'news-4', created_at: '2019-05-06T23:12:23' }
      const sync = (newsList, isComplete = false) =>
        store.mutations.SYNC_NEWS(state, {
          newsList,
          listedIds: new Set(['news-3', 'news-2', 'news-1']),
          isComplete
        })
      const newsIds = () => state.newsList.map(news => news.id)

      test('news posted while the socket was down', () => {
        state.isNewsListComplete = true
        sync([news4, state.newsList[0]])
        expect(newsIds()).toEqual(['news-4', 'news-3', 'news-2', 'news-1'])
        expect(state.isNewsListComplete).toBe(true)
      })

      test('news deleted while the socket was down', () => {
        sync([state.newsList[0], state.newsList[2]])
        expect(newsIds()).toEqual(['news-3', 'news-1'])
      })

      test('news older than the whole page', () => {
        sync([state.newsList[0]])
        expect(newsIds()).toEqual(['news-3', 'news-2', 'news-1'])
      })

      test('short page', () => {
        sync([state.newsList[1]], true)
        expect(newsIds()).toEqual(['news-2'])
        expect(state.isNewsListComplete).toBe(true)
      })

      test('empty page', () => {
        sync([], true)
        expect(state.newsList).toEqual([])
      })

      test('news changed while the socket was down', () => {
        sync([{ ...state.newsList[0], change: true }])
        expect(state.newsList[0].change).toBe(true)
      })

      test('news deleted while the page loads', () => {
        state.deletedNewsIds.add('news-4')
        sync([news4, state.newsList[0]])
        expect(newsIds()).toEqual(['news-3', 'news-2', 'news-1'])
      })

      // Zou dates a news to the second, then orders by id: a news of the
      // second of the oldest news of the page is on it only with a higher id.
      test('news of the same second as the oldest of the page', () => {
        const at = '2019-05-03T21:12:23'
        state.newsList = [
          state.newsList[0],
          { id: 'news-c', created_at: at },
          { id: 'news-b', created_at: at },
          { id: 'news-a', created_at: at }
        ]
        store.mutations.SYNC_NEWS(state, {
          newsList: [state.newsList[0], state.newsList[2]],
          listedIds: new Set(newsIds()),
          isComplete: false
        })
        expect(newsIds()).toEqual(['news-3', 'news-b', 'news-a'])
      })

      // More news than a page went by: the feed starts over from it, with
      // the live news that came while it loaded.
      test('page with none of the listed news', () => {
        state.isNewsListComplete = true
        state.newsListVersion = 2
        state.newsPagesVersion = 5
        state.newsList.unshift({
          id: 'news-10',
          created_at: '2019-05-10T23:12:23'
        })
        state.newsList.push({ id: 'news-0', created_at: '2019-05-01T23:12:23' })
        sync([
          { id: 'news-9', created_at: '2019-05-09T23:12:23' },
          { id: 'news-8', created_at: '2019-05-08T23:12:23' }
        ])
        expect(newsIds()).toEqual(['news-10', 'news-9', 'news-8'])
        expect(state.newsPagesVersion).toBe(6)
        expect(state.newsListVersion).toBe(2)
        expect(state.isNewsListComplete).toBe(false)
      })
    })
  })
})
