// @vitest-environment node

import {
  buildAssetIndex,
  buildExactNameIndex,
  buildNameIndex,
  buildShotIndex,
  buildTaskIndex,
  getAssetIndexWords,
  getShotIndexWords,
  indexSearch,
  removeEntryFromIndex,
  updateEntryInIndex
} from '@/lib/indexing'

describe('lib/indexing', () => {
  describe('incremental updates (PERF-2)', () => {
    const buildShots = () => [
      { id: 's1', name: 'SH010', sequence_name: 'SEQ01', episode_name: 'E01' },
      { id: 's2', name: 'SH020', sequence_name: 'SEQ01', episode_name: 'E01' },
      { id: 's3', name: 'SH030', sequence_name: 'SEQ02', episode_name: 'E02' }
    ]

    it('adds a new entry without a rebuild', () => {
      const shots = buildShots()
      const index = buildShotIndex(shots)
      const shot = {
        id: 's4',
        name: 'SH040',
        sequence_name: 'SEQ02',
        episode_name: 'E02'
      }
      updateEntryInIndex(index, shot, getShotIndexWords(shot))

      expect(indexSearch(index, ['sh040'])).toEqual([shot])
      expect(indexSearch(index, ['seq02'])).toHaveLength(2)
    })

    it('drops the old words when an entry is renamed', () => {
      const shots = buildShots()
      const index = buildShotIndex(shots)
      const shot = shots[0]
      shot.name = 'SH999'
      updateEntryInIndex(index, shot, getShotIndexWords(shot))

      // The old name must not match anymore...
      expect(indexSearch(index, ['sh010'])).toEqual([])
      // ...the new one must, exactly once.
      expect(indexSearch(index, ['sh999'])).toEqual([shot])
      expect(indexSearch(index, ['sh'])).toHaveLength(3)
    })

    it('removes an entry from every bucket', () => {
      const shots = buildShots()
      const index = buildShotIndex(shots)
      removeEntryFromIndex(index, shots[0])

      expect(indexSearch(index, ['sh010'])).toEqual([])
      expect(indexSearch(index, ['seq01'])).toHaveLength(1)
      expect(indexSearch(index, ['sh'])).toHaveLength(2)
    })

    it('matches a full rebuild after a series of asset mutations', () => {
      const assets = [
        { id: 'a1', name: 'Big_Buck', asset_type_name: 'Character' },
        { id: 'a2', name: 'Tree-House', asset_type_name: 'Environment' },
        { id: 'a3', name: 'Lamp', asset_type_name: 'Props' }
      ]
      const index = buildAssetIndex(assets)

      // Rename, add, remove — mirroring UPDATE / ADD / REMOVE mutations.
      assets[0].name = 'BigChief'
      updateEntryInIndex(index, assets[0], getAssetIndexWords(assets[0]))
      const added = { id: 'a4', name: 'Chair', asset_type_name: 'Props' }
      assets.push(added)
      updateEntryInIndex(index, added, getAssetIndexWords(added))
      const removed = assets.splice(1, 1)[0]
      removeEntryFromIndex(index, removed)

      const rebuilt = buildAssetIndex(assets)
      const queries = ['big', 'chief', 'tree', 'house', 'props', 'ch', 'a']
      queries.forEach(query => {
        const incremental = (indexSearch(index, [query]) || [])
          .map(entry => entry.id)
          .sort()
        const reference = (indexSearch(rebuilt, [query]) || [])
          .map(entry => entry.id)
          .sort()
        expect(incremental, `query "${query}"`).toEqual(reference)
      })
    })
  })

  // buildAssetIndex compares against itself, so nothing else pins the words
  // this returns: assert the list exactly, order included, as the index keeps
  // insertion order and every caller searches through it.
  describe('getAssetIndexWords', () => {
    it('splits the asset type, the separators and the camel case parts', () => {
      expect(
        getAssetIndexWords({
          name: 'BigChief_Tree-01',
          asset_type_name: 'Set Dressing'
        })
      ).toEqual([
        'set',
        'dressing',
        'bigchief',
        'tree',
        '01',
        'bigchief_tree-01',
        'big',
        'chief'
      ])
    })

    it('keeps the raw name next to the words it was split into', () => {
      expect(
        getAssetIndexWords({ name: 'Big_Buck', asset_type_name: 'Characters' })
      ).toEqual(['characters', 'big', 'buck', 'big_buck'])
    })

    it('adds nothing when the name holds no camel case', () => {
      expect(
        getAssetIndexWords({ name: 'tree_01', asset_type_name: 'props' })
      ).toEqual(['props', 'tree', '01', 'tree_01'])
    })
  })

  it('buildNameIndex', () => {
    const entries = [
      { name: 'Agent327', id: 1 },
      { name: 'Arnold', id: 2 },
      { name: 'Bunny', id: 3 },
      { name: 'Test', id: 4 },
      { name: 'constructor', id: 5 }
    ]
    const index = buildNameIndex(entries)
    expect(index.A).toBeUndefined()
    expect(index.agent).toHaveLength(1)
    expect(index.arn).toHaveLength(1)
    expect(index.bunny).toHaveLength(1)
    expect(index.bunny[0].id).toEqual(3)
    expect(index.nny).toHaveLength(1)
    expect(index.nny[0].id).toEqual(3)
  })

  describe('buildExactNameIndex', () => {
    it('matches by full name only, not substring', () => {
      const entries = [
        { name: 'fx', id: 1 },
        { name: 'cfx', id: 2 },
        { name: 'vfx', id: 3 }
      ]
      const index = buildExactNameIndex(entries)
      expect(index.fx).toHaveLength(1)
      expect(index.fx[0].id).toEqual(1)
      expect(index.cfx).toHaveLength(1)
      expect(index.cfx[0].id).toEqual(2)
      expect(index.f).toBeUndefined()
      expect(index.x).toBeUndefined()
    })

    it('is case-insensitive', () => {
      const index = buildExactNameIndex([{ name: 'Modeling', id: 1 }])
      expect(index.modeling).toHaveLength(1)
      expect(index.MODELING).toBeUndefined()
    })

    it('groups entries that share the same name', () => {
      const index = buildExactNameIndex([
        { name: 'Animation', id: 1 },
        { name: 'Animation', id: 2 }
      ])
      expect(index.animation).toHaveLength(2)
    })

    it('skips entries without a name', () => {
      const index = buildExactNameIndex([
        null,
        undefined,
        {},
        { name: 'fx', id: 1 }
      ])
      expect(index.fx).toHaveLength(1)
    })

    it('is safe against prototype keys', () => {
      const index = buildExactNameIndex([{ name: 'constructor', id: 1 }])
      expect(index.constructor).toHaveLength(1)
      expect(index.toString).toBeUndefined()
    })
  })

  it('buildAssetIndex', () => {
    const entries = [
      { name: 'Agent327', asset_type_name: 'Characters', id: 1 },
      { name: 'Arnold', asset_type_name: 'Characters', id: 2 },
      { name: 'Bunny', asset_type_name: 'Characters', id: 3 },
      { name: 'Test', asset_type_name: 'Props', id: 4 },
      { name: 'New object', asset_type_name: 'Props', id: 5 },
      { name: 'constructor', asset_type_name: 'Props', id: 6 }
    ]
    const index = buildAssetIndex(entries)
    expect(index.A).toBeUndefined()
    expect(index.ch).toHaveLength(3)
    expect(index.agent).toHaveLength(1)
    expect(index.bunny).toHaveLength(1)
    expect(index.bunny[0].id).toEqual(3)
    expect(index.ject).toHaveLength(1)
    expect(index.ject[0].id).toEqual(5)
  })

  it('buildShotIndex', () => {
    const entries = [
      { name: 'SH01', sequence_name: 'S01', episode_name: 'E01', id: 1 },
      { name: 'SH02', sequence_name: 'S01', episode_name: 'E01', id: 2 },
      { name: 'SH01', sequence_name: 'S02', episode_name: 'E01', id: 3 },
      { name: 'SH01', sequence_name: 'S01', episode_name: 'E02', id: 4 },
      { name: 'SH02', sequence_name: 'S01', episode_name: 'E02', id: 5 },
      {
        name: 'constructor',
        sequence_name: 'SEQ01',
        episode_name: 'EP02',
        id: 6
      }
    ]
    const index = buildShotIndex(entries)
    expect(index.e01).toHaveLength(3)
    expect(index.s01).toHaveLength(4)
    expect(index.sh01).toHaveLength(3)
  })

  it('buildTaskIndex', () => {
    const entries = [
      {
        full_entity_name: 'E01 / SQ01 / SH01',
        task_status_short_name: 'wfa',
        task_type_name: 'Animation',
        project_name: 'Caminandes',
        id: 1
      },
      {
        full_entity_name: 'E01 / SQ01 / SH02',
        task_status_short_name: 'wip',
        task_type_name: 'Animation',
        project_name: 'Caminandes',
        id: 2
      },
      {
        full_entity_name: 'Characters / Agent327',
        task_status_short_name: 'wip',
        task_type_name: 'Modeling',
        project_name: 'Agent327',
        id: 3
      },
      {
        full_entity_name: 'Characters / SuperEvil',
        task_status_short_name: 'todo',
        task_type_name: 'Modeling',
        project_name: 'Caminandes',
        id: 4
      },
      {
        full_entity_name: 'Props / Tree',
        task_status_short_name: 'todo',
        task_type_name: 'Modeling',
        project_name: 'Caminandes',
        id: 5
      },
      {
        full_entity_name: 'constructor',
        task_status_short_name: 'wip',
        task_type_name: 'Modeling',
        project_name: 'security',
        id: 6
      }
    ]
    const index = buildTaskIndex(entries)
    expect(index.e01).toHaveLength(2)
    expect(index.wip).toHaveLength(3)
    expect(index.caminandes).toHaveLength(4)
    expect(index.agent327).toHaveLength(1)
  })

  it('indexSearch', () => {
    const entries = [
      { name: 'Agent327', id: 1 },
      { name: 'Arnold', id: 2 },
      { name: 'Bunny', id: 3 },
      { name: 'Test', id: 4 },
      { name: 'constructor', id: 5 }
    ]
    const index = buildNameIndex(entries)
    expect(indexSearch(index, ['A'])).toHaveLength(2)
    expect(indexSearch(index, ['Ca'])).toHaveLength(0)
    expect(indexSearch(index, ['a'])).toHaveLength(2)
    expect(indexSearch(index, ['bunny'])).toHaveLength(1)
    expect(indexSearch(index, ['bunny'])[0].id).toEqual(3)
  })

  it('indexSearch finds substrings (not just prefixes)', () => {
    const entries = [
      { name: 'Caminandes', id: 1 },
      { name: 'Agent327', id: 2 },
      { name: 'Spring', id: 3 }
    ]
    const index = buildNameIndex(entries)
    expect(indexSearch(index, ['andes'])).toHaveLength(1)
    expect(indexSearch(index, ['andes'])[0].id).toEqual(1)
    expect(indexSearch(index, ['327'])).toHaveLength(1)
    expect(indexSearch(index, ['327'])[0].id).toEqual(2)
    expect(indexSearch(index, ['rin'])).toHaveLength(1)
    expect(indexSearch(index, ['rin'])[0].id).toEqual(3)
    expect(indexSearch(index, ['xyz'])).toHaveLength(0)
  })

  it('indexSearch with multiple terms intersects results', () => {
    const entries = [
      { name: 'Big Buck', id: 1 },
      { name: 'Big Hero', id: 2 },
      { name: 'Small Buck', id: 3 }
    ]
    const index = buildNameIndex(entries)
    expect(indexSearch(index, ['big', 'buck'])).toHaveLength(1)
    expect(indexSearch(index, ['big', 'buck'])[0].id).toEqual(1)
  })
})
