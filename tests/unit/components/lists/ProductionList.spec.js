import { createStore } from 'vuex'

import resizableColumn from '@/directives/resizable-column'

import ProductionList from '@/components/lists/ProductionList.vue'

import { shallowMountWithI18n } from '../../fixtures/i18n'

describe('lists/ProductionList', () => {
  // A column named "Constructor" has the field name of a property every
  // object inherits.
  test('groups the productions without a Constructor value under None', () => {
    const productions = [
      {
        id: 'production-1',
        name: 'Alpha',
        project_status_name: 'Open',
        data: {}
      },
      {
        id: 'production-2',
        name: 'Bravo',
        project_status_name: 'Open',
        data: { constructor: 'Studio B' }
      }
    ]
    const store = createStore({
      getters: {
        isCurrentUserManager: () => false,
        isCurrentUserSupervisor: () => false,
        lastProductionScreen: () => 'assets',
        mergedProjectMetadataDescriptors: () => [],
        openProductions: () => productions
      }
    })
    const wrapper = shallowMountWithI18n(ProductionList, {
      global: {
        plugins: [store, resizableColumn],
        stubs: { RouterLink: true }
      },
      props: { entries: productions, groupBy: 'constructor' }
    })

    expect(
      wrapper
        .findAll('tr.datatable-type-header')
        .map(header => header.text().replace(/\s+/g, ' '))
    ).toEqual(['None (1)', 'Studio B (1)'])
    wrapper.unmount()
  })
})
