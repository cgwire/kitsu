vi.mock('@/store', () => ({ default: {} }))

import { computed, defineComponent } from 'vue'

import {
  getStickyOffsets,
  showHeaderMenuAt,
  useEntityList
} from '@/composables/entityList'

import { mountEntityList, production } from '../fixtures/entity-list'

// A bare host: the composable only needs the list props and emit.
const Host = defineComponent({
  props: {
    departmentFilter: { type: Array, default: () => [] },
    displaySettings: { type: Object, default: () => ({}) },
    isError: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    validationColumns: { type: Array, default: () => [] }
  },
  emits: ['metadata-changed'],
  setup(props, { emit }) {
    const list = useEntityList({
      type: 'shot',
      props,
      emit,
      entities: computed(() => []),
      filledColumns: computed(() => ({})),
      metadataDescriptors: computed(() => []),
      isEmptyList: computed(() => true)
    })
    return { list }
  },
  template: '<div />'
})

describe('entity list header menus', () => {
  const makeMenus = () => ({
    headerMenu: document.createElement('div'),
    headerMetadataMenu: document.createElement('div'),
    headerFieldMenu: document.createElement('div')
  })

  test('closes a visible menu when its current column is clicked', () => {
    const menus = makeMenus()

    showHeaderMenuAt(
      menus,
      'headerFieldMenu',
      {},
      () => document.createElement('th'),
      {},
      true
    )

    expect(menus.headerFieldMenu.classList).toContain('hidden')
  })

  test('repositions a visible menu when another column is clicked', () => {
    const menus = makeMenus()
    menus.headerMenu.classList.remove('hidden')
    const header = document.createElement('th')
    header.getBoundingClientRect = () => ({
      bottom: 60,
      left: 20,
      width: 150
    })

    showHeaderMenuAt(
      menus,
      'headerFieldMenu',
      {},
      () => header,
      { left: -3, top: 11 },
      false
    )

    expect(menus.headerFieldMenu.classList).not.toContain('hidden')
    expect(menus.headerFieldMenu.style.left).toBe('17px')
    expect(menus.headerFieldMenu.style.top).toBe('71px')
    expect(menus.headerFieldMenu.style.width).toBe('149px')
    // The other menus close.
    expect(menus.headerMenu.classList).toContain('hidden')
  })
})

const header = width => ({ getBoundingClientRect: () => ({ width }) })

describe('entity list sticky offsets', () => {
  test('places the sticky columns after the full width of the previous ones', () => {
    const refs = {
      'th-name': header(200.5),
      'validation-0': [{ $el: header(151) }],
      'validation-1': [{ $el: header(151) }]
    }

    const sticky = getStickyOffsets(refs, {
      showInfos: true,
      metadataCount: 0,
      validationCount: 2
    })

    expect(sticky.nameWidth).toBe(200.5)
    expect(sticky.offsets).toEqual({
      'validation-0': 200.5,
      'validation-1': 351.5
    })
  })

  test('places the sticky metadata columns after the name and the episode', () => {
    const refs = {
      'th-name': header(200.5),
      'th-episode': header(80),
      'editor-0': [{ $el: header(121) }],
      'validation-0': [{ $el: header(151) }]
    }

    const sticky = getStickyOffsets(refs, {
      showInfos: true,
      metadataCount: 1,
      validationCount: 1
    })

    expect(sticky.offsets).toEqual({
      'editor-0': 280.5,
      'validation-0': 401.5
    })
  })

  test('skips the metadata columns while the infos are hidden', () => {
    const refs = {
      'th-name': header(200),
      'validation-0': [{ $el: header(150) }]
    }

    const sticky = getStickyOffsets(refs, {
      showInfos: false,
      metadataCount: 1,
      validationCount: 1
    })

    expect(sticky.offsets).toEqual({ 'validation-0': 200 })
  })
})

describe('entity list metadata edition', () => {
  const DESCRIPTOR = { field_name: 'duration', data_type: 'string' }
  const shot = (id, duration) => ({ id, data: { duration } })

  const mountHost = (...selectedShots) =>
    mountEntityList(Host, {
      getters: {
        currentProduction: production,
        selectedShots: new Map(selectedShots.map(entry => [entry.id, entry]))
      }
    })

  const makeEvent = (value, inputType) => {
    const input = document.createElement('input')
    input.value = value
    return { target: input, inputType }
  }

  test('a typed value is propagated to every selected entry', async () => {
    const a = shot('shot-a', '120')
    const b = shot('shot-b', '48')
    const wrapper = await mountHost(a, b)

    wrapper.vm.list.onMetadataFieldChanged(
      a,
      DESCRIPTOR,
      makeEvent('96', 'insertText')
    )

    expect(wrapper.emitted('metadata-changed')).toEqual([
      [{ entry: a, descriptor: DESCRIPTOR, value: '96' }],
      [{ entry: b, descriptor: DESCRIPTOR, value: '96' }]
    ])
  })

  test('a value typed on an unselected entry changes that entry only', async () => {
    const a = shot('shot-a', '120')
    const b = shot('shot-b', '48')
    const wrapper = await mountHost(b)

    wrapper.vm.list.onMetadataFieldChanged(
      a,
      DESCRIPTOR,
      makeEvent('96', 'insertText')
    )

    expect(wrapper.emitted('metadata-changed')).toEqual([
      [{ entry: a, descriptor: DESCRIPTOR, value: '96' }]
    ])
  })

  test.each(['historyUndo', 'historyRedo'])(
    'a %s input writes nothing and restores the stored value',
    async inputType => {
      const a = shot('shot-a', '120')
      const b = shot('shot-b', '48')
      const wrapper = await mountHost(a, b)
      const event = makeEvent('96', inputType)

      wrapper.vm.list.onMetadataFieldChanged(a, DESCRIPTOR, event)

      expect(wrapper.emitted('metadata-changed')).toBeUndefined()
      expect(event.target.value).toBe('120')
    }
  )
})
