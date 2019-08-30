<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="name">{{ $t('asset_types.fields.name') }}</th>
          <th class="validation">{{ $t('main.all') }}</th>
          <th
            class="validation"
            :style="getValidationStyle(columnId)"
            :key="columnId"
            v-for="columnId in sortedValidationColumns"
            v-if="!isLoading"
          >
            <router-link
              :to="taskTypePath(columnId)"
            >
              {{ taskTypeMap[columnId].name }}
            </router-link>
          </th>
          <th class="actions"></th>
        </tr>
      </thead>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <div
    class="has-text-centered"
    v-if="isEmptyList && !isCurrentUserClient && !isLoading"
  >
    <p class="info">
      <img src="../../assets/illustrations/empty_asset.png" />
    </p>
    <p class="info">{{ $t('assets.empty_list') }}</p>
    <button-link
      class="level-item big-button"
      :text="$t('assets.new_asset')"
      :path="newAssetPath"
    />
  </div>
  <div
    class="has-text-centered"
    v-if="isEmptyList && isCurrentUserClient && !isLoading"
  >
    <p class="info">
      <img src="../../assets/illustrations/empty_asset.png" />
    </p>
    <p class="info">{{ $t('assets.empty_list_client') }}</p>
  </div>

  <div
    ref="body"
    class="table-body"
    v-scroll="onBodyScroll"
    v-if="!isLoading"
  >
    <table class="table">
      <tbody>

        <tr
          class="all-line"
          v-if="showAll && !isEmptyList"
        >
          <td class="name">
            {{ $t('asset_types.all_asset_types') }}
          </td>

          <stats-cell
            :colors="chartColors('all', 'all')"
            :data="chartData('all', 'all')"
            :displayMode="displayMode"
          />

          <stats-cell
            :style="getValidationStyle(columnId)"
            :key="'all-' + columnId"
            :colors="chartColors('all', columnId)"
            :data="chartData('all', columnId)"
            :displayMode="displayMode"
            v-for="columnId in sortedValidationColumns"
          />

          <td class="actions">
          </td>
        </tr>

        <tr
          :key="entry.id"
          v-for="entry in entries"
        >

          <td class="name">
            {{ entry.name }}
          </td>

          <stats-cell
            :colors="chartColors(entry.id, 'all')"
            :data="chartData(entry.id, 'all')"
            :displayMode="displayMode"
            v-if="isStats(entry.id, 'all')"
          />
          <td
            v-else
          >
          </td>

          <stats-cell
            :key="entry.id + columnId"
            :style="getValidationStyle(columnId)"
            :colors="chartColors(entry.id, columnId)"
            :data="chartData(entry.id, columnId)"
            :displayMode="displayMode"
            v-if="isStats(entry.id, columnId)"
            v-for="columnId in sortedValidationColumns"
          />
          <td
            :style="getValidationStyle(columnId)"
            v-else
          >
          </td>

          <td class="actions"></td>
        </tr>
      </tbody>
    </table>
  </div>

  <p
    class="has-text-centered nb-asset-types"
    v-if="!isEmptyList && !isLoading"
  >
    {{ displayedAssetTypesLength }}
    {{ $tc('asset_types.number', displayedAssetTypesLength) }}
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { entityListMixin } from './base'
import { getChartColors, getChartData } from '../../lib/stats'
import ButtonLink from '../widgets/ButtonLink'
import StatsCell from '../cells/StatsCell'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'production-asset-type-list',
  mixins: [entityListMixin],

  props: {
    displayMode: {
      type: String,
      default: 'pie'
    },
    entries: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    assetTypeStats: {
      type: Object,
      default: () => {}
    },
    showAll: {
      type: Boolean,
      default: false
    },
    validationColumns: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      busy: false,
      lastSelection: null
    }
  },

  components: {
    ButtonLink,
    StatsCell,
    TableInfo
  },

  computed: {
    ...mapGetters([
      'assetTypeSearchText',
      'currentEpisode',
      'currentProduction',
      'displayedAssetTypesLength',
      'isCurrentUserClient',
      'isTVShow',
      'taskTypeMap'
    ]),

    isEmptyList () {
      return this.entries &&
             this.entries.length === 0 &&
             !this.isLoading &&
             !this.isError &&
             (!this.assetTypeSearchText || this.assetTypeSearchText.length === 0)
    },

    newAssetPath () {
      let route = {
        name: 'new-asset',
        params: {
          production_id: this.currentProduction.id
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = 'episode-new-asset'
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    }
  },

  methods: {
    ...mapActions([
    ]),

    chartColors (entryId, columnId) {
      return getChartColors(this.assetTypeStats, entryId, columnId)
    },

    chartData (entryId, columnId) {
      return getChartData(this.assetTypeStats, entryId, columnId)
    },

    isStats (entryId, columnId) {
      return this.assetTypeStats[entryId] &&
             this.assetTypeStats[entryId][columnId]
    },

    onHeaderScroll (event, position) {
      this.$refs.tableWrapper.scrollLeft = position.scrollLeft
    },

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
      this.$emit('scroll', position.scrollTop)
    },

    setScrollPosition (scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    taskTypePath (taskTypeId) {
      let route = {
        name: 'task-type',
        params: {
          production_id: this.currentProduction.id,
          task_type_id: taskTypeId,
          type: 'assets'
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = 'episode-task-type'
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    },

    resizeHeaders () {
    }
  }
}
</script>

<style lang="scss" scoped>
.name {
  min-width: 200px;
  width: 200px;
  font-weight: bold;
}

.name a {
  color: inherit;
}

td.name {
  font-size: 1.2em;
}

.validation {
  min-width: 170px;
  max-width: 170px;
  width: 170px;
  word-wrap: break-word;
}

.actions {
  min-width: 100px;
}

th.actions {
  padding: 0.4em;
}

.info img {
  max-width: 80vh;
}
</style>
