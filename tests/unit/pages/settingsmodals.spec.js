import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import BackgroundList from '@/components/lists/BackgroundList.vue'
import DepartmentList from '@/components/lists/DepartmentList.vue'
import PeopleList from '@/components/lists/PeopleList.vue'
import ProjectTemplateList from '@/components/lists/ProjectTemplateList.vue'
import StudioList from '@/components/lists/StudioList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import ChangeAvatarModal from '@/components/modals/ChangeAvatarModal.vue'
import EditBackgroundModal from '@/components/modals/EditBackgroundModal.vue'
import EditDepartmentsModal from '@/components/modals/EditDepartmentsModal.vue'
import EditProjectTemplateModal from '@/components/modals/EditProjectTemplateModal.vue'
import EditStudiosModal from '@/components/modals/EditStudiosModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import Backgrounds from '@/components/pages/Backgrounds.vue'
import Bots from '@/components/pages/Bots.vue'
import Departments from '@/components/pages/Departments.vue'
import ProjectTemplates from '@/components/pages/ProjectTemplates.vue'
import Settings from '@/components/pages/Settings.vue'
import Studios from '@/components/pages/Studios.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/:path(.*)*', component: { template: '<div />' } }]
})

const entry = { id: 'entry-1', name: 'Main' }
const bot = {
  id: 'bot-1',
  full_name: 'Render bot',
  is_bot: true,
  active: true,
  role: 'user',
  departments: []
}

// Each page lists one entry. The actions listed fail when asked to, the
// others answer the loads.
const pages = {
  Backgrounds: {
    component: Backgrounds,
    getters: { archivedBackgrounds: () => [], backgrounds: () => [entry] },
    list: BackgroundList,
    editModal: EditBackgroundModal,
    actions: ['newBackground', 'saveBackground', 'deleteBackground']
  },
  Bots: {
    component: Bots,
    getters: {
      displayedPeople: () => [bot],
      isCurrentUserAdmin: () => true,
      isPeopleLoading: () => false,
      isPeopleLoadingError: () => false,
      people: () => [bot]
    },
    entry: bot,
    list: PeopleList,
    deleteModal: HardDeleteModal,
    actions: ['deletePeople']
  },
  Departments: {
    component: Departments,
    getters: {
      archivedDepartments: () => [],
      departments: () => [entry],
      hardwareItems: () => [],
      softwareLicenses: () => []
    },
    loads: { loadLinkedHardwareItems: {}, loadLinkedSoftwareLicenses: {} },
    list: DepartmentList,
    editModal: EditDepartmentsModal,
    actions: ['newDepartment', 'editDepartment', 'deleteDepartment']
  },
  ProjectTemplates: {
    component: ProjectTemplates,
    getters: { projectTemplates: () => [entry] },
    list: ProjectTemplateList,
    editModal: EditProjectTemplateModal,
    actions: [
      'newProjectTemplate',
      'editProjectTemplate',
      'deleteProjectTemplate'
    ]
  },
  Studios: {
    component: Studios,
    getters: { archivedStudios: () => [], studios: () => [entry] },
    list: StudioList,
    editModal: EditStudiosModal,
    actions: ['newStudio', 'editStudio', 'deleteStudio']
  }
}

const openers = {
  new: wrapper => wrapper.findComponent(ListPageHeader).vm.$emit('new-clicked'),
  edit: (wrapper, page) =>
    wrapper
      .findComponent(page.list)
      .vm.$emit('edit-clicked', page.entry ?? entry),
  delete: (wrapper, page) =>
    wrapper
      .findComponent(page.list)
      .vm.$emit('delete-clicked', page.entry ?? entry)
}

const mountPage = async (page, failAction) => {
  const store = createStore({ getters: page.getters })
  store.dispatch = vi.fn(action =>
    page.actions.includes(action)
      ? failAction()
      : Promise.resolve(page.loads?.[action])
  )
  await router.push('/settings')
  await router.isReady()
  const wrapper = shallowMount(page.component, {
    global: {
      plugins: [store, router],
      stubs: {
        SearchField: { template: '<input />', methods: { getValue: () => '' } }
      }
    }
  })
  await flushPromises()
  return wrapper
}

