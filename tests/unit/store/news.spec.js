import store from '../../../src/store/modules/news'


describe('News store', () => {
  describe('Getters', () => {
    test('newsByDay empty', () => {
      const state = {
        newsList: []
      }
      const newsListByDay = store.getters.newsListByDay(state)
      expect(newsListByDay).toEqual([])
    })

    test('newsByDay - 1 day', () => {
      const state = {
        newsList: [
          { id: 'news-2', created_at: '2019-05-04T23:12:23' },
          { id: 'news-1', created_at: '2019-05-04T21:12:23' },
        ]
      }
      const newsListByDay = store.getters.newsListByDay(state)
      expect(newsListByDay).toEqual([
        [
          { id: 'news-2', created_at: '2019-05-04T23:12:23' },
          { id: 'news-1', created_at: '2019-05-04T21:12:23' }
        ]
      ])
    })

    test('newsByDay - 2 days', () => {
      const state = {
        newsList: [
          { id: 'news-3', created_at: '2019-05-04T23:12:23' },
          { id: 'news-2', created_at: '2019-05-04T21:12:23' },
          { id: 'news-1', created_at: '2019-05-03T23:12:23' }
        ]
      }
      const newsListByDay = store.getters.newsListByDay(state)
      expect(newsListByDay).toEqual([
        [
          { id: 'news-3', created_at: '2019-05-04T23:12:23' },
          { id: 'news-2', created_at: '2019-05-04T21:12:23' },
        ],
        [
          { id: 'news-1', created_at: '2019-05-03T23:12:23' }
        ]
      ])
    })

    test('newsByDay - 3 days', () => {
      const state = {
        newsList: [
          { id: 'news-3', created_at: '2019-05-04T23:12:23' },
          { id: 'news-2', created_at: '2019-05-03T21:12:23' },
          { id: 'news-1', created_at: '2019-05-02T23:12:23' }
        ]
      }
      const newsListByDay = store.getters.newsListByDay(state)
      expect(newsListByDay).toEqual([
        [
          { id: 'news-3', created_at: '2019-05-04T23:12:23' }
        ],
        [
          { id: 'news-2', created_at: '2019-05-03T21:12:23' }
        ],
        [
          { id: 'news-1', created_at: '2019-05-02T23:12:23' }
        ]
      ])
    })
  })

  describe('Mutations', () => {
    let state
    beforeEach(() => {
      state = {
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

    test('ADD_FIRST_NEWS', () => {
      store.mutations.ADD_FIRST_NEWS(state, {
        id: 'news-4', created_at: '2019-05-06T23:12:23',
      })
      expect(state.newsList).toEqual([
        { id: 'news-4', created_at: '2019-05-06T23:12:23' },
        { id: 'news-3', created_at: '2019-05-04T23:12:23' },
        { id: 'news-2', created_at: '2019-05-03T21:12:23' },
        { id: 'news-1', created_at: '2019-05-02T23:12:23' }
      ])
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
