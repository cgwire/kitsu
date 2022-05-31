<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div @click="$emit('cancel')" class="modal-background"></div>

  <div class="modal-content">
    <div class="box content">
      <h1 class="title">
        {{ $t('entities.build_filter.title') }}
      </h1>

      <!--combobox
        class="flexrow-item"
        :options="general.unionOptions"
        locale-key-prefix="entities.build_filter."
        v-model="union"
      /-->

      <h3 class="subtitle">
        {{ $t('entities.build_filter.department') }}
      </h3>

      <div
        class="flexrow department-filter"
        :key="'task-type-' + i"
        v-for="(departmentFilter, i) in departmentFilters.values"
      >
        <combobox
          class="flexrow-item"
          :options="general.operatorOptions"
          @input="onDepartmentOperatorChanged(departmentFilter)"
          locale-key-prefix="entities.build_filter."
          v-model="departmentFilter.operator"
        />
        <div class="flexrow-item flexrow value-column">
          <div
            :key="`department-${index}`"
            v-for="(_, index) in departmentFilter.values"
          >
            <combobox
              class="flexrow-item"
              :options="departmentsOptions"
              v-model="departmentFilter.values[index]"
            />
          </div>
          <button-simple
            class="mt05"
            icon="plus"
            @click="addInDepartmentFilter(departmentFilter)"
            v-if="departmentFilter.operator === 'in'"
          />
        </div>
      </div>

      <modal-footer
        :error-text="$t('entities.thumbnails.error')"
        @confirm="applyFilter"
        @cancel="$emit('cancel')"
      />
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import { getFilters } from '@/lib/filtering'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import Combobox from '@/components/widgets/Combobox'
import ModalFooter from '@/components/modals/ModalFooter'

export default {
  name: 'build-people-filter-modal',
  mixins: [modalMixin],

  components: {
    ButtonSimple,
    Combobox,
    ModalFooter
  },

  props: {
    active: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      general: {
        operatorOptions: [
          { label: 'equal', value: '=' },
          { label: 'not_equal', value: '=-' },
          { label: 'in', value: 'in' }
        ],
        unionOptions: [
          { label: 'union_and', value: 'and' },
          { label: 'union_or', value: 'or' }
        ]
      },
      departmentFilters: {
        values: []
      },
      union: 'and'
    }
  },

  mounted () {
    this.reset()
    this.setFiltersFromCurrentQuery()
  },

  computed: {
    ...mapGetters([
      'peopleSearchText',
      'peopleSearchText',
      'departmentMap',
      'departments'
    ]),

    departmentsOptions () {
      return this.departments.map(department => {
        return {
          label: department.name,
          value: department.id
        }
      })
    }
  },

  methods: {
    ...mapActions([
    ]),

    // Build filter

    applyFilter () {
      const query = this.buildFilter()
      this.$emit('confirm', query)
    },

    buildFilter () {
      let query = ''
      query = this.applyDepartmentChoice(query)
      query = this.applyUnionChoice(query)
      return query.trim()
    },

    addDepartmentFilter () {
      const filter = {
        operator: '=',
        values: [this.departments[0].id]
      }
      this.departmentFilters.values.push(filter)
      return filter
    },

    addInDepartmentFilter (departmentFilter) {
      departmentFilter.values.push(this.departments[0].name)
    },

    removeDepartmentFilter (departmentFilter) {
      this.departmentFilters.values =
        this.departmentFilters.values.filter(f => f !== departmentFilter)
    },

    applyDepartmentChoice (query) {
      this.departmentFilters.values.forEach(departmentFilter => {
        let operator = '=['
        if (departmentFilter.operator === '=-') operator = '=[-'
        const value = departmentFilter
          .values
          .map(dId => {
            return this.departmentMap.get(dId)
              ? this.departmentMap.get(dId).name
              : this.departments[0].name
          })
          .join(',')
        query += ` department${operator}${value}]`
      })
      return query
    },

    applyUnionChoice (query) {
      if (this.union === 'or') {
        query = ` +(${query.trim()})`
      }
      return query
    },

    // Helpers to set filters from search query

    setFiltersFromCurrentQuery () {
      if (!this.peopleSearchText) {
        return
      }
      this.departmentFilters.values = []

      const filters = getFilters({
        entryIndex: [],
        departments: this.departments,
        persons: [],
        query: this.peopleSearchText
      })
      filters.forEach((filter) => {
        this.setFiltersFromDepartmentQuery(filter)
      })
      if (filters.union) {
        this.setUnion()
      }
    },

    setFiltersFromDepartmentQuery (filter) {
      let operator = '='
      if (filter.values.length > 1) {
        operator = 'in'
      } else if (filter.excluding) {
        operator = '=-'
      }
      this.departmentFilters.values.push({
        operator,
        values: filter.values.map(d => d.id)
      })
    },

    setUnion () {
      this.union = 'or'
    },

    // General

    onDepartmentOperatorChanged (departmentFilter) {
      if (departmentFilter.operator !== 'in') {
        departmentFilter.values = [departmentFilter.values[0]]
      }
    },

    reset () {
      this.departmentFilters.values = [{
        operator: '=',
        values: this.departments.length > 0
          ? [this.departments[0].id]
          : []
      }]
    }
  },

  watch: {
    active () {
      if (this.active) {
        this.reset()
        this.setFiltersFromCurrentQuery()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content {
  max-height: calc(100vh - 7rem);
  margin-top: 3rem;
}

.add-button button {
  margin-left: 0;
}

.subtitle {
  color: $grey;
  font-size: 1em;
  margin-top: 1.1em;
  text-transform: uppercase;
  margin-bottom: 0.5em;
  margin-left: 0.1em;
}

.field {
  margin-top: 0;
  margin-bottom: 0;
}

.department-filter {
  margin-bottom: 0.3em;
  align-items: flex-start;

  .descriptor-text-value {
    padding: 0;
  }
}

.value-column {
  flex-direction: column;
  align-items: flex-start;
}
</style>
