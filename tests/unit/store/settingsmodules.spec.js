// @vitest-environment node

import superagent from 'superagent'
import { vi } from 'vitest'
import { createStore } from 'vuex'

import client from '@/store/api/client'
import {
  LOAD_ASSET_TYPES_END,
  LOAD_BACKGROUNDS_END,
  RESET_ALL
} from '@/store/mutation-types'

vi.mock('@/store/api/client', () => ({
  default: {
    pdel: vi.fn(),
    pget: vi.fn(),
    ppost: vi.fn(),
    pput: vi.fn()
  }
}))

vi.mock('superagent', () => ({ default: { post: vi.fn() } }))

// The settings modules share one contract: their actions call the API, then
// their mutations keep the list sorted and the map in step. Each test imports
// a fresh module, since their state and cache live at module level.
const buildStore = async (row, options = {}) => {
  vi.resetModules()
  const { default: module } = await row.load()
  const store = createStore({ modules: { [row.name]: module }, ...options })
  return { module, store }
}

const names = list => list.map(({ name }) => name)

const buildItems = () => [
  { id: 'item-3', name: 'Charlie' },
  { id: 'item-1', name: 'Alpha' },
  { id: 'item-2', name: 'Bravo', archived: true }
]

const rows = [
  {
    name: 'hardware',
    load: () => import('@/store/modules/hardware'),
    url: '/api/data/hardware-items',
    stateKey: 'hardwareItems',
    list: 'hardwareItems',
    archived: 'archivedHardwareItems',
    actions: {
      load: 'loadHardwareItems',
      create: 'newHardwareItem',
      edit: 'editHardwareItem',
      remove: 'deleteHardwareItem'
    },
    form: { short_name: 'WS', monthly_cost: 120, inventory_amount: 4 },
    payload: { short_name: 'WS', monthly_cost: 120, inventory_amount: 4 },
    returnsItem: true,
    editsArchived: true
  },
  {
    name: 'software',
    load: () => import('@/store/modules/software'),
    url: '/api/data/softwares',
    stateKey: 'softwareLicenses',
    list: 'softwareLicenses',
    archived: 'archivedSoftwareLicenses',
    actions: {
      load: 'loadSoftwareLicenses',
      create: 'newSoftwareLicense',
      edit: 'editSoftwareLicense',
      remove: 'deleteSoftwareLicense'
    },
    form: {
      short_name: 'BL',
      version: '5.0',
      file_extension: 'blend',
      monthly_cost: 0,
      inventory_amount: 10
    },
    payload: {
      short_name: 'BL',
      version: '5.0',
      file_extension: 'blend',
      monthly_cost: 0,
      inventory_amount: 10
    },
    returnsItem: true,
    editsArchived: true
  },
  {
    name: 'assettypes',
    load: () => import('@/store/modules/assettypes'),
    url: '/api/data/entity-types',
    // The user context loads the list.
    loadMutation: LOAD_ASSET_TYPES_END,
    stateKey: 'assetTypes',
    list: 'assetTypes',
    archived: 'archivedAssetTypes',
    map: store => store.getters.assetTypeMap,
    actions: {
      create: 'newAssetType',
      edit: 'editAssetType',
      remove: 'deleteAssetType'
    },
    form: { short_name: 'PRP', description: 'Props', task_types: ['tt-1'] },
    payload: {
      short_name: 'PRP',
      description: 'Props',
      task_types: ['tt-1']
    },
    editsArchived: true
  },
  {
    name: 'statusautomation',
    load: () => import('@/store/modules/statusautomation'),
    url: '/api/data/status-automations',
    createUrl: '/api/data/status-automations/',
    stateKey: 'statusAutomations',
    list: 'statusAutomations',
    archived: 'archivedStatusAutomations',
    map: store => store.getters.statusAutomationMap,
    // Automations have no name: the list keeps the order of the server.
    unsorted: true,
    sendsName: false,
    actions: {
      load: 'loadStatusAutomations',
      create: 'newStatusAutomation',
      edit: 'editStatusAutomation',
      remove: 'deleteStatusAutomation'
    },
    form: {
      entityType: 'asset',
      inFieldType: 'status',
      inTaskTypeId: 'tt-1',
      inTaskStatusId: 'ts-1',
      outFieldType: 'status',
      outTaskTypeId: 'tt-2',
      outTaskStatusId: 'ts-2',
      importLastRevision: 'true'
    },
    payload: {
      entity_type: 'asset',
      in_field_type: 'status',
      in_task_type_id: 'tt-1',
      in_task_status_id: 'ts-1',
      out_field_type: 'status',
      out_task_type_id: 'tt-2',
      out_task_status_id: 'ts-2',
      import_last_revision: true
    },
    returnsItem: true,
    editsArchived: true,
    // The load swallows its failure and leaves an empty list.
    failedLoadEmpties: true
  },
  {
    name: 'backgrounds',
    load: () => import('@/store/modules/backgrounds'),
    url: '/api/data/preview-background-files',
    // The user context loads the list.
    loadMutation: LOAD_BACKGROUNDS_END,
    stateKey: 'backgrounds',
    list: 'backgrounds',
    archived: 'archivedBackgrounds',
    map: (store, module) => module.cache.backgroundMap,
    // The creation uploads a file too: see the preview background tests.
    actions: { edit: 'saveBackground', remove: 'deleteBackground' },
    form: { is_default: false },
    sendsForm: true,
    returnsItem: true
  },
  {
    name: 'customactions',
    load: () => import('@/store/modules/customactions'),
    url: '/api/data/custom-actions',
    createUrl: '/api/data/custom-actions/',
    stateKey: 'customActions',
    list: 'customActions',
    actions: {
      load: 'loadCustomActions',
      create: 'newCustomAction',
      edit: 'editCustomAction',
      remove: 'deleteCustomAction'
    },
    form: { url: 'https://hooks.example.com/run', entityType: 'shot' },
    payload: {
      url: 'https://hooks.example.com/run',
      entity_type: 'shot',
      is_ajax: false
    }
  },
  {
    name: 'departments',
    load: () => import('@/store/modules/departments'),
    url: '/api/data/departments',
    stateKey: 'departments',
    list: 'departments',
    archived: 'archivedDepartments',
    map: store => store.getters.departmentMap,
    actions: {
      load: 'loadDepartments',
      create: 'newDepartment',
      edit: 'editDepartment',
      remove: 'deleteDepartment'
    },
    form: { color: '#ff0000' },
    payload: { color: '#ff0000', archived: false },
    returnsItem: true,
    editsArchived: true
  },
  {
    name: 'studios',
    load: () => import('@/store/modules/studios'),
    url: '/api/data/studios',
    stateKey: 'studios',
    list: 'studios',
    archived: 'archivedStudios',
    map: store => store.getters.studioMap,
    actions: {
      load: 'loadStudios',
      create: 'newStudio',
      edit: 'editStudio',
      remove: 'deleteStudio'
    },
    form: { color: '#00ff00' },
    payload: { color: '#00ff00', archived: false },
    returnsItem: true,
    editsArchived: true
  }
]

