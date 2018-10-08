<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="name">{{ $t('asset_types.fields.name') }}</th>
          <th
            class="validation"
            :style="validationStyle(taskTypeMap[columnId].color)"
            :key="columnId"
            v-for="columnId in validationColumns"
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
          :key="entry.id"
          v-for="entry in entries"
        >

          <td class="name">
            {{ entry.name }}
          </td>

          <td
            class="validation"
            :style="validationStyle(taskTypeMap[columnId].color)"
            :key="columnId"
            v-for="columnId in validationColumns"
          >
            <pie-chart
              width="70px"
              height="50px"
              :legend="false"
              :colors="chartColors(entry, taskTypeMap[columnId])"
              :data="chartData(entry, taskTypeMap[columnId])"
              v-if="isStats(entry, taskTypeMap[columnId])"
            />
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
import RowActions from '../widgets/RowActions'
import ButtonLink from '../widgets/ButtonLink'
import PageTitle from '../widgets/PageTitle'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'production-asset-type-list',

  props: [
    'entries',
    'isLoading',
    'isError',
    'assetTypeStats',
    'validationColumns'
  ],

  data () {
    return {
      busy: false,
      lastSelection: null
    }
  },

  components: {
    ButtonLink,
    PageTitle,
    RowActions,
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
    }
  },

  methods: {
    ...mapActions([
    ]),

    validationStyle (color) {
      return {
        'border-left': `2px solid ${color}`
      }
    },

    chartColors (entry, column) {
      const stats = this.assetTypeStats[entry.id][column.id]
      const taskStatusIds = Object.keys(stats)
      return taskStatusIds.map((key) => {
        return this.assetTypeStats[entry.id][column.id][key].color
      })
    },

    chartData (entry, column) {
      return Object.keys(this.assetTypeStats[entry.id][column.id]).map(
        (key) => {
          return [
            this.assetTypeStats[entry.id][column.id][key].name,
            this.assetTypeStats[entry.id][column.id][key].value
          ]
        }
      )
    },

    isStats (entry, column) {
      return this.assetTypeStats[entry.id] &&
             this.assetTypeStats[entry.id][column.id]
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

    newAssetPath () {
      let route = {
        name: 'new-asset-type',
        params: {
          production_id: this.currentProduction.id
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = 'episode-asset-type'
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    }
  }
}
</script>

<style scoped>
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
  min-width: 100px;
  max-width: 100px;
  width: 100px;
  word-wrap: break-word;
}

.actions {
  min-width: 100px;
}

th.actions {
  padding: 0.4em;
}
</style>