// A save or a deletion failing after Cancel, then the modal opened again.
const reopenAfterLateFailure = async (name, kind, error) => {
  const page = pages[name]
  let fail
  const wrapper = await mountPage(
    page,
    () =>
      new Promise((resolve, reject) => {
        fail = reject
      })
  )
  const open = async () => {
    openers[kind](wrapper, page)
    await flushPromises()
  }
  const modal = () =>
    wrapper.findComponent(
      kind === 'delete' ? (page.deleteModal ?? DeleteModal) : page.editModal
    )
  await open()
  modal().vm.$emit('confirm', { name: 'Renamed' })
  await modal().vm.$emit('cancel')
  fail(error)
  await flushPromises()
  expect(console.error).toHaveBeenCalledWith(error)

  await open()

  return modal()
}

describe('Settings pages', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Regression: a page kept the error of a failed save or deletion, so the
  // next opening of the modal showed it. A failure landing after Cancel must
  // not show either.
  test.each([
    ['Backgrounds', 'new'],
    ['Backgrounds', 'edit'],
    ['Backgrounds', 'delete'],
    ['Bots', 'delete'],
    ['Departments', 'new'],
    ['Departments', 'edit'],
    ['Departments', 'delete'],
    ['ProjectTemplates', 'new'],
    ['ProjectTemplates', 'edit'],
    ['ProjectTemplates', 'delete'],
    ['Studios', 'new'],
    ['Studios', 'edit'],
    ['Studios', 'delete']
  ])(
    '%s opens its %s modal without the error of a failure after Cancel',
    async (name, kind) => {
      const modal = await reopenAfterLateFailure(
        name,
        kind,
        new Error('Bad Request')
      )

      expect(modal.props('isError')).toBe(false)
    }
  )

  test.each(['new', 'edit'])(
    'ProjectTemplates opens its %s form without a late taken name error',
    async kind => {
      const error = Object.assign(new Error('Bad Request'), {
        body: { message: 'A project template with this name already exists.' }
      })

      const modal = await reopenAfterLateFailure(
        'ProjectTemplates',
        kind,
        error
      )

      expect(modal.props()).toMatchObject({
        isDuplicate: false,
        isError: false
      })
    }
  )

  // The upload and the removal of the studio logo share one error, which
  // only the logo modal shows.
  describe('Settings', () => {
    const mountSettings = async failAction => {
      const store = createStore({
        getters: {
          organisation: () => ({
            id: 'org-1',
            name: 'Studio',
            has_avatar: true
          }),
          organisationLogoPath: () => ''
        }
      })
      store.dispatch = vi.fn(action =>
        ['deleteOrganisationLogo', 'uploadOrganisationLogo'].includes(action)
          ? failAction()
          : Promise.resolve()
      )
      const wrapper = shallowMount(Settings, {
        global: { plugins: [store, router] }
      })
      await flushPromises()
      return wrapper
    }

    const openLogoModal = async wrapper => {
      await wrapper.findAll('button.link-button')[0].trigger('click')
      return wrapper.findComponent(ChangeAvatarModal)
    }

    test('opens the logo modal without the error of an upload failed after Cancel', async () => {
      let fail
      const wrapper = await mountSettings(
        () =>
          new Promise((resolve, reject) => {
            fail = reject
          })
      )
      const modal = await openLogoModal(wrapper)
      modal.vm.$emit('confirm', new FormData())
      await modal.vm.$emit('cancel')
      const error = new Error('Bad Request')
      fail(error)
      await flushPromises()
      expect(console.error).toHaveBeenCalledWith(error)

      await openLogoModal(wrapper)

      expect(modal.props()).toMatchObject({ active: true, isError: false })
    })

    test('opens the logo modal without the error of a failed removal', async () => {
      const error = new Error('Bad Request')
      const wrapper = await mountSettings(() => Promise.reject(error))
      await wrapper.find('button.link-button.muted').trigger('click')
      await flushPromises()
      expect(console.error).toHaveBeenCalledWith(error)

      const modal = await openLogoModal(wrapper)

      expect(modal.props()).toMatchObject({ active: true, isError: false })
    })
  })
})