const loadItems = async (row, store, items) => {
  if (row.actions.load) {
    client.pget.mockResolvedValueOnce(items)
    await store.dispatch(row.actions.load)
  } else {
    store.commit(row.loadMutation, items)
  }
}

// What the list getter shows of buildItems() once loaded.
const loadedNames = row => {
  const shown = row.archived
    ? ['Charlie', 'Alpha']
    : ['Charlie', 'Alpha', 'Bravo']
  return row.unsorted ? shown : [...shown].sort()
}

const sortNames = (row, list) => (row.unsorted ? list : [...list].sort())

const expectedPayload = (row, form) => {
  if (row.sendsForm) return form
  const payload = { ...row.payload }
  if (row.sendsName !== false) payload.name = form.name
  if (form.archived) payload.archived = form.archived === 'true'
  return payload
}

describe('Settings store modules', () => {
  beforeEach(() => {
    Object.values(client).forEach(fn => fn.mockReset())
  })

  describe.each(rows)('$name', row => {
    test('loads the list, sorted, the archived ones apart', async () => {
      const { module, store } = await buildStore(row)
      await loadItems(row, store, buildItems())

      if (row.actions.load) {
        expect(client.pget).toHaveBeenCalledWith(row.url)
      }
      expect(names(store.getters[row.list])).toEqual(loadedNames(row))
      if (row.archived) {
        expect(names(store.getters[row.archived])).toEqual(['Bravo'])
      }
      if (row.map) {
        expect([...row.map(store, module).keys()].sort()).toEqual([
          'item-1',
          'item-2',
          'item-3'
        ])
      }
    })

    test('edits an item and keeps the list sorted', async () => {
      const { module, store } = await buildStore(row)
      await loadItems(row, store, buildItems())
      const edited = { id: 'item-1', name: 'Zulu' }
      client.pput.mockResolvedValueOnce(edited)
      const form = { ...row.form, id: 'item-1', name: 'Zulu' }
      if (row.editsArchived) form.archived = 'false'

      const result = await store.dispatch(row.actions.edit, form)

      expect(client.pput).toHaveBeenCalledWith(
        `${row.url}/item-1`,
        expectedPayload(row, form)
      )
      // Alpha led the sorted list: renamed Zulu, it goes last.
      expect(names(store.getters[row.list])).toEqual(
        sortNames(
          row,
          loadedNames(row).map(name => (name === 'Alpha' ? 'Zulu' : name))
        )
      )
      if (row.map) {
        expect(row.map(store, module).get('item-1')).toMatchObject({
          name: 'Zulu'
        })
      }
      if (row.returnsItem) expect(result).toEqual(edited)
    })

    test('deletes an item', async () => {
      const { module, store } = await buildStore(row)
      await loadItems(row, store, buildItems())
      client.pdel.mockResolvedValueOnce()

      await store.dispatch(row.actions.remove, { id: 'item-3' })

      expect(client.pdel).toHaveBeenCalledWith(`${row.url}/item-3`)
      expect(names(store.getters[row.list])).toEqual(
        loadedNames(row).filter(name => name !== 'Charlie')
      )
      if (row.map) expect(row.map(store, module).has('item-3')).toBe(false)
    })

    test('keeps the list when the deleted item is not in it', async () => {
      const { store } = await buildStore(row)
      await loadItems(row, store, buildItems())
      client.pdel.mockResolvedValueOnce()

      await store.dispatch(row.actions.remove, { id: 'item-9' })

      expect(names(store.getters[row.list])).toEqual(loadedNames(row))
    })

    test('empties the list and the map on RESET_ALL', async () => {
      const { module, store } = await buildStore(row)
      await loadItems(row, store, buildItems())

      store.commit(RESET_ALL)

      expect(store.state[row.name][row.stateKey]).toEqual([])
      if (row.map) expect(row.map(store, module).size).toBe(0)
    })
  })

  describe.each(rows.filter(({ actions }) => actions.create))(
    '$name creation',
    row => {
      test('creates an item at its place in the list', async () => {
        const { module, store } = await buildStore(row)
        await loadItems(row, store, buildItems())
        const created = { id: 'item-4', name: 'Bobby' }
        client.ppost.mockResolvedValueOnce(created)
        const form = { ...row.form, name: 'Bobby' }

        const result = await store.dispatch(row.actions.create, form)

        expect(client.ppost).toHaveBeenCalledWith(
          row.createUrl ?? row.url,
          expectedPayload(row, form)
        )
        expect(names(store.getters[row.list])).toEqual(
          sortNames(row, [...loadedNames(row), 'Bobby'])
        )
        if (row.map) {
          expect(row.map(store, module).get('item-4')).toMatchObject({
            name: 'Bobby'
          })
        }
        if (row.returnsItem) expect(result).toEqual(created)
      })
    }
  )

  describe.each(rows.filter(({ editsArchived }) => editsArchived))(
    '$name archiving',
    row => {
      test('moves an archived item to the archived list', async () => {
        const { store } = await buildStore(row)
        await loadItems(row, store, buildItems())
        client.pput.mockResolvedValueOnce({
          id: 'item-1',
          name: 'Alpha',
          archived: true
        })

        await store.dispatch(row.actions.edit, {
          ...row.form,
          id: 'item-1',
          name: 'Alpha',
          archived: 'true'
        })

        expect(client.pput).toHaveBeenCalledWith(
          `${row.url}/item-1`,
          expect.objectContaining({ archived: true })
        )
        expect(names(store.getters[row.list])).toEqual(['Charlie'])
        expect(names(store.getters[row.archived])).toEqual(['Alpha', 'Bravo'])
      })
    }
  )

  describe.each(rows.filter(({ actions }) => actions.load))(
    '$name loading',
    row => {
      test('resolves the load once the list is in the store', async () => {
        const { store } = await buildStore(row)
        // The answer comes a task later, as from the network.
        client.pget.mockImplementationOnce(
          () => new Promise(resolve => setTimeout(() => resolve(buildItems())))
        )

        await store.dispatch(row.actions.load)

        expect(names(store.getters[row.list])).toEqual(loadedNames(row))
      })

      test('rejects a failed load, unless its module empties its list', async () => {
        const { store } = await buildStore(row)
        await loadItems(row, store, buildItems())
        client.pget.mockRejectedValueOnce(new Error('Server error'))

        if (row.failedLoadEmpties) {
          await store.dispatch(row.actions.load)
          expect(store.getters[row.list]).toEqual([])
        } else {
          await expect(store.dispatch(row.actions.load)).rejects.toThrow(
            'Server error'
          )
        }
      })
    }
  )

  describe.each(rows.filter(({ map }) => map))('$name reload', row => {
    test('forgets the items a reload no longer has', async () => {
      const { module, store } = await buildStore(row)
      await loadItems(row, store, buildItems())
      await loadItems(
        row,
        store,
        buildItems().filter(({ id }) => id !== 'item-3')
      )

      expect([...row.map(store, module).keys()].sort()).toEqual([
        'item-1',
        'item-2'
      ])
    })
  })

  describe('asset types', () => {
    const row = rows.find(({ name }) => name === 'assettypes')

    test('loads a single asset type', async () => {
      const { store } = await buildStore(row)
      client.pget.mockResolvedValueOnce({ id: 'item-5', name: 'Props' })

      await store.dispatch('loadAssetType', 'item-5')

      expect(client.pget).toHaveBeenCalledWith('/api/data/entity-types/item-5')
      expect(names(store.getters.assetTypes)).toEqual(['Props'])
      expect(store.getters.assetTypeMap.get('item-5')).toMatchObject({
        name: 'Props'
      })
    })
  })

  describe('status automations', () => {
    const row = rows.find(({ name }) => name === 'statusautomation')

    test('applies an automation toward a later task type', async () => {
      const isHigher = vi.fn(() => true)
      const { store } = await buildStore(row, {
        getters: { isTaskTypePriorityHigherById: () => isHigher }
      })

      expect(
        store.getters.isStatusAutomationDisabled({
          out_field_type: 'status',
          in_task_type_id: 'tt-1',
          out_task_type_id: 'tt-2'
        })
      ).toBe(false)
      expect(isHigher).toHaveBeenCalledWith('tt-2', 'tt-1')
    })

    test('disables an automation toward an earlier task type', async () => {
      const { store } = await buildStore(row, {
        getters: { isTaskTypePriorityHigherById: () => () => false }
      })

      expect(
        store.getters.isStatusAutomationDisabled({
          out_field_type: 'status',
          in_task_type_id: 'tt-2',
          out_task_type_id: 'tt-1'
        })
      ).toBe(true)
    })

    test('never disables a ready for automation', async () => {
      const { store } = await buildStore(row, {
        getters: { isTaskTypePriorityHigherById: () => () => false }
      })

      expect(
        store.getters.isStatusAutomationDisabled({
          out_field_type: 'ready_for',
          in_task_type_id: 'tt-2',
          out_task_type_id: 'tt-1'
        })
      ).toBe(false)
    })
  })

  describe('preview backgrounds', () => {
    const row = rows.find(({ name }) => name === 'backgrounds')

    test('creates a background, then uploads its file', async () => {
      const { module, store } = await buildStore(row)
      const file = { name: 'studio.hdr' }
      client.ppost
        .mockResolvedValueOnce({ id: 'item-4', name: 'Studio' })
        .mockResolvedValueOnce({
          id: 'item-4',
          name: 'Studio',
          extension: 'hdr'
        })

      const background = await store.dispatch('newBackground', {
        name: 'Studio',
        is_default: true,
        file
      })

      expect(client.ppost).toHaveBeenNthCalledWith(
        1,
        '/api/data/preview-background-files/',
        { is_default: true, name: 'Studio' }
      )
      expect(client.ppost).toHaveBeenNthCalledWith(
        2,
        '/api/pictures/preview-background-files/item-4',
        file
      )
      expect(background).toMatchObject({
        url: '/api/pictures/preview-background-files/item-4.hdr',
        thumbnail:
          '/api/pictures/thumbnails/preview-background-files/item-4.png'
      })
      expect(module.cache.backgroundMap.get('item-4')).toBe(background)
    })

    test('builds the file paths of the loaded backgrounds', async () => {
      const { store } = await buildStore(row)

      store.commit(LOAD_BACKGROUNDS_END, [
        { id: 'item-1', name: 'Forest', extension: 'jpg' }
      ])

      expect(store.getters.backgrounds[0]).toMatchObject({
        url: '/api/pictures/preview-background-files/item-1.jpg',
        thumbnail:
          '/api/pictures/thumbnails/preview-background-files/item-1.png'
      })
    })

    test('keeps a single default background', async () => {
      const { store } = await buildStore(row)
      store.commit(LOAD_BACKGROUNDS_END, [
        { id: 'item-1', name: 'Forest', is_default: true },
        { id: 'item-2', name: 'Studio', is_default: false }
      ])
      client.pput.mockResolvedValueOnce({
        id: 'item-2',
        name: 'Studio',
        is_default: true
      })

      await store.dispatch('saveBackground', {
        id: 'item-2',
        name: 'Studio',
        is_default: true
      })

      expect(
        store.getters.backgrounds.map(({ name, is_default }) => [
          name,
          is_default
        ])
      ).toEqual([
        ['Forest', false],
        ['Studio', true]
      ])
    })
  })

  describe('custom actions', () => {
    const row = rows.find(({ name }) => name === 'customactions')

    test('sends the ajax option as a boolean', async () => {
      const { store } = await buildStore(row)
      client.ppost.mockResolvedValueOnce({ id: 'item-4', name: 'Notify' })

      await store.dispatch('newCustomAction', {
        ...row.form,
        name: 'Notify',
        isAjax: 'true'
      })

      expect(client.ppost).toHaveBeenCalledWith(
        '/api/data/custom-actions/',
        expect.objectContaining({ is_ajax: true })
      )
    })

    test('lists the actions of the selected entity types', async () => {
      const { store } = await buildStore(row)
      client.pget.mockResolvedValueOnce([
        { id: 'a-1', name: 'All', entity_type: 'all' },
        { id: 'a-2', name: 'Asset', entity_type: 'asset' },
        { id: 'a-3', name: 'Shot', entity_type: 'shot' },
        { id: 'a-4', name: 'Sequence', entity_type: 'sequence' },
        { id: 'a-5', name: 'Edit', entity_type: 'edit' },
        { id: 'a-6', name: 'Episode', entity_type: 'episode' }
      ])
      await store.dispatch('loadCustomActions')
      const byType = store.getters.getCustomActionsByType

      expect(names(byType(false, false, false, false, false))).toEqual(['All'])
      expect(names(byType(true, false, false, false, false))).toEqual([
        'All',
        'Asset'
      ])
      expect(names(byType(false, true, true, false, false))).toEqual([
        'All',
        'Sequence',
        'Shot'
      ])
      expect(names(byType(false, false, false, true, true))).toEqual([
        'All',
        'Edit',
        'Episode'
      ])
    })

    test('posts the selection to the action URL with the cookies', async () => {
      const { store } = await buildStore(row)
      const request = { withCredentials: vi.fn(), send: vi.fn() }
      request.withCredentials.mockReturnValue(request)
      request.send.mockResolvedValue({ status: 200 })
      superagent.post.mockReturnValue(request)
      const data = { personid: 'person-1', selection: ['task-1'] }

      const response = await store.dispatch('postCustomAction', {
        url: 'https://hooks.example.com/run',
        data
      })

      expect(superagent.post).toHaveBeenCalledWith(
        'https://hooks.example.com/run'
      )
      expect(request.withCredentials).toHaveBeenCalled()
      expect(request.send).toHaveBeenCalledWith(data)
      expect(response).toEqual({ status: 200 })
    })
  })

  describe('departments', () => {
    const row = rows.find(({ name }) => name === 'departments')

    test('loads a single department', async () => {
      const { store } = await buildStore(row)
      const department = { id: 'item-5', name: 'Lighting' }
      client.pget.mockResolvedValueOnce(department)

      const result = await store.dispatch('loadDepartment', 'item-5')

      expect(client.pget).toHaveBeenCalledWith('/api/data/departments/item-5')
      expect(result).toEqual(department)
      expect(names(store.getters.departments)).toEqual(['Lighting'])
    })

    test.each([
      [
        'loadLinkedHardwareItems',
        undefined,
        'pget',
        ['/api/data/departments/hardware-items']
      ],
      [
        'loadLinkedSoftwareLicenses',
        undefined,
        'pget',
        ['/api/data/departments/software-licenses']
      ],
      [
        'linkHardwareItem',
        { departmentId: 'd-1', hardwareItemId: 'h-1' },
        'ppost',
        [
          '/api/data/departments/d-1/hardware-items',
          { hardware_item_id: 'h-1' }
        ]
      ],
      [
        'linkSoftwareLicense',
        { departmentId: 'd-1', softwareLicenseId: 's-1' },
        'ppost',
        ['/api/data/departments/d-1/software-licenses', { software_id: 's-1' }]
      ],
      [
        'unlinkHardwareItem',
        { departmentId: 'd-1', hardwareItemId: 'h-1' },
        'pdel',
        ['/api/data/departments/d-1/hardware-items/h-1']
      ],
      [
        'unlinkSoftwareLicense',
        { departmentId: 'd-1', softwareLicenseId: 's-1' },
        'pdel',
        ['/api/data/departments/d-1/software-licenses/s-1']
      ]
    ])('%s goes to the API', async (action, payload, method, args) => {
      const { store } = await buildStore(row)
      client[method].mockResolvedValueOnce({ ok: true })

      const result = await store.dispatch(action, payload)

      expect(client[method]).toHaveBeenCalledWith(...args)
      expect(result).toEqual({ ok: true })
    })
  })
})
