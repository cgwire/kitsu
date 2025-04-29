<template>
  <div class="budget-data">
    <div class="has-text-centered mt2" v-if="isLoading">
      <spinner />
    </div>

    <div class="flexrow mt2" v-else-if="isError">
      <p class="list-error">
        {{ $t('budget.budget_entries_error') }}
      </p>
    </div>

    <div class="mt2" v-else-if="budgetDepartments.length === 0">
      <p class="has-text-centered mt1">
        {{ $t('budget.no_budget_entries_found') }}
      </p>
      <p class="has-text-centered mt1">
        <button-simple
          :text="$t('budget.add_entry')"
          @click="$emit('add-budget-entry')"
        />
      </p>
    </div>

    <div class="data-list filler" v-else>
      <div ref="body" class="datatable-wrapper flexcolumn filler">
        <table class="datatable">
          <thead class="datatable-head">
            <tr>
              <th
                class="datatable-row-header department-header-header"
                colspan="3"
              >
                <div class="flexrow">
                  <div class="flexrow-item">
                    {{ $t('budget.fields.department') }}
                  </div>
                  <div class="filler"></div>
                  <button-simple
                    :text="$t('budget.add_entry')"
                    is-thin
                    @click="$emit('add-budget-entry')"
                  />
                </div>
              </th>
              <th
                :key="month"
                class="month datatable-row-header"
                v-for="month in monthsBetweenProductionDates"
              >
                {{
                  month.month() === 0
                    ? month.format('MMM / YY')
                    : month.format('MMM')
                }}
              </th>
              <th class="datatable-row-header has-text-right">
                {{ $t('main.total') }} ({{ currency }})
              </th>
              <th class="actions datatable-row-header"></th>
            </tr>
          </thead>

          <tbody
            class="datatable-body"
            @mousedown="startBrowsing"
            @touchstart="startBrowsing"
          >
            <tr class="datatable-row">
              <td class="datatable-row-header" colspan="3">
                <div class="pa05">
                  {{ $t('main.total') }}
                </div>
              </td>
              <td
                :key="month"
                class="month"
                v-for="month in monthsBetweenProductionDates"
              >
                {{
                  totalEntry.monthCosts[
                    month.format('YYYY-MM')
                  ]?.toLocaleString()
                }}
              </td>
              <td class="total-cost">
                {{ totalEntry.total.toLocaleString() }}
              </td>
              <td class="actions"></td>
            </tr>

            <template
              v-for="departmentEntry in budgetDepartments"
              :key="departmentEntry.id"
            >
              <tr
                class="datatable-row department-row pointer"
                @click="toggleDepartment(departmentEntry.id)"
              >
                <td
                  class="datatable-row-header strong department-header"
                  colspan="3"
                >
                  <div
                    class="flexrow department-header-content"
                    :style="getDepartmentStyle(departmentEntry.id, '99')"
                  >
                    <chevron-right-icon
                      class="flexrow-item"
                      v-if="collapsedDepartments[departmentEntry.id]"
                    />
                    <chevron-down-icon class="flexrow-item" v-else />
                    <div class="flexrow-item">
                      {{ departmentMap.get(departmentEntry.id).name }}
                    </div>
                  </div>
                </td>
                <td
                  :key="month"
                  class="month"
                  :style="getDepartmentStyle(departmentEntry.id, '33')"
                  v-for="month in monthsBetweenProductionDates"
                >
                  {{
                    departmentEntry.monthCosts[
                      month.format('YYYY-MM')
                    ]?.toLocaleString()
                  }}
                </td>
                <td
                  class="total-cost"
                  :style="getDepartmentStyle(departmentEntry.id, '33')"
                >
                  {{ departmentEntry.total.toLocaleString() }}
                </td>
                <td
                  class="actions"
                  :style="getDepartmentStyle(departmentEntry.id, '33')"
                ></td>
              </tr>

              <template v-if="!collapsedDepartments[departmentEntry.id]">
                <tr
                  class="datatable-row"
                  :key="personEntry.id"
                  v-for="personEntry in departmentEntry.persons"
                >
                  <td class="position datatable-row-header">
                    {{
                      $t('budget.positions.' + personEntry.position || 'artist')
                    }}
                  </td>
                  <td class="seniority datatable-row-header">
                    {{
                      $t(
                        'budget.seniorities.' + personEntry.seniority ||
                          'junior'
                      )
                    }}
                  </td>
                  <td class="name datatable-row-header">
                    <div class="flexrow">
                      <people-avatar
                        class="flexrow-item"
                        :person="personMap.get(personEntry.person_id)"
                        :is-link="false"
                        :font-size="12"
                        :size="20"
                        v-if="personEntry.person_id"
                      />
                      <people-name
                        :person="personMap.get(personEntry.person_id)"
                        v-if="personEntry.person_id"
                      />
                      <span class="new-hiring" v-else>
                        {{ $t('budget.new_hiring') }}
                      </span>
                    </div>
                  </td>
                  <td
                    :key="month"
                    class="month"
                    v-for="month in monthsBetweenProductionDates"
                  >
                    {{
                      personEntry.monthCosts[
                        month.format('YYYY-MM')
                      ]?.toLocaleString()
                    }}
                  </td>
                  <td class="total-cost">
                    {{ personEntry.total.toLocaleString() }}
                  </td>
                  <row-actions-cell
                    class="actions"
                    :entry-id="personEntry.id"
                    :hide-avatar="true"
                    :hide-change-password="true"
                    :hide-delete="false"
                    :hide-refresh="true"
                    @delete-clicked="$emit('delete-budget-entry', personEntry)"
                    @edit-clicked="$emit('edit-budget-entry', personEntry)"
                  />
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { domMixin } from '@/components/mixins/dom'
import { grabListMixin } from '@/components/mixins/grablist'

