<template>
  <div class="filters">

    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <span class="subtitle">Filters: </span>
        </div>

        <div
          class="level-item tag filter"
          :key="filter.id"
          v-for="filter in filters"
        >
          <span>
            {{ filter.type }}
            =
            {{ filter.value.name }}
          </span>
          <button
            @click="removeFilter(filter)"
            class="delete is-small remove-filter">
          </button>
        </div>

        <div class="level-item" v-if="isAddWidgetVisible">
        <div class="level">
          <span class="select level-item">
            <select
              v-model="filterType"
              @change="onFilterTypeChange"
            >
              <option v-for="type in filterTypes" :key="type">
                {{ type }}
              </option>
            </select>
          </span>
          <span class="add-filter-operator level-item">
            =
          </span>
          <span class="select level-item">
            <select v-model="filterValue">
              <option
                v-for="choice in choices"
                :key="choice ? choice.name : ''"
                :value="choice"
              >
                {{ choice ? choice.name : '' }}
              </option>
            </select>
          </span>
          <button
            class="button level-item is-primary"
            @click="addNewFilter"
          >
            Add filter
          </button>
          <button
            class="button level-item is-link"
            @click="hideAddFilter"
          >
            Cancel
          </button>
        </div>
        </div>
        <div class="level-item" v-else>
          <button
            class="button is-small"
            @click="showAddFilter"
          >
            New filter
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'filters',
  props: [
    'filters',
    'filterTypes',
    'addFilter',
    'removeFilter',
    'changeFilterType',
    'choices'
  ],
  data () {
    return {
      isAddWidgetVisible: false,
      filterType: 'Production',
      filterValue: this.choices !== undefined && this.choices.length > 0 ? this.choices[0] : {}
    }
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    addNewFilter () {
      this.isAddWidgetVisible = false
      this.addFilter({
        type: this.filterType,
        value: this.filterValue
      })
    },
    showAddFilter () {
      this.isAddWidgetVisible = true
    },
    hideAddFilter () {
      this.isAddWidgetVisible = false
    },
    onFilterTypeChange () {
      const choices = this.changeFilterType(this.filterType)
      if (choices !== undefined && choices.length > 0) {
        this.filterValue = choices[0]
      }
    }
  }
}
</script>

<style scoped>
.add-filter-operator {
  margin-left: 5px;
  margin-right: 5px;
}
</style>
