import { describe, expect, it, vi } from 'vitest'

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import People from '@/components/pages/People.vue'

const {
  cancelSelfRoleDowngrade,
  confirmEditPeople,
  confirmSelfRoleDowngrade,
  isSelfRoleDowngrade
} = People.methods

const currentUser = { id: 'person-1', role: 'admin' }

const buildContext = (personToEdit, overrides = {}) => ({
  isSelfRoleDowngrade,
  modals: { selfRoleDowngrade: false },
  pendingEditForm: null,
  personToEdit,
  saveEditedPerson: vi.fn(),
  user: currentUser,
  ...overrides
})

describe('People page', () => {
  describe('confirmEditPeople', () => {
    it('asks for a confirmation when the admin lowers their own role', () => {
      const context = buildContext(currentUser)
      const form = { id: currentUser.id, role: 'user' }
      confirmEditPeople.call(context, form)
      expect(context.modals.selfRoleDowngrade).toBe(true)
      expect(context.pendingEditForm).toBe(form)
      expect(context.saveEditedPerson).not.toHaveBeenCalled()
    })

    it('saves right away when the admin keeps their own role', () => {
      const context = buildContext(currentUser)
      const form = { id: currentUser.id, role: 'admin' }
      confirmEditPeople.call(context, form)
      expect(context.modals.selfRoleDowngrade).toBe(false)
      expect(context.saveEditedPerson).toHaveBeenCalledWith(form)
    })

    it('saves right away when another user is demoted', () => {
      const context = buildContext({ id: 'person-2', role: 'admin' })
      const form = { id: 'person-2', role: 'user' }
      confirmEditPeople.call(context, form)
      expect(context.modals.selfRoleDowngrade).toBe(false)
      expect(context.saveEditedPerson).toHaveBeenCalledWith(form)
    })

    // A new person has no id yet, which must not match a missing user id.
    it('saves right away when a person is created', () => {
      const context = buildContext({ role: 'user' }, { user: null })
      const form = { role: 'user' }
      confirmEditPeople.call(context, form)
      expect(context.modals.selfRoleDowngrade).toBe(false)
      expect(context.saveEditedPerson).toHaveBeenCalledWith(form)
    })
  })

  describe('confirmSelfRoleDowngrade', () => {
    it('saves the pending form and closes the confirmation', () => {
      const form = { id: currentUser.id, role: 'user' }
      const context = buildContext(currentUser, {
        modals: { selfRoleDowngrade: true },
        pendingEditForm: form
      })
      confirmSelfRoleDowngrade.call(context)
      expect(context.saveEditedPerson).toHaveBeenCalledWith(form)
      expect(context.modals.selfRoleDowngrade).toBe(false)
      expect(context.pendingEditForm).toBeNull()
    })
  })

  describe('cancelSelfRoleDowngrade', () => {
    it('drops the pending form without saving it', () => {
      const context = buildContext(currentUser, {
        modals: { selfRoleDowngrade: true },
        pendingEditForm: { id: currentUser.id, role: 'user' }
      })
      cancelSelfRoleDowngrade.call(context)
      expect(context.saveEditedPerson).not.toHaveBeenCalled()
      expect(context.modals.selfRoleDowngrade).toBe(false)
      expect(context.pendingEditForm).toBeNull()
    })
  })

  describe('selfRoleDowngradeText', () => {
    const $t = (key, params) =>
      params ? `${key}(${params.currentRole}->${params.newRole})` : key

    it('names both the current and the new role', () => {
      const context = {
        $t,
        personToEdit: currentUser,
        pendingEditForm: { role: 'user' }
      }
      expect(People.computed.selfRoleDowngradeText.call(context)).toBe(
        'people.self_role_downgrade_confirm(people.role.admin->people.role.user)'
      )
    })

    it('stays empty while no downgrade is pending', () => {
      const context = { $t, personToEdit: currentUser, pendingEditForm: null }
      expect(People.computed.selfRoleDowngradeText.call(context)).toBe('')
    })
  })
})
