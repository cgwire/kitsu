import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import '@/lib/auth'

import EditPlaylistModal from '@/components/modals/EditPlaylistModal.vue'
import ComboboxSimple from '@/components/widgets/ComboboxSimple.vue'

// The modal is mounted closed and opened afterwards, like in the app.
const mountWith = async (props, getters = {}) => {
  const store = createStore({
    getters: {
      currentEpisode: () => ({ id: 'all' }),
      currentProduction: () => ({
        id: 'production-1',
        production_type: 'tvshow'
      }),
      isTVShow: () => true,
      productionTaskTypes: () => [],
      ...getters
    }
  })
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: { en: {} },
    missingWarn: false,
    fallbackWarn: false
  })
  const wrapper = shallowMount(EditPlaylistModal, {
    global: {
      plugins: [store, i18n],
      stubs: {
        // shallowMount stubs BaseModal without its slot: render the form.
        BaseModal: { template: '<div><slot /></div>' },
        // The modal focuses its name field 100 ms after it opens, on the
        // member the real TextField exposes. A stub without it throws once
        // the tests are over.
        TextField: { template: '<input />', methods: { focus() {} } }
      }
    },
    props: { active: false, ...props }
  })
  await wrapper.setProps({ active: true })
  return wrapper
}

const entityTypeChoosers = wrapper =>
  wrapper
    .findAllComponents(ComboboxSimple)
    .filter(c => c.props('label') === 'playlists.fields.for_entity')

describe('EditPlaylistModal on the all pseudo-episode', () => {
  it('keeps the preset shot type and offers no choice when saving from the all shots view', async () => {
    // ViewPlaylistModal presets the entity type from the route.
    const wrapper = await mountWith({
      playlistToEdit: { for_entity: 'shot' },
      typeDisabled: true
    })
    expect(entityTypeChoosers(wrapper)).toHaveLength(0)
    expect(wrapper.vm.form.for_entity).toBe('shot')
  })

  it('offers shots only from the all shots playlists page', async () => {
    // The playlists page presets the entity type of the all pseudo-episode.
    const wrapper = await mountWith({
      playlistToEdit: { name: 'New', for_client: false, for_entity: 'shot' }
    })
    expect(wrapper.vm.forEntityOptions.map(o => o.value)).toEqual(['shot'])
    expect(wrapper.vm.form.for_entity).toBe('shot')
  })

  it('still offers assets only from the all assets playlists page', async () => {
    // The playlists page presets no entity type.
    const wrapper = await mountWith({
      playlistToEdit: { name: 'New', for_client: false }
    })
    expect(entityTypeChoosers(wrapper)).toHaveLength(1)
    expect(wrapper.vm.forEntityOptions.map(o => o.value)).toEqual(['asset'])
    expect(wrapper.vm.form.for_entity).toBe('asset')
  })

  it('offers episodes only from the all episodes playlists page', async () => {
    // The playlists page presets the entity type of the all pseudo-episode.
    const wrapper = await mountWith({
      playlistToEdit: { name: 'New', for_client: false, for_entity: 'episode' }
    })
    expect(wrapper.vm.forEntityOptions.map(o => o.value)).toEqual(['episode'])
    expect(wrapper.vm.form.for_entity).toBe('episode')
  })
})

describe('EditPlaylistModal on a real episode', () => {
  const mountOn = async production_type => {
    const wrapper = await mountWith(
      { playlistToEdit: { name: 'New', for_client: false } },
      {
        currentEpisode: () => ({ id: 'episode-1' }),
        currentProduction: () => ({ id: 'production-1', production_type }),
        isTVShow: () => production_type === 'tvshow'
      }
    )
    return wrapper.vm.forEntityOptions.map(o => o.value)
  }

  it('offers episodes on a TV show', async () => {
    expect(await mountOn('tvshow')).toContain('episode')
  })

  it('offers no episodes outside TV shows', async () => {
    // Episodes only exist in TV shows; the option would be a dead end
    // anywhere else.
    expect(await mountOn('featurefilm')).not.toContain('episode')
  })
})
