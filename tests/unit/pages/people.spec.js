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
  useRouter: () => ({ push: vi.fn() })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import PeopleList from '@/components/lists/PeopleList.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import EditPersonModal from '@/components/modals/EditPersonModal.vue'
import People from '@/components/pages/People.vue'

const currentUser = { id: 'person-1', role: 'admin' }

const mountPage = async ({ user = currentUser } = {}) => {
  routeHolder.route = reactive({ params: {}, query: {} })
  const resolved = () => vi.fn(() => Promise.resolve())
  const actions = {
    editPerson: resolved(),
    loadGuests: resolved(),
    loadPeople: resolved(),
    newPerson: resolved(),
    setPeopleSearch: vi.fn()
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
      isImportPeopleLoadingError: () => false,
      isPeopleLoading: () => false,
      isPeopleLoadingError: () => false,
      mainConfig: () => ({ is_self_hosted: true }),
      peopleSearchQueries: () => [],
      personCsvFormData: () => null,
      studioMap: () => new Map(),
      user: () => user,
      userLimit: () => 10
    },
    actions
  })
  const wrapper = shallowMount(People, {
    global: {
      plugins: [store],
      mocks: { $t: translate },
      // The page drives its search field through a ref.
      stubs: {
        SearchField: {
          name: 'SearchField',
          template: '<div />',
          methods: { getValue: () => '', setValue: () => {} }
        }
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
})
