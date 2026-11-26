import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { createStore } from 'vuex'

// Keys with their roles: the downgrade text names both of them.
const translate = vi.hoisted(
  () => (key, params) =>
    params?.newRole ? `${key}(${params.currentRole}->${params.newRole})` : key
)
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: translate })
}))
const routeHolder = vi.hoisted(() => ({ route: null }))
vi.mock('vue-router', () => ({
  useRoute: () => routeHolder.route,
  // The route follows the pushes of the page, as the router would.
  useRouter: () => ({
    push: location => {
      routeHolder.route.query = location.query
    }
  })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import PeopleList from '@/components/lists/PeopleList.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import EditPersonModal from '@/components/modals/EditPersonModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import People from '@/components/pages/People.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'

import {
  BrokenFileReader,
  GoneFileReader,
  TextFileReader
} from '../fixtures/file-reader'
import { buildSearchQueryListStub } from '../fixtures/search-query-list'

const currentUser = { id: 'person-1', role: 'admin' }

const mountPage = async ({
  user = currentUser,
  query = {},
  getters = {},
  stubs = {}
} = {}) => {
  routeHolder.route = reactive({ params: {}, query })
  const resolved = () => vi.fn(() => Promise.resolve())
  const actions = {
    deletePeople: resolved(),
    editPerson: resolved(),
    getResetPasswordLink: resolved(),
    invitePerson: resolved(),
    loadGuests: resolved(),
    loadPeople: resolved(),
    newPerson: resolved(),
    setPeopleSearch: vi.fn(),
    uploadPersonFile: resolved()
  }
  const store = createStore({
    getters: {
      activePeopleWithoutBot: () => [],
      displayedPeople: () => [],
      guests: () => [],
      isCurrentUserAdmin: () => true,
      isGuestsLoaded: () => false,
      isGuestsLoading: () => false,
      isGuestsLoadingError: () => false,
      isImportPeopleLoading: () => false,
      isPeopleLoading: () => false,
      isPeopleLoadingError: () => false,
      mainConfig: () => ({ is_self_hosted: true }),
      peopleSearchQueries: () => [],
      personCsvFormData: () => null,
      studioMap: () => new Map(),
      user: () => user,
      userLimit: () => 10,
      ...getters
    },
    actions,
    mutations: { PERSON_CSV_FILE_SELECTED: () => {} }
  })
  const wrapper = shallowMount(People, {
    global: {
      plugins: [store],
      mocks: { $t: translate },
      // The page drives its search field through a ref.
      stubs: {
        SearchField: {
          name: 'SearchField',
          props: { canSave: { type: Boolean, default: false } },
          template: '<div />',
          methods: { getValue: () => '', setValue: () => {} }
        },
        ...stubs
      }
    }
  })
  await flushPromises()

  // Opens the edit modal on a person and submits the form.
  const submitEdit = async (person, form) => {
    await wrapper.findComponent(PeopleList).vm.$emit('edit-clicked', person)
    await wrapper.findComponent(EditPersonModal).vm.$emit('confirm', form)
    await flushPromises()
  }
  const downgradeModal = () => wrapper.findComponent(ConfirmModal)
  const payloadOf = action => action.mock.calls.at(-1)[1]
  return { wrapper, actions, submitEdit, downgradeModal, payloadOf }
}

describe('People page', () => {
  describe('saved searches', () => {
    const searchField = wrapper =>
      wrapper.findComponent({ name: 'SearchField' })

    it('opens the search filter modal on Save', async () => {
      const SearchQueryList = buildSearchQueryListStub()
      const { wrapper } = await mountPage({ stubs: { SearchQueryList } })

      searchField(wrapper).vm.$emit('save', 'ada')

      expect(SearchQueryList.methods.addSearch).toHaveBeenCalledWith('ada')
      wrapper.unmount()
    })

    // The list that opens the modal shows once the people are loaded.
    it('offers the Save button once the people are loaded', async () => {
      const loading = await mountPage({
        getters: { isPeopleLoading: () => true }
      })
      const loaded = await mountPage()

      expect(searchField(loading.wrapper).props('canSave')).toBe(false)
      expect(searchField(loaded.wrapper).props('canSave')).toBe(true)
      loading.wrapper.unmount()
      loaded.wrapper.unmount()
    })
  })

  describe('edit confirmation', () => {
    it('asks for a confirmation when the admin lowers their own role', async () => {
      const { actions, submitEdit, downgradeModal } = await mountPage()

      await submitEdit(currentUser, { role: 'user' })

      expect(downgradeModal().exists()).toBe(true)
      expect(actions.editPerson).not.toHaveBeenCalled()
    })

    it('saves right away when the admin keeps their own role', async () => {
      const { actions, submitEdit, downgradeModal, payloadOf } =
        await mountPage()

      await submitEdit(currentUser, { role: 'admin' })

      expect(downgradeModal().exists()).toBe(false)
      expect(payloadOf(actions.editPerson)).toEqual({
        id: currentUser.id,
        role: 'admin'
      })
    })

    it('saves right away when another user is demoted', async () => {
      const { actions, submitEdit, downgradeModal, payloadOf } =
        await mountPage()

      await submitEdit({ id: 'person-2', role: 'admin' }, { role: 'user' })

      expect(downgradeModal().exists()).toBe(false)
      expect(payloadOf(actions.editPerson)).toEqual({
        id: 'person-2',
        role: 'user'
      })
    })

    // A new person has no id yet, which must not match a missing user id.
    it('saves right away when a person is created', async () => {
      const { actions, submitEdit, downgradeModal, payloadOf } =
        await mountPage({ user: null })

      await submitEdit({ role: 'user' }, { role: 'user' })

      expect(downgradeModal().exists()).toBe(false)
      expect(payloadOf(actions.newPerson)).toEqual({ role: 'user' })
    })
  })

  describe('save errors', () => {
    afterEach(() => vi.restoreAllMocks())

    // Where the instance checks deliverability, Zou refuses a dotless
    // domain with a message that does not say "domain name".
    it('flags the email domain when Zou refuses a dotless domain', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { wrapper, actions, submitEdit } = await mountPage()
      actions.editPerson.mockRejectedValueOnce({
        body: {
          message:
            'The part after the @-sign is not valid. It should have a period.'
        }
      })

      await submitEdit({ id: 'person-2', role: 'user' }, { role: 'user' })

      const modal = wrapper.findComponent(EditPersonModal)
      expect(modal.props('isEmailDomainError')).toBe(true)
      expect(modal.props('isError')).toBe(false)
    })
  })

  describe('deletion', () => {
    afterEach(() => vi.restoreAllMocks())

    // Regression: a deletion failing after Cancel showed its error on the
    // next opening, for another person.
    it('opens without the error of a deletion failed after Cancel', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const { wrapper, actions } = await mountPage()
      let fail
      actions.deletePeople.mockImplementationOnce(
        () =>
          new Promise((resolve, reject) => {
            fail = reject
          })
      )
      const list = wrapper.findComponent(PeopleList)
      const modal = () => wrapper.findComponent(HardDeleteModal)
      await list.vm.$emit('delete-clicked', { id: 'person-2' })
      await modal().vm.$emit('confirm')
      await modal().vm.$emit('cancel')
      const error = new Error('Bad Request')
      fail(error)
      await flushPromises()
      expect(consoleError).toHaveBeenCalledWith(error)

      await list.vm.$emit('delete-clicked', { id: 'person-3' })

      expect(modal().props('isError')).toBe(false)
    })
  })

  describe('invitation link', () => {
    afterEach(() => vi.restoreAllMocks())

    const person = { id: 'person-2', role: 'admin', email: 'ada@studio.com' }
    // Zou's only 400 on this route: another admin who has a password, or a
    // protected account.
    const refusal = {
      status: 400,
      body: { message: "An admin can't change another admin's password." }
    }

    const openPersonModal = async () => {
      const page = await mountPage()
      await page.wrapper
        .findComponent(PeopleList)
        .vm.$emit('edit-clicked', person)
      const modal = () => page.wrapper.findComponent(EditPersonModal)
      const click = async event => {
        await modal().vm.$emit(event, { ...person })
        await flushPromises()
      }
      return { ...page, modal, click }
    }

    it('says why Zou refuses the link', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { actions, modal, click } = await openPersonModal()
      actions.getResetPasswordLink.mockRejectedValueOnce(refusal)

      await click('copy-invite-link')

      expect(modal().props('isInviteLinkRefused')).toBe(true)
      expect(modal().props('isInviteLinkError')).toBe(false)
      expect(console.error).toHaveBeenCalledWith(refusal)
    })

    it('keeps the generic error for any other failure', async () => {
      const failure = { status: 500, body: '' }
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { actions, modal, click } = await openPersonModal()
      actions.getResetPasswordLink.mockRejectedValueOnce(failure)

      await click('copy-invite-link')

      expect(modal().props('isInviteLinkError')).toBe(true)
      expect(modal().props('isInviteLinkRefused')).toBe(false)
      expect(console.error).toHaveBeenCalledWith(failure)
    })

    // The refusal points to the invitation: sending it answers the refusal.
    it('clears the refusal once the invitation is sent', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { actions, modal, click } = await openPersonModal()
      actions.getResetPasswordLink.mockRejectedValueOnce(refusal)
      await click('copy-invite-link')

      await click('invite')

      expect(actions.invitePerson).toHaveBeenCalled()
      expect(modal().props('isInvitationSuccess')).toBe(true)
      expect(modal().props('isInviteLinkRefused')).toBe(false)
      expect(console.error).toHaveBeenCalledWith(refusal)
    })

    // A failed invitation left its error next to the refusal, which then
    // pointed to the email that had just failed.
    it('clears the invitation error once the link is asked', async () => {
      const failure = { status: 500, body: '' }
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { actions, modal, click } = await openPersonModal()
      actions.invitePerson.mockRejectedValueOnce(failure)
      await click('invite')
      expect(modal().props('isInvitationError')).toBe(true)
      actions.getResetPasswordLink.mockRejectedValueOnce(refusal)

      await click('copy-invite-link')

      expect(modal().props('isInvitationError')).toBe(false)
      expect(modal().props('isInviteLinkRefused')).toBe(true)
      expect(console.error).toHaveBeenCalledWith(failure)
      expect(console.error).toHaveBeenCalledWith(refusal)
    })
  })

  describe('self role downgrade', () => {
    it('names both the current and the new role', async () => {
      const { submitEdit, downgradeModal } = await mountPage()

      await submitEdit(currentUser, { role: 'user' })

      expect(downgradeModal().props('text')).toBe(
        'people.self_role_downgrade_confirm(people.role.admin->people.role.user)'
      )
    })

    it('saves the pending form and closes the confirmation', async () => {
      const { actions, submitEdit, downgradeModal, payloadOf } =
        await mountPage()
      await submitEdit(currentUser, { role: 'user' })

      await downgradeModal().vm.$emit('confirm')
      await flushPromises()

      expect(payloadOf(actions.editPerson)).toEqual({
        id: currentUser.id,
        role: 'user'
      })
      expect(downgradeModal().exists()).toBe(false)
    })

    it('drops the pending form without saving it', async () => {
      const { actions, submitEdit, downgradeModal } = await mountPage()
      await submitEdit(currentUser, { role: 'user' })

      await downgradeModal().vm.$emit('cancel')
      await flushPromises()

      expect(actions.editPerson).not.toHaveBeenCalled()
      expect(downgradeModal().exists()).toBe(false)
    })
  })

  describe('toolbar filters', () => {
    // The filters rewrite the query of the URL: they used to drop its tab,
    // which sent the page back to the active people.
    it('keeps the unset filters out of the URL', async () => {
      const { wrapper } = await mountPage()
      const pickRole = async role => {
        await wrapper
          .findComponent(ComboboxStyled)
          .vm.$emit('update:modelValue', role)
        await flushPromises()
      }

      await pickRole('user')
      expect(routeHolder.route.query).toEqual({ role: 'user' })

      await pickRole('all')
      expect(routeHolder.route.query).toEqual({})
    })

    it('stays on the guests tab when a filter applies', async () => {
      const { wrapper } = await mountPage({
        query: { tab: 'guests', role: 'client' }
      })
      const list = () => wrapper.findComponent(PeopleList)
      expect(list().props('isGuests')).toBe(true)

      await wrapper
        .findComponent(ComboboxStyled)
        .vm.$emit('update:modelValue', 'user')
      await flushPromises()

      expect(list().props('isGuests')).toBe(true)
      expect(routeHolder.route.query).toMatchObject({
        tab: 'guests',
        role: 'user'
      })
    })
  })

  describe('CSV import', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    })

    const buildFormData = () => {
      const formData = new FormData()
      formData.append('file', new File(['First Name;Last Name'], 'import.csv'))
      return formData
    }

    const clickImport = wrapper =>
      wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'import')
        .vm.$emit('click')

    const openImportModal = async options => {
      const { wrapper, actions } = await mountPage(options)
      await clickImport(wrapper)
      return {
        wrapper,
        actions,
        importModal: () => wrapper.findComponent(ImportModal)
      }
    }

    // The import modal reads the file, then gives way to its preview.
    const previewFile = async (wrapper, importModal) => {
      vi.stubGlobal('FileReader', TextFileReader)
      await importModal().vm.$emit('confirm', buildFormData(), 'file')
      await flushPromises()
      return wrapper.findComponent(ImportRenderModal)
    }

    const entries = [
      ['First Name', 'Last Name'],
      ['Ada', 'Lovelace']
    ]

    it('keeps the import modal open on an error when the CSV cannot be read', async () => {
      vi.stubGlobal('FileReader', GoneFileReader)
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { importModal } = await openImportModal()
      expect(importModal().props('isError')).toBe(false)

      await importModal().vm.$emit('confirm', buildFormData(), 'file')
      await flushPromises()

      expect(importModal().props('isError')).toBe(true)
    })

    it('shows the error of a failed upload in its preview', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const { wrapper, actions, importModal } = await openImportModal()
      const error = new Error('Bad Request')
      actions.uploadPersonFile.mockRejectedValueOnce(error)
      const preview = await previewFile(wrapper, importModal)

      await preview.vm.$emit('confirm', entries, false)
      await flushPromises()

      expect(preview.props()).toMatchObject({
        isError: true,
        importError: error
      })
      expect(consoleError).toHaveBeenCalledWith(error)
    })

    // Regression: the preview of the next file showed the error of the
    // last failed upload, one failing after Cancel included. The import
    // modal only says that a file could not be read.
    it('opens the next preview without the error of an upload failed after Cancel', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const { wrapper, actions, importModal } = await openImportModal()
      let fail
      actions.uploadPersonFile.mockImplementationOnce(
        () =>
          new Promise((resolve, reject) => {
            fail = reject
          })
      )
      const preview = await previewFile(wrapper, importModal)
      await preview.vm.$emit('confirm', entries, false)
      await preview.vm.$emit('cancel')
      const error = new Error('Bad Request')
      fail(error)
      await flushPromises()
      expect(consoleError).toHaveBeenCalledWith(error)

      await clickImport(wrapper)
      expect(importModal().props('isError')).toBe(false)
      const nextPreview = await previewFile(wrapper, importModal)

      expect(nextPreview.props()).toMatchObject({
        isError: false,
        importError: null
      })
    })

    it('shows the error of a bug, left to the error handler', async () => {
      vi.stubGlobal('FileReader', BrokenFileReader)
      const { wrapper, importModal } = await openImportModal()
      const errorHandler = vi.fn()
      wrapper.vm.$.appContext.config.errorHandler = errorHandler

      await importModal().vm.$emit('confirm', buildFormData(), 'file')
      await flushPromises()

      expect(importModal().props('isError')).toBe(true)
      expect(errorHandler).toHaveBeenCalledWith(
        expect.any(TypeError),
        expect.anything(),
        expect.anything()
      )
    })
  })
})
