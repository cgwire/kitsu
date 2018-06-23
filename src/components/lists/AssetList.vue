<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="thumbnail"></th>
          <th class="type">{{ $t('assets.fields.type') }}</th>
          <th class="name">{{ $t('assets.fields.name') }}</th>
          <th class="description">{{ $t('assets.fields.description') }}</th>
          <th
            class="validation"
            :style="{
              'border-left': '2px solid ' + column.color
            }"
            v-for="column in validationColumns">
            <router-link
              :to="{
                name: 'task-type',
                params: {
                  production_id: currentProduction.id,
                  task_type_id: column.id
                }
              }"
            >
              {{ column.name }}
            </router-link>
          </th>

          <th class="actions">
            <button-link
              :class="{
                'is-small': true,
                highlighted: isEmptyTask
              }"
              icon="plus"
              :text="$t('tasks.create_tasks')"
              :path="{
                name: 'create-asset-tasks',
                params: {
                  production_id: currentProduction.id
                }
              }"
              v-if="isCurrentUserManager && entries.length > 0"
            >
            </button-link>
          </th>
        </tr>
      </thead>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  >
  </table-info>

  <div class="has-text-centered" v-if="isEmptyList">
    <p class="info">{{ $t('assets.empty_list') }}</p>
    <button-link
      class="level-item big-button"
      :text="$t('assets.new_assets')"
      :path="{
        name: 'new-asset',
        params: {production_id: currentProduction.id}
      }"
    >
    </button-link>
  </div>

  <div
    ref="body"
    class="table-body"
    v-scroll="onBodyScroll"
    v-infinite-scroll="loadMoreAssets"
    infinite-scroll-disabled="busy"
    infinite-scroll-distance="120"
  >

    <table class="table">
      <tbody>
        <tr
          :key="entry.id"
          :class="{canceled: entry.canceled}"
          v-for="(entry, i) in entries"
        >
          <td class="thumbnail">
            <entity-thumbnail :entity="entry"></entity-thumbnail>
          </td>
          <td :class="{type: !entry.canceled}">
            {{ entry.asset_type_name }}
            </router-link>
          </td>
          <td :class="{name: !entry.canceled}">
            <router-link
              class="asset-link"
              :to="{
                name: 'asset',
                params: {
                  production_id: entry.production_id,
                  asset_id: entry.id
                }
              }">
            {{ entry.name }}
            </router-link>
          </td>
          <description-cell class="description" :entry="entry">
          </description-cell>
          <validation-cell
            :key="column.name + '-' + entry.id"
            :ref="'validation-' + i + '-' + j"
            :column="column"
            :entity="entry"
            :selected="assetSelectionGrid[i][j]"
            :rowX="i"
            :columnY="j"
            class="unselectable toto"
            @select="onTaskSelected"
            @unselect="onTaskUnselected"
            v-for="(column, j) in validationColumns"
          >
          </validation-cell>
          <row-actions v-if="isCurrentUserManager"
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
          <td class="actions" v-else>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="has-text-centered nb-assets" v-if="!isEmptyList">
    {{ displayedAssetsLength }} {{ $tc('assets.number', displayedAssetsLength) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import DescriptionCell from '../cells/DescriptionCell'
import RowActions from '../widgets/RowActions'
import ButtonLink from '../widgets/ButtonLink'
import ButtonHrefLink from '../widgets/ButtonHrefLink'
import EntityThumbnail from '../widgets/EntityThumbnail'
import PageTitle from '../widgets/PageTitle'
import TableInfo from '../widgets/TableInfo'
import ValidationCell from '../cells/ValidationCell'

export default {
  name: 'asset-list',
  props: [
    'entries',
    'isLoading',
    'isError',
    'validationColumns'
  ],

  data () {
    return {
      busy: false,
      scrollPosition: 0,
      lastSelection: null,
      selectionGrid: null
    }
  },

  components: {
    ButtonLink,
    ButtonHrefLink,
    DescriptionCell,
    EntityThumbnail,
    PageTitle,
    RowActions,
    TableInfo,
    ValidationCell
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'assetSearchText',
      'selectedTasks',
      'nbSelectedTasks',
      'isCurrentUserManager',
      'displayedAssetsLength',
      'assetSelectionGrid',
      'assets'
    ]),

    isEmptyList () {
      return this.entries.length === 0 &&
             !this.isLoading &&
             !this.isError &&
             (!this.assetSearchText || this.assetSearchText.length === 0)
    },

    isEmptyTask () {
      return !this.emptyList &&
      this.validationColumns &&
      this.validationColumns.length === 0
    }
  },

  methods: {
    ...mapActions([
      'displayMoreAssets'
    ]),

    onTaskSelected (validationInfo) {
      if (validationInfo.isShiftKey) {
        if (this.lastSelection) {
          let startX = this.lastSelection.x
          let endX = validationInfo.x
          let startY = this.lastSelection.y
          let endY = validationInfo.y
          if (validationInfo.x < this.lastSelection.x) {
            startX = validationInfo.x
            endX = this.lastSelection.x
          }
          if (validationInfo.y < this.lastSelection.y) {
            startY = validationInfo.y
            endY = this.lastSelection.y
          }

          for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
              const ref = 'validation-' + i + '-' + j
              const validationCell = this.$refs[ref][0]
              if (!this.assetSelectionGrid[i][j]) {
                validationCell.select({ctrlKey: true, isUserClick: false})
              }
            }
          }
        }
      } else if (!validationInfo.isCtrlKey) {
        this.$store.commit('CLEAR_SELECTED_TASKS')
      }
      this.$store.commit('ADD_SELECTED_TASK', validationInfo)

      if (!validationInfo.isShiftKey && validationInfo.isUserClick) {
        this.lastSelection = {
          x: validationInfo.x,
          y: validationInfo.y
        }
      }
    },

    onTaskUnselected (validationInfo) {
      if (!validationInfo.isCtrlKey) {
        if (this.nbSelectedTasks === 1) {
          this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
        } else {
          this.$store.commit('CLEAR_SELECTED_TASKS')
          this.$store.commit('ADD_SELECTED_TASK', validationInfo)
        }
      } else {
        this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
      }
    },

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
      this.$emit('scroll', position.scrollTop)
    },

    loadMoreAssets () {
      this.displayMoreAssets()
    },

    setScrollPosition (scrollPosition) {
      this.$refs.body.scrollTop = scrollPosition
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

.thumbnail {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
  padding: 0;
}

.thumbnail img {
  margin-top: 5px;
}

.info {
  margin-top: 2em;
}

.asset-link {
  color: inherit
}

.highlighted {
  background: #00B242;
  color: white;
}
</style>
