import { flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

// Some of these modals pull in the store modules, hence the root store.
vi.mock('@/store', () => ({ default: {} }))

// A very heavy component, only rendered by the playlist modal.
vi.mock('@/components/players/players/PlaylistPlayer.vue', () => ({
  default: { name: 'PlaylistPlayer', render: () => null }
}))

import AddAttachmentModal from '@/components/modals/AddAttachmentModal.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditCommentModal from '@/components/modals/EditCommentModal.vue'
import EditCustomActionModal from '@/components/modals/EditCustomActionModal.vue'
import EditProductionModal from '@/components/modals/EditProductionModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import ManageShotsModal from '@/components/modals/ManageShotsModal.vue'
import PreviewModal from '@/components/modals/PreviewModal.vue'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'

import { shallowMountWithI18n } from '../fixtures/i18n'

const MODALS = [
  ['AddAttachmentModal', AddAttachmentModal],
  ['AddMetadataModal', AddMetadataModal],
  ['AddPreviewModal', AddPreviewModal],
  ['BaseModal', BaseModal],
  ['BuildFilterModal', BuildFilterModal],
  ['CreateTasksModal', CreateTasksModal],
  ['DeleteModal', DeleteModal, { text: 'Are you sure?' }],
  ['EditCommentModal', EditCommentModal],
  ['EditCustomActionModal', EditCustomActionModal],
  ['EditProductionModal', EditProductionModal, { productionToEdit: {} }],
  ['HardDeleteModal', HardDeleteModal],
  ['ManageShotsModal', ManageShotsModal],
  ['PreviewModal', PreviewModal],
  ['ViewPlaylistModal', ViewPlaylistModal]
]

const buildStore = () => {
  const store = createStore({
    getters: {
      assetMetadataDescriptors: () => [],
      assetSearchText: () => '',
      assetTypeMap: () => new Map(),
      assetValidationColumns: () => [],
      currentEpisode: () => null,
      currentProduction: () => ({ id: 'production-1', task_types: [] }),
      departmentMap: () => new Map(),
      displayedEpisodes: () => [],
      displayedSequences: () => [],
      editMetadataDescriptors: () => [],
      editSearchText: () => '',
      editValidationColumns: () => [],
      episodeMetadataDescriptors: () => [],
      episodeSearchText: () => '',
      episodeValidationColumns: () => [],
      getTaskStatusForCurrentUser: () => () => [],
      isCurrentUserClient: () => false,
      isCurrentUserProductionSupervisor: () => false,
      isCurrentUserVendor: () => false,
      isSupportChat: () => false,
      isTVShow: () => false,
      people: () => [],
      personMap: () => new Map(),
      productionAssetTaskTypes: () => [],
      productionAssetTypes: () => [],
      productionDepartmentIds: () => [],
      productionEditTaskTypes: () => [],
      productionEpisodeTaskTypes: () => [],
      productionSequenceTaskTypes: () => [],
      productionShotTaskTypes: () => [],
      productionStatusOptions: () => [],
      productionTaskStatuses: () => [],
      productionTaskTypes: () => [],
      selectedTasks: () => new Map(),
      sequenceMetadataDescriptors: () => [],
      sequenceSearchText: () => '',
      sequenceValidationColumns: () => [],
      shotMetadataDescriptors: () => [],
      shotSearchText: () => '',
      shotValidationColumns: () => [],
      taskStatusForCurrentUser: () => [],
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map(),
      user: () => ({ id: 'user-1' })
    }
  })
  store.commit = vi.fn()
  store.dispatch = vi.fn(() => Promise.resolve([]))
  return store
}

// The modals focus their first field once open.
const TextField = { methods: { focus: () => {} }, render: () => null }

// Each of them closes on a click on its background, with the real useModal.
describe.each(MODALS)('%s, background', (name, component, props = {}) => {
  let wrapper = null

  // `trigger` cannot set the click count: `detail` is read-only on its event.
  // From the document: the playlist modal has a teleport for a root.
  const clickBackground = clickCount =>
    document
      .querySelector('.modal-background')
      .dispatchEvent(
        new MouseEvent('click', { bubbles: true, detail: clickCount })
      )

  beforeEach(async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }]
    })
    await router.push('/productions/production-1/shots')
    await router.isReady()
    wrapper = shallowMountWithI18n(component, {
      attachTo: document.body,
      props: { active: true, ...props },
      global: {
        plugins: [buildStore(), router],
        stubs: { teleport: false, TextField }
      }
    })
    await flushPromises()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  test('cancels on a click', () => {
    clickBackground(1)

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // The button that opens a modal gets the first click of a double click, and
  // the background the second.
  test('stays open on the second click of a double click', () => {
    clickBackground(2)

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })
})
