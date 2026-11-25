// The lists reach the root store through the stores they import.
vi.mock('@/store', () => ({ default: {} }))

import {
  filledColumns,
  mountEntityList,
  production,
  stickColumns,
  taskTypeId
} from '../../fixtures/entity-list'

import AssetList from '@/components/lists/AssetList.vue'
import EditList from '@/components/lists/EditList.vue'
import EpisodeList from '@/components/lists/EpisodeList.vue'
import SequenceList from '@/components/lists/SequenceList.vue'
import ShotList from '@/components/lists/ShotList.vue'

// A column named "Constructor" has the field name of a property every object
// inherits: its cells show the value of the entity as a tooltip, if any.
const constructorColumn = {
  id: 'descriptor-1',
  field_name: 'constructor',
  name: 'Constructor',
  data_type: 'string',
  departments: []
}

const buildRow = data => ({
  id: 'entity-1',
  asset_type_id: 'asset-type-1',
  name: 'Entity 1',
  data,
  validations: new Map([[taskTypeId, 'task-1']])
})

const lists = [
  ['AssetList', AssetList, 'asset', row => ({ displayedAssets: [[row]] })],
  ['ShotList', ShotList, 'shot', row => ({ displayedShots: [[row]] })],
  [
    'SequenceList',
    SequenceList,
    'sequence',
    row => ({ displayedSequences: [row] })
  ],
  ['EpisodeList', EpisodeList, 'episode', row => ({ displayedEpisodes: [row] })],
  ['EditList', EditList, 'edit', row => ({ displayedEdits: [row] })]
]

describe.each(lists)(
  'lists/%s metadata cell titles',
  (_, component, type, rowProps) => {
    const displayed = `displayed${type[0].toUpperCase()}${type.slice(1)}s`
    const mountList = data =>
      mountEntityList(component, {
        getters: {
          currentProduction: production,
          getAssetTypeWorkflow: () => [],
          [`${type}FilledColumns`]: filledColumns,
          [`${type}MetadataDescriptors`]: [constructorColumn],
          [`${displayed}Count`]: 1,
          [`${displayed}Length`]: 1
        },
        props: {
          displaySettings: { showInfos: true },
          ...rowProps(buildRow(data))
        }
      })

    const cellTitle = async data => {
      const wrapper = await mountList(data)
      const cell = wrapper.find('tbody td.metadata-descriptor')
      expect(cell.exists()).toBe(true)
      const title = cell.attributes('title')
      wrapper.unmount()
      return title
    }

    afterEach(() => {
      localStorage.clear()
    })

    test('leaves no tooltip on a Constructor cell without a value', async () => {
      expect(await cellTitle({})).toBeUndefined()
    })

    test('leaves no tooltip on a stuck Constructor cell without a value', async () => {
      stickColumns(type)
      expect(await cellTitle({})).toBeUndefined()
    })

    test('shows the value of a Constructor cell as its tooltip', async () => {
      expect(await cellTitle({ constructor: 'Unit 2' })).toBe('Unit 2')
    })
  }
)
