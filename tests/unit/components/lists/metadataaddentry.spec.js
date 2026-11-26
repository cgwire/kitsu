vi.mock('@/store', () => ({ default: {} }))

import AssetList from '@/components/lists/AssetList.vue'
import EditList from '@/components/lists/EditList.vue'
import EpisodeList from '@/components/lists/EpisodeList.vue'
import SequenceList from '@/components/lists/SequenceList.vue'
import ShotList from '@/components/lists/ShotList.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'

import { mountEntityList, production } from '../../fixtures/entity-list'

const lists = [
  { name: 'AssetList', component: AssetList },
  { name: 'EditList', component: EditList },
  { name: 'EpisodeList', component: EpisodeList },
  { name: 'SequenceList', component: SequenceList },
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
      getters: { currentProduction: production, ...getters },
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
})
