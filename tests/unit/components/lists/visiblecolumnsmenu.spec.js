vi.mock('@/store', () => ({ default: {} }))

import AssetList from '@/components/lists/AssetList.vue'
import EditList from '@/components/lists/EditList.vue'
import EpisodeList from '@/components/lists/EpisodeList.vue'
import SequenceList from '@/components/lists/SequenceList.vue'
import ShotList from '@/components/lists/ShotList.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'

import {
  descriptor,
  mountEntityList,
  production
} from '../../fixtures/entity-list'

// The edit, episode, and sequence lists show the menu toggle once they have
// a metadata column.
const lists = [
  { name: 'AssetList', component: AssetList },
  {
    name: 'EditList',
    component: EditList,
    getters: { editMetadataDescriptors: [descriptor] }
  },
  {
    name: 'EpisodeList',
    component: EpisodeList,
    getters: { episodeMetadataDescriptors: [descriptor] }
  },
  {
    name: 'SequenceList',
    component: SequenceList,
    getters: { sequenceMetadataDescriptors: [descriptor] }
  },
  // The shot list reads its first group of shots.
  { name: 'ShotList', component: ShotList, props: { displayedShots: [[]] } }
]

// The visible columns menu offers the column the "+" of the name header adds,
// to the same people.
describe.each(lists)('$name, visible columns menu', list => {
  let wrapper = null

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  const mountList = async ({ getters = {}, props = {} } = {}) => {
    wrapper = await mountEntityList(list.component, {
      getters: { currentProduction: production, ...list.getters, ...getters },
      props: { ...list.props, ...props }
    })
    return wrapper.findComponent(TableMetadataSelectorMenu)
  }

  test.each([
    ['a manager', { isCurrentUserProductionManager: true }, true],
    ['a supervisor', { isCurrentUserProductionSupervisor: true }, true],
    ['an artist', {}, false]
  ])('lets %s add a metadata column', async (_, getters, isAllowed) => {
    const menu = await mountList({ getters })

    expect(menu.props('isAddAllowed')).toBe(isAllowed)
  })

  test('offers no new column while the list loads', async () => {
    const menu = await mountList({
      getters: { isCurrentUserProductionManager: true },
      props: { isLoading: true }
    })

    expect(menu.props('isAddAllowed')).toBe(false)
  })

  test('passes the menu request on to the page', async () => {
    const menu = await mountList({
      getters: { isCurrentUserProductionManager: true }
    })

    await menu.vm.$emit('add-metadata')

    expect(wrapper.emitted('add-metadata')).toHaveLength(1)
  })

  test('tells whether the menu of its toggle is open', async () => {
    const menu = await mountList()
    const toggle = wrapper
      .findAllComponents(ButtonSimple)
      .find(button => button.props('title') === 'main.column_visibility')

    expect(toggle.attributes('aria-haspopup')).toBe('dialog')
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.vm.$emit('click')

    expect(menu.props('isOpen')).toBe(true)
    expect(toggle.attributes('aria-expanded')).toBe('true')
  })
})
