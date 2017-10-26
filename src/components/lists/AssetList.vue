<template>
<div class="data-list">

  <div class="asset-list-header">

    <div class="level header-title">
      <div class="level-left">
        <div class="level-item">
          <page-title :text="$t('assets.title')"></page-title>
        </div>
      </div>

      <div class="level-right">
        <div class="level-item">
          <button-link
            class="level-item"
            :text="$t('main.csv.import_file')"
            icon="upload"
            :path="{
              name: 'import-assets',
              params: {production_id: currentProduction.id}
            }"
          >
          </button-link>
          <button-href-link
            class="level-item"
            :text="$t('main.csv.export_file')"
            icon="download"
            :path="'/api/export/csv/assets.csv?project_id=' + currentProduction.id"
          >
          </button-href-link>
          <button-link
            class="level-item"
            :text="$t('assets.new_asset')"
            icon="plus"
            :path="{
              name: 'new-asset',
              params: {production_id: currentProduction.id}
            }"
          >
          </button-link>
        </div>
      </div>
    </div>

    <div class="filters-area">
      <div class="level">
        <div class="level-right">
          <div class="level-item">
            <search-icon></search-icon>
          </div>
          <div class="level-item">
            <input
              class="input search-input"
              type="text"
              @input="onSearchChange"
              v-focus
            />
          </div>
          <div class="level-item">
            <filter-icon></filter-icon>
          </div>
          <div class="level-item">
            No filter set.
          </div>
        </div>
      </div>
    </div>

    <div class="table-header-wrapper" v-scroll="onHeaderScroll">
      <table class="table table-header">
        <thead>
          <tr>
            <th class="type">{{ $t('assets.fields.type') }}</th>
            <th class="name">{{ $t('assets.fields.name') }}</th>
            <th class="description">{{ $t('assets.fields.description') }}</th>
            <th
              class="validation"
              :style="{
                'border-left': '2px solid ' + column.color
              }"
              v-for="column in validationColumns">
              {{ column.name }}
            </th>

            <th class="actions">
              <button-link
                class="is-small"
                icon="plus"
                :text="$t('tasks.create_tasks')"
                :path="{
                  name: 'create-asset-tasks',
                  params: {
                    production_id: currentProduction.id
                  }
                }"
              >
              </button-link>
            </th>
          </tr>
        </thead>
      </table>
    </div>

  </div>


  <div class="table-wrapper" ref="tableWrapper">
    <table class="table table-data">
      <tbody>
        <tr
          key="entry.id"
          :class="{canceled: entry.canceled}"
          v-for="entry in entries"
        >
          <td :class="{type: !entry.canceled}">
            {{ entry.asset_type_name }}
          </td>
          <td :class="{name: !entry.canceled}">
            {{ entry.name }}
          </td>
          <td class="description">
            {{ entry.description }}
          </td>
          <validation-cell
            :key="column.name + '-' + entry.id"
            :column="column"
            :entity="entry"
            @select="onTaskSelected"
            @unselect="onTaskUnselected"
            v-for="column in validationColumns"
          >
          </validation-cell>
          <row-actions
            :entry="entry"
            :edit-route="{
              name: 'edit-asset',
              params: {
                production_id: currentProduction.id,
                asset_id: entry.id
              }
            }"
            :delete-route="{
              name: 'delete-asset',
              params: {
                production_id: currentProduction.id,
                asset_id: entry.id
              }
            }"
            :restore-route="{
              name: 'restore-asset',
              params: {
                production_id: currentProduction.id,
                asset_id: entry.id
              }
            }"
          >
          </row-actions>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="has-text-centered" v-if="isLoading">
    <img src="../../assets/spinner.svg">
  </div>
  <div class="has-text-centered" v-if="isError">
    <span class="tag is-danger">An error occured while loading data</span>
  </div>

  <p class="has-text-centered nb-assets">
    {{ entries.length }} {{ $tc('assets.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProductionNameCell from '../cells/ProductionNameCell'
import RowActions from '../widgets/RowActions'
import ValidationCell from '../cells/ValidationCell'
import ButtonLink from '../widgets/ButtonLink'
import ButtonHrefLink from '../widgets/ButtonHrefLink'
import PageTitle from '../widgets/PageTitle.vue'
import { SearchIcon, FilterIcon } from 'vue-feather-icons'

export default {
  name: 'asset-list',
  props: [
    'entries',
    'isLoading',
    'isError',
    'validationColumns'
  ],
  data () {
    return {}
  },
  components: {
    ButtonLink,
    ButtonHrefLink,
    FilterIcon,
    RowActions,
    PageTitle,
    ProductionNameCell,
    SearchIcon,
    ValidationCell
  },
  computed: {
    ...mapGetters([
      'currentProduction',
      'assetSearchValue',
      'selectedTasks'
    ])
  },
  methods: {
    ...mapActions([
    ]),
    onTaskSelected (task) {
      this.$store.commit('ADD_SELECTED_TASK', task)
    },
    onTaskUnselected (task) {
      this.$store.commit('REMOVE_SELECTED_TASK', task)
    },
    onSearchChange (event) {
      const searchQuery = event.target.value
      this.$store.commit('SET_ASSET_SEARCH', searchQuery)
    },
    onHeaderScroll (event, position) {
      this.$refs.tableWrapper.scrollLeft = position.scrollLeft
    }
  }
}
</script>

<style scoped>
.table {
  min-width: 1000px;
}

.actions {
  min-width: 150px;
  padding: 0.4em;
}

.name {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
  font-weight: bold;
}

.type {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  font-weight: bold;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.validation {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  margin-right: 1em;
}

td.name {
  font-size: 1.2em;
}

td.type {
  font-size: 1.2em;
}

.asset-list-header {
  position: fixed;
  height: 163px;
  min-height: 163px;
  max-height: 163px;
  padding: 1em 2em 0 2em;
  margin-top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  background: white;
}

.filters-area {
  background: white;
  padding-top: 1em;
  padding-bottom: 1em;
  margin-bottom: 0;
}

.table-header-wrapper {
  overflow-x: auto;
}

.table-header {
  margin-bottom: 0;
}

.table-wrapper {
  overflow-x: auto;
}

table.table-data {
  margin-top: 181px;
}

.data-list {
  width: 100%;
}
</style>
