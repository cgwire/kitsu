vi.mock('@/store', () => ({ default: {} }))

import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import ManageShotsModal from '@/components/modals/ManageShotsModal.vue'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const buildStore = ({ episodes = [], sequences = [], isTVShow = true }) =>
  createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1' }),
      displayedEpisodes: () => episodes,
      displayedSequences: () => sequences,
      isTVShow: () => isTVShow
    }
  })

describe('ManageShotsModal', () => {
  let errors

  // The opening watcher runs outside of any caller, so a failure there is
  // swallowed by Vue and only shows up in the console. Collect it instead.
  const open = async options => {
    errors = []
    const wrapper = shallowMount(ManageShotsModal, {
      props: { active: false },
      global: {
        plugins: [buildStore(options), i18n],
        config: { errorHandler: error => errors.push(error) }
      }
    })
    await wrapper.setProps({ active: true })
    return wrapper
  }

  beforeEach(() => {
    push.mockClear()
  })

  test('opening on a TV show without any episode does not fail', async () => {
    await open({ isTVShow: true, episodes: [] })
    expect(errors).toEqual([])
    expect(push).not.toHaveBeenCalled()
  })

  test('opening on a TV show selects the first episode', async () => {
    await open({ isTVShow: true, episodes: [{ id: 'episode-1' }] })
    expect(errors).toEqual([])
    expect(push).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { production_id: 'production-1', episode_id: 'episode-1' }
      })
    )
  })

  test('opening on a production without any sequence does not fail', async () => {
    await open({ isTVShow: false, sequences: [] })
    expect(errors).toEqual([])
  })
})