import { ChevronDownIcon, ChevronRightIcon } from 'lucide-vue-next'

import preferences from '@/lib/preferences'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'budget-list',

  mixins: [domMixin, grabListMixin],

  emits: ['add-budget-entry', 'delete-budget-entry', 'edit-budget-entry'],

  components: {
    ButtonSimple,
    ChevronDownIcon,
    ChevronRightIcon,
    PeopleName,
    PeopleAvatar,
    RowActionsCell,
    Spinner
  },

  props: {
    budgets: {
      type: Array,
      default: () => []
    },
    budgetEntries: {
      type: Array,
      default: () => []
    },
    budgetDepartments: {
      type: Array,
      default: () => []
    },
    monthsBetweenProductionDates: {
      type: Array,
      default: () => []
    },
    currency: {
      type: String,
      default: 'USD'
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    totalEntry: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      collapsedDepartments: {},
      domEvents: [
        ['mousemove', this.onMouseMove],
        ['touchmove', this.onMouseMove],
        ['mouseup', this.stopBrowsing],
        ['mouseleave', this.stopBrowsing],
        ['touchend', this.stopBrowsing],
        ['touchcancel', this.stopBrowsing],
        ['keyup', this.stopBrowsing]
      ]
    }
  },

  mounted() {
    const key = `budget:collapsed-departments-${this.currentProduction.id}`
    this.addEvents(this.domEvents)
    this.collapsedDepartments = preferences.getObjectPreference(key) || {}
  },

  beforeUnmount() {
    this.removeEvents(this.domEvents)
    document.body.style.cursor = 'default'
  },

  computed: {
    ...mapGetters(['currentProduction', 'departmentMap', 'personMap'])
  },

  methods: {
    ...mapActions([]),

    toggleDepartment(departmentId) {
      this.collapsedDepartments[departmentId] =
        !this.collapsedDepartments[departmentId]

      const key = `budget:collapsed-departments-${this.currentProduction.id}`
      preferences.setObjectPreference(key, this.collapsedDepartments)
    },

    getDepartmentStyle(departmentId, opacity) {
      return {
        backgroundColor: this.departmentMap.get(departmentId).color + opacity
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.datatable-wrapper {
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
}

.department-header-header {
  max-width: 400px;
  width: 400px;
  z-index: 5;
}

.data-list {
  margin-top: 2em;
}

.department-header {
  min-width: 400px;
  position: sticky;
  padding: 0;
}

.department-header-content {
  color: white;
  height: 100%;
  min-width: 400px;
  padding: 0.6em 1em;
}

th.month {
  text-align: center;
  max-width: 80px;
  min-width: 80px;
  width: 80px;
}

td.month {
  text-align: right;
  max-width: 80px;
  min-width: 80px;
  width: 80px;
}

.position {
  max-width: 100px;
  min-width: 100px;
  width: 100px;
}

.seniority {
  max-width: 100px;
  min-width: 100px;
  width: 100px;
}

.name {
  max-width: 200px;
  width: 200px;
}

td.datatable-row-header.seniority {
  left: 100px;
}

td.datatable-row-header.name {
  left: 200px;
}

.actions {
  max-width: 120px;
  width: 120px;
  min-width: 120px;
}

.total-cost {
  font-weight: bold;
  text-align: right;
  max-width: 100px;
  width: 100px;
}

.new-hiring {
  background: $light-grey-light;
  color: $dark-grey-2;
  padding: 0.5em 1em;
  border-radius: 5px;
  font-size: 0.8rem;

  .dark & {
    background: $dark-grey-light;
    color: $light-grey;
  }
}
</style>
