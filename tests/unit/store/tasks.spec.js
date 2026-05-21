import { vi } from 'vitest'

// Importing the tasks module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import tasksStore from '@/store/modules/tasks'
import peopleStore from '@/store/modules/people'

describe('Tasks store', () => {
  describe('Comment author resolution', () => {
    const studioPerson = {
      id: 'person-studio',
      first_name: 'Studio',
      last_name: 'Member',
      full_name: 'Studio Member (live)',
      role: 'manager',
      has_avatar: false
    }

    beforeEach(() => {
      peopleStore.cache.personMap = new Map([['person-studio', studioPerson]])
    })

    afterEach(() => {
      peopleStore.cache.personMap = new Map()
    })

    test('LOAD_TASK_COMMENTS_END prefers personMap over embedded author', () => {
      const state = { taskComments: {}, taskPreviews: {} }
      const comments = [
        {
          id: 'comment-studio',
          person_id: 'person-studio',
          created_at: '2026-05-20T10:00:00',
          pinned: false,
          // Embedded author is stale; the live personMap must win.
          person: { id: 'person-studio', full_name: 'Studio Member (stale)' }
        }
      ]
      tasksStore.mutations.LOAD_TASK_COMMENTS_END(state, {
        taskId: 'task-1',
        comments
      })
      const [comment] = state.taskComments['task-1']
      expect(comment.person.full_name).toEqual('Studio Member (live)')
    })

    test('LOAD_TASK_COMMENTS_END falls back to the embedded guest author', () => {
      const state = { taskComments: {}, taskPreviews: {} }
      const comments = [
        {
          id: 'comment-guest',
          person_id: 'person-guest',
          created_at: '2026-05-20T11:00:00',
          pinned: false,
          // Guests are absent from personMap; the API embeds the author.
          person: {
            id: 'person-guest',
            first_name: 'Guest',
            last_name: 'Author',
            full_name: 'Guest Author',
            role: 'client',
            has_avatar: false
          }
        }
      ]
      tasksStore.mutations.LOAD_TASK_COMMENTS_END(state, {
        taskId: 'task-1',
        comments
      })
      const [comment] = state.taskComments['task-1']
      expect(comment.person.full_name).toEqual('Guest Author')
      // addAdditionalInformation enriches the embedded author for the avatar.
      expect(comment.person.initials).toEqual('GA')
      expect(comment.person.name).toEqual('Guest Author')
    })

    test('LOAD_TASK_COMMENTS_END resolves embedded reply authors too', () => {
      const state = { taskComments: {}, taskPreviews: {} }
      const comments = [
        {
          id: 'comment-studio',
          person_id: 'person-studio',
          created_at: '2026-05-20T10:00:00',
          pinned: false,
          person: studioPerson,
          replies: [
            {
              id: 'reply-guest',
              person_id: 'person-guest',
              person: {
                id: 'person-guest',
                first_name: 'Guest',
                last_name: 'Author',
                full_name: 'Guest Author',
                role: 'client'
              }
            }
          ]
        }
      ]
      tasksStore.mutations.LOAD_TASK_COMMENTS_END(state, {
        taskId: 'task-1',
        comments
      })
      const [comment] = state.taskComments['task-1']
      expect(comment.replies[0].person.full_name).toEqual('Guest Author')
      expect(comment.replies[0].person.initials).toEqual('GA')
    })

    test('ADD_REPLY_TO_COMMENT resolves the embedded guest reply author', () => {
      const comment = { id: 'comment-studio', replies: [] }
      const reply = {
        id: 'reply-guest',
        person_id: 'person-guest',
        person: {
          id: 'person-guest',
          first_name: 'Guest',
          last_name: 'Author',
          full_name: 'Guest Author',
          role: 'client'
        }
      }
      tasksStore.mutations.ADD_REPLY_TO_COMMENT({}, { comment, reply })
      expect(comment.replies[0].person.full_name).toEqual('Guest Author')
      expect(comment.replies[0].person.initials).toEqual('GA')
    })
  })
})
