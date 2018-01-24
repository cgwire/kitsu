import { expect } from 'chai'
import helpers from './helpers'
import peopleApi from '../../src/store/api/people'
import store from '../../src/store'
import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAIL,

  USER_SAVE_PROFILE_LOADING,
  USER_SAVE_PROFILE_SUCCESS,
  USER_SAVE_PROFILE_ERROR,

  USER_CHANGE_PASSWORD_LOADING,
  USER_CHANGE_PASSWORD_SUCCESS,
  USER_CHANGE_PASSWORD_ERROR,
  USER_CHANGE_PASSWORD_UNVALID,

  USER_LOAD_TODOS_END,
  SET_TODOS_SEARCH
} from '../../src/store/mutation-types'

const user = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@doe.fr'
}
let tasks = null

peopleApi.updatePerson = (form, callback) => {
  if (form === undefined) {
    return callback(new Error('Server error'))
  } else {
    return callback()
  }
}

peopleApi.changePassword = (form, callback) => {
  if (form.old_password === 'wrongPassword') {
    return callback(new Error('Wrong password'))
  } else {
    return callback()
  }
}

peopleApi.loadTodos = (callback) => {
  return callback(null, tasks)
}


describe('user', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    tasks = [
      {
        project_name: 'Agent327',
        task_type_name: 'Modeling',
        entity_name: 'Tree',
        entity_type_name: 'Props',
        entity_id: 'asset-1',
        task_status_short_name: 'wip',
        last_comment: {},
        id: 'task-1'
      },
      {
        project_name: 'Agent327',
        task_type_name: 'Setup',
        entity_name: 'Tree',
        entity_type_name: 'Props',
        entity_id: 'asset-1',
        task_status_short_name: 'todo',
        last_comment: {
          text: "last comment",
          person_id: "person-1"
        },
        id: 'task-2'
      }
    ]
  })

  describe('actions', () => {
    it('saveProfile', (done) => {
      store.commit(USER_LOGIN, user)
      helpers.runAction('saveProfile', {
        form: {
          phone: '01 02 03 04'
        },
        callback: () => {
          expect(store._vm.isSaveProfileLoading).to.not.be.ok
          expect(store._vm.isSaveProfileLoadingError).to.not.be.ok
          expect(store._vm.user.phone).to.equal("01 02 03 04")
          done()
        }
      })
      expect(store._vm.isSaveProfileLoading).to.be.ok
      expect(store._vm.isSaveProfileLoadingError).to.not.be.ok
    })

    it('saveProfile (fail)', (done) => {
      store.commit(USER_LOGIN, user)
      helpers.runAction('saveProfile', {
        callback: () => {
          expect(store._vm.isSaveProfileLoading).to.not.be.ok
          expect(store._vm.isSaveProfileLoadingError).to.be.ok
          done()
        }
      })
      expect(store._vm.isSaveProfileLoading).to.be.ok
      expect(store._vm.isSaveProfileLoadingError).to.not.be.ok
    })


    it('changePasswordValidityAndSave (password unvalid)', (done) => {
      helpers.runAction('changeUserPassword', {
        form: {
          old_password: 'oldPassword',
          password: 'newPassword',
          password_2: 'newPassword'
        },
        callback: done
      })
          expect(store._vm.isSaveProfileLoading).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.not.be.ok
    })

    it('changePasswordValidityAndSave (password valid)', (done) => {
      helpers.runAction('changeUserPassword', {
        form: {
          old_password: 'oldPassword',
          password: 'newPassword',
          password_2: 'newPassword'
        },
        callback: () => {
          expect(store._vm.changePassword.isLoading).to.not.be.ok
          expect(store._vm.changePassword.isSuccess).to.be.ok
          expect(store._vm.changePassword.isValid).to.be.ok
          done()
        }
      })
      expect(store._vm.changePassword.isLoading).to.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })

    it('changeUserPassword', (done) => {
      helpers.runAction('changeUserPassword', {
        form: {
          old_password: 'oldPassword',
          password: 'newPassword',
          password_2: 'newPassword'
        },
        callback: () => {
          expect(store._vm.changePassword.isLoading).to.not.be.ok
          expect(store._vm.changePassword.isError).to.not.be.ok
          expect(store._vm.changePassword.isSuccess).to.be.ok
          expect(store._vm.changePassword.isValid).to.be.ok
          done()
        }
      })
      expect(store._vm.changePassword.isLoading).to.be.ok
      expect(store._vm.changePassword.isError).to.not.be.ok
      expect(store._vm.changePassword.isSuccess).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })

    it('changeUserPassword (fail)', (done) => {
      helpers.runAction('changeUserPassword', {
        form: {
          old_password: 'wrongPassword',
          password: 'newPassword',
          password_2: 'newPassword'
        },
        callback: () => {
          expect(store._vm.changePassword.isLoading).to.not.be.ok
          expect(store._vm.changePassword.isError).to.be.ok
          expect(store._vm.changePassword.isSuccess).to.not.be.ok
          expect(store._vm.changePassword.isValid).to.be.ok
          done()
        }
      })
      expect(store._vm.changePassword.isLoading).to.be.ok
      expect(store._vm.changePassword.isError).to.not.be.ok
      expect(store._vm.changePassword.isSuccess).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })

    it('loadTodos', (done) => {
      helpers.runAction('loadTodos', {
        personId: 'person-1',
        callback: (err) => {
          expect(store._vm.displayedTodos).to.deep.equal(tasks)
          expect(
            store._vm.displayedTodos[0].full_entity_name
          ).to.equal('Props / Tree')
          done()
        }
      })
    })

    it('setTodosSearch', () => {
      store.commit(USER_LOAD_TODOS_END, tasks)
      helpers.runAction('setTodosSearch', 'wip')

      expect(store._vm.todosSearchText).to.equal('wip')
      expect(store._vm.displayedTodos[0]).to.deep.equal(tasks[0])
      expect(store._vm.displayedTodos.length).to.equal(1)

      helpers.runAction('setTodosSearch', '')
    })
  })

  describe('mutations', () => {
    it('USER_LOGIN', () => {
      store.commit(USER_LOGIN, user)
      expect(store._vm.user.first_name).to.equal('John')
      expect(store._vm.isAuthenticated).to.be.ok
    })
    it('USER_LOGOUT', () => {
      store.commit(USER_LOGOUT)
      expect(store._vm.user).to.be.null
      expect(store._vm.isAuthenticated).to.not.be.ok
    })
    it('USER_LOGIN_FAIL', () => {
      store.commit(USER_LOGIN_FAIL)
      expect(store._vm.user).to.be.null
      expect(store._vm.isAuthenticated).to.not.be.ok
    })

    it('USER_SAVE_PROFILE_LOADING', () => {
      store.commit(USER_SAVE_PROFILE_LOADING)
      expect(store._vm.isSaveProfileLoading).to.be.ok
      expect(store._vm.isSaveProfileLoadingError).to.not.be.ok
    })
    it('USER_SAVE_PROFILE_ERROR', () => {
      store.commit(USER_SAVE_PROFILE_ERROR)
      expect(store._vm.isSaveProfileLoading).to.not.be.ok
      expect(store._vm.isSaveProfileLoadingError).to.be.ok
    })
    it('USER_SAVE_PROFILE_SUCCESS', () => {
      store.commit(USER_LOGIN, user)
      store.commit(USER_SAVE_PROFILE_SUCCESS, {phone: "01 02 03 04"})
      expect(store._vm.isSaveProfileLoading).to.not.be.ok
      expect(store._vm.isSaveProfileLoadingError).to.not.be.ok
      expect(store._vm.user.phone).to.equal("01 02 03 04")
    })

    it('USER_CHANGE_PASSWORD_LOADING', () => {
      store.commit(USER_CHANGE_PASSWORD_LOADING)
      expect(store._vm.changePassword.isLoading).to.be.ok
      expect(store._vm.changePassword.isError).to.not.be.ok
      expect(store._vm.changePassword.isSuccess).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })
    it('USER_CHANGE_PASSWORD_ERROR', () => {
      store.commit(USER_CHANGE_PASSWORD_ERROR)
      expect(store._vm.changePassword.isLoading).to.not.be.ok
      expect(store._vm.changePassword.isError).to.be.ok
      expect(store._vm.changePassword.isSuccess).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })
    it('USER_CHANGE_PASSWORD_SUCCESS', () => {
      store.commit(USER_CHANGE_PASSWORD_SUCCESS)
      expect(store._vm.changePassword.isLoading).to.not.be.ok
      expect(store._vm.changePassword.isError).to.not.be.ok
      expect(store._vm.changePassword.isSuccess).to.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })
    it('USER_CHANGE_PASSWORD_UNVALID', () => {
      store.commit(USER_CHANGE_PASSWORD_UNVALID)
      expect(store._vm.changePassword.isLoading).to.not.be.ok
      expect(store._vm.changePassword.isError).to.not.be.ok
      expect(store._vm.changePassword.isSuccess).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.not.be.ok
    })

    it('USER_LOAD_TODOS_END', () => {
      store.commit(USER_LOAD_TODOS_END, tasks)
      expect(store._vm.displayedTodos).to.deep.equal(tasks)
      expect(store._vm.displayedTodos).to.deep.equal(tasks)
      expect(
        store._vm.displayedTodos[0].full_entity_name
      ).to.equal('Props / Tree')
    })

    it('SET_TODOS_SEARCH', () => {
      store.commit(USER_LOAD_TODOS_END, tasks)
      store.commit(SET_TODOS_SEARCH, 'wip')

      expect(store._vm.todosSearchText).to.equal('wip')
      expect(store._vm.displayedTodos[0]).to.deep.equal(tasks[0])
      expect(store._vm.displayedTodos.length).to.equal(1)
    })
  })
})
