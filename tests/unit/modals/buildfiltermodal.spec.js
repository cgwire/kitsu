import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import i18n from '../../../src/lib/i18n'
import BuildFilterModal from '../../../src/components/modals/BuildFilterModal'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)
const router = new VueRouter()


describe('BuildFilterModal', () => {
  let store, assetStore, peopleStore, productionStore, shotStore, taskStore
  let wrapper
  let getters

  beforeEach(() => {
    assetStore = {
      state: {
        assetSearchText: ''
      },
      getters: {
        assetMetadataDescriptors: () => [
          {
            id: 'descriptor-1', name: 'Difficulty', choices: ['easy', 'hard']
          },
          { id: 'descriptor-2', name: 'Size' },
        ],
        assetSearchText: (state) => state.assetSearchText,
        assetValidationColumns: () => ['task-type-1', 'task-type-2'],
      },
      mutations: {
        'CHANGE_SEARCH': (state, query) => state.assetSearchText = query
      },
      actions: {
        changeSearch ({ commit, state }, query) {
          commit('CHANGE_SEARCH', query)
        }
      }
    }
    shotStore = {
      getters: {
        shotMetadataDescriptors: () => [
          { id: 'descriptor-3', name: 'Style' },
          { id: 'descriptor-4', name: 'Length' },
        ],
        shotSearchText: () => '',
        shotValidationColumns: () => ['task-type-3', 'task-type-4']
      },
      actions: {}
    }
    productionStore = {
      getters: {
        currentProduction: () => ({
          id: 'production-1',
          name: 'Caminandes',
          team: ['person-2', 'person-3']
        })
      },
      actions: {}
    }
    peopleStore = {
      getters: {
        people: () => [
          { id: 'person-1', name: 'John' },
          { id: 'person-2', name: 'James' },
          { id: 'person-3', name: 'Ema' }
        ],
        personMap: () => ({
          'person-1': { id: 'person-1', name: 'John' },
          'person-2': { id: 'person-2', name: 'James' },
          'person-3': { id: 'person-3', name: 'Ema' }
        })
      },
      actions: {}
    }
    taskStore = {
      getters: {
        taskTypes: () => [
          { id: 'task-type-1', name: 'Modeling' },
          { id: 'task-type-2', name: 'Rigging' },
          { id: 'task-type-3', name: 'Layout' },
          { id: 'task-type-4', name: 'Animation' }
        ],
        taskStatus: () => [
          { id: 'task-status-1', short_name: 'WFA' },
          { id: 'task-status-2', short_name: 'WIP' },
          { id: 'task-status-3', short_name: 'Retake' }
        ],
        taskTypeMap: () => ({
          'task-type-1': { id: 'task-type-1', name: 'Modeling' },
          'task-type-2': { id: 'task-type-2', name: 'Rigging' },
          'task-type-3': { id: 'task-type-3', name: 'Layout' },
          'task-type-4': { id: 'task-type-4', name: 'Animation' }
        }),
        taskStatusMap: () => ({
          'task-status-1': { id: 'task-status-1', short_name: 'WFA' },
          'task-status-2': { id: 'task-status-2', short_name: 'WIP' },
          'task-status-3': { id: 'task-status-3', short_name: 'Retake' },
        })
      },
      actions: {}
    }
    store = new Vuex.Store({
      strict: true,
      modules: {
        assets: assetStore,
        productions: productionStore,
        people: peopleStore,
        shots: shotStore,
        tasks: taskStore
      }
    })

    wrapper = shallowMount(BuildFilterModal, {
      store,
      getters,
      localVue,
      i18n,
      router,
      propsData: {
        entityType: 'asset'
      }
    })
  })

  describe('UI', () => {
    it('mount succeeds', () => {
      const modal = wrapper.find(BuildFilterModal)
    })
    describe('mount with query', () => {
      it('task types', done => {
        expect(wrapper.contains('.task-type-filter')).toBeFalsy()
        wrapper.setData({
          taskTypeFilters: {
            values: [
              {
                id: 'task-type-1' ,
                operator: '=' ,
                statusId: 'task-status-2'
              }
            ]
          }
        })
        wrapper.vm.$nextTick().then(() => {
          expect(wrapper.contains('.task-type-filter')).toBeTruthy()
          done()
        })
      })
      it('descriptors', () => {
        expect(wrapper.contains('.descriptor-filter')).toBeFalsy()
        wrapper.setData({
          taskTypeFilters: {
            values: [
              {
                id: 'descriptor-1' ,
                operator: '=' ,
                text: 'easy'
              }
            ]
          }
        })
        wrapper.vm.$nextTick().then(() => {
          expect(wrapper.contains('.descriptor-filter')).toBeTruthy()
          done()
        })
      })
    })
  })

  describe('Helpers', () => {
    describe('computed', () => {
      it('isAssets', () => {
        expect(wrapper.vm.isAssets).toBe(true)
        wrapper.setProps({ entityType: 'shot' })
        expect(wrapper.vm.isAssets).toBe(false)
      })
      it('taskTypeList', () => {
        expect(wrapper.vm.taskTypeList[0].id).toBe('task-type-1')
        wrapper.setProps({ entityType: 'shot' })
        expect(wrapper.vm.taskTypeList[0].id).toBe('task-type-3')
      })
      it('team', () => {
        expect(wrapper.vm.team[0].id).toBe('person-2')
      })
      it('descriptorOptions', () => {
        expect(wrapper.vm.descriptorOptions[0]).toStrictEqual({
          'label': 'Difficulty',
          'value': 'descriptor-1'
        })
        wrapper.setProps({ entityType: 'shot' })
        expect(wrapper.vm.descriptorOptions[0]).toStrictEqual({
          'label': 'Style',
          'value': 'descriptor-3'
        })
      })
      it('metadataDescriptors', () => {
        expect(wrapper.vm.metadataDescriptors[0].id).toBe('descriptor-1')
        wrapper.setProps({ entityType: 'shot' })
        expect(wrapper.vm.metadataDescriptors[0].id).toBe('descriptor-3')
      })
    })

    describe('methods', () => {
      it('applyFilter', () => {
          wrapper.setData({
            taskTypeFilters: {
              values: [
                {
                  id: 'task-type-1' ,
                  operator: '=' ,
                  statusId: 'task-status-2'
                }
              ]
            }
          })
          const query = wrapper.vm.applyFilter()
          expect(wrapper.emitted().confirm).toBeTruthy()
          expect(wrapper.emitted().confirm[0][0]).toBe('[Modeling]=WIP')
      })
      describe('Build filter', () => {
        describe('task types', () => {
          it('status is', () => {
            wrapper.setData({
              taskTypeFilters: {
                values: [
                  {
                    id: 'task-type-1' ,
                    operator: '=' ,
                    statusId: 'task-status-2'
                  }
                ]
              }
            })
            const query = wrapper.vm.buildFilter()
            expect(query).toBe('[Modeling]=WIP')
          })
          it('status is not', () => {
            wrapper.setData({
              taskTypeFilters: {
                values: [
                  {
                    id: 'task-type-1' ,
                    operator: '=-' ,
                    statusId: 'task-status-2'
                  }
                ]
              }
            })
            const query = wrapper.vm.buildFilter()
            expect(query).toBe('[Modeling]=-WIP')
          })
        })
        describe('descriptors', () => {
          it('descriptor is', () => {
            wrapper.setData({
              metadataDescriptorFilters: {
                values: [
                  {
                    id: 'descriptor-1' ,
                    operator: '=' ,
                    text: 'easy'
                  }
                ]
              }
            })
            const query = wrapper.vm.buildFilter()
            expect(query).toBe('[Difficulty]=easy')
          })
          it('descriptor is not', () => {
            wrapper.setData({
              metadataDescriptorFilters: {
                values: [
                  {
                    id: 'descriptor-1' ,
                    operator: '=-' ,
                    text: 'easy'
                  }
                ]
              }
            })
            const query = wrapper.vm.buildFilter()
            expect(query).toBe('[Difficulty]=-easy')
          })
        })
        describe('assignation', () => {
          it('assigned', () => {
            wrapper.setData({
              assignation: {
                value: 'assigned',
                taskTypeId: 'task-type-1'
              }
            })
            const query = wrapper.vm.buildFilter()
            expect(query).toBe('[Modeling]=assigned')
          })
          it('unassigned', () => {
            wrapper.setData({
              assignation: {
                value: 'unassigned',
                taskTypeId: 'task-type-1'
              }
            })
            const query = wrapper.vm.buildFilter()
            expect(query).toBe('[Modeling]=unassigned')
          })
          it('assigned to', () => {
            wrapper.setData({
              assignation: {
                value: 'assignedto',
                person: {id: 'person-1', name: 'John'}
              }
            })
            const query = wrapper.vm.buildFilter()
            expect(query).toBe('assignedto=[John]')
          })
          it('not assigned to', () => {
            wrapper.setData({
              assignation: {
                value: '-assignedto',
                person: {id: 'person-1', name: 'John'}
              }
            })
            const query = wrapper.vm.buildFilter()
            expect(query).toBe('assignedto=[-John]')
          })
        })
        describe('thumbnail', () => {
          it('with', () => {
            wrapper.setData({
              hasThumbnail: {
                value: 'withthumbnail'
              }
            })
            const query = wrapper.vm.buildFilter()
            expect(query).toBe('withthumbnail')
          })
          it('without', () => {
            wrapper.setData({
              hasThumbnail: {
                value: '-withthumbnail'
              }
            })
            const query = wrapper.vm.buildFilter()
            expect(query).toBe('-withthumbnail')
          })
        })
      })

      describe('Set values from query', () => {
        const changeSearch = (query) => {
          assetStore.actions.changeSearch({
            commit: store.commit,
            state: store.state
          }, query)
        }

        describe('task types', () => {
          it('status is', () => {
            changeSearch('Modeling=WIP')
            wrapper.vm.setFiltersFromCurrentQuery()
            expect(wrapper.vm.taskTypeFilters.values).toStrictEqual([
              {
                id: 'task-type-1' ,
                operator: '=' ,
                statusId: 'task-status-2'
              }
            ])
          })
          it('status is not', () => {
            changeSearch('Modeling=WIP')
            wrapper.vm.setFiltersFromCurrentQuery()
            expect(wrapper.vm.taskTypeFilters.values).toStrictEqual([
              {
                id: 'task-type-1' ,
                operator: '=' ,
                statusId: 'task-status-2'
              }
            ])
          })
        })
        describe('descriptors', () => {
          it('descriptor is', () => {
            changeSearch('Difficulty=easy')
            wrapper.vm.setFiltersFromCurrentQuery()
            expect(wrapper.vm.metadataDescriptorFilters.values).toStrictEqual([
              {
                id: 'descriptor-1' ,
                operator: '=' ,
                text: 'easy'
              }
            ])
          })
          it('descriptor is not', () => {
            changeSearch('Difficulty=-easy')
            wrapper.vm.setFiltersFromCurrentQuery()
            expect(wrapper.vm.metadataDescriptorFilters.values).toStrictEqual([
              {
                id: 'descriptor-1' ,
                operator: '=-' ,
                text: 'easy'
              }
            ])
          })
        })
        describe('assignation', () => {
          it('assigned', () => {
            changeSearch('[Modeling]=assigned')
            wrapper.vm.setFiltersFromCurrentQuery()
            expect(wrapper.vm.assignation.value).toBe('assigned')
            expect(wrapper.vm.assignation.taskTypeId).toBe('task-type-1')
          })
          it('unassigned', () => {
            changeSearch('[Modeling]=unassigned')
            wrapper.vm.setFiltersFromCurrentQuery()
            expect(wrapper.vm.assignation.value).toBe('unassigned')
            expect(wrapper.vm.assignation.taskTypeId).toBe('task-type-1')
          })
          it('assigned to', () => {
            changeSearch('assignedto=[John]')
            wrapper.vm.setFiltersFromCurrentQuery()
            expect(wrapper.vm.assignation.value).toBe('assignedto')
            expect(wrapper.vm.assignation.person.id).toBe('person-1')
          })
          it('not assigned to', () => {
            changeSearch('assignedto=[-John]')
            wrapper.vm.setFiltersFromCurrentQuery()
            expect(wrapper.vm.assignation.value).toBe('-assignedto')
            expect(wrapper.vm.assignation.person.id).toBe('person-1')
          })
        })
        describe('thumbnail', () => {
          it('with', () => {
            changeSearch('withthumbnail')
            wrapper.vm.setFiltersFromCurrentQuery()
            expect(wrapper.vm.hasThumbnail.value).toBe('withthumbnail')
          })
          it('without', () => {
            changeSearch('-withthumbnail')
            wrapper.vm.setFiltersFromCurrentQuery()
            expect(wrapper.vm.hasThumbnail.value).toBe('-withthumbnail')
          })
        })
      })

      describe('Task type filters', () => {
        it('add', () => {
          expect(wrapper.vm.taskTypeFilters.values.length).toBe(0)
          wrapper.vm.addTaskTypeFilter()
          expect(wrapper.vm.taskTypeFilters.values).toStrictEqual([{
            id: 'task-type-1',
            operator: '=',
            statusId: 'task-status-1',
          }])
          wrapper.vm.addTaskTypeFilter()
          expect(wrapper.vm.taskTypeFilters.values.length).toBe(2)
        })
        it('remove', () => {
          wrapper.vm.addTaskTypeFilter()
          wrapper.vm.addTaskTypeFilter()
          const filter = wrapper.vm.addTaskTypeFilter()
          wrapper.vm.removeTaskTypeFilter(filter)
          expect(wrapper.vm.taskTypeFilters.values.length).toBe(2)
        })
      })

      describe('descriptors', () => {
        it('add', () => {
          expect(wrapper.vm.taskTypeFilters.values.length).toBe(0)
          wrapper.vm.addDescriptorFilter()
          expect(wrapper.vm.metadataDescriptorFilters.values).toStrictEqual([{
            id: 'descriptor-1',
            operator: '=',
            text: 'easy',
          }])
          wrapper.vm.addDescriptorFilter()
          expect(wrapper.vm.metadataDescriptorFilters.values.length).toBe(2)
        })
        it('remove', () => {
          wrapper.vm.addDescriptorFilter()
          wrapper.vm.addDescriptorFilter()
          const filter = wrapper.vm.addDescriptorFilter()
          wrapper.vm.removeDescriptorFilter(filter)
          expect(wrapper.vm.metadataDescriptorFilters.values.length).toBe(2)
        })
        it('options', () => {
          const option = wrapper.vm.getDescriptorChoiceOptions('descriptor-1')
          expect(option).toStrictEqual([
            {label: 'easy', value: 'easy'},
            {label: 'hard', value: 'hard'}
          ])
        })
      })
    })
  })
})
