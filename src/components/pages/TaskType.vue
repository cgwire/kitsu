<template>
<div class="task-type columns fixed-page">
  <div class="column main-column">
    <div class="task-type page">

      <div class="task-type-header page-header">
        <div class="flexcolumn-item flexrow">
          <router-link
            class="back-link flexrow-item"
            :to="shotsPath"
            v-if="currentTaskType.for_shots"
          >
            <chevron-left-icon />
          </router-link>
          <router-link
            class="back-link flexrow-item"
            :to="assetsPath"
            v-else
          >
            <chevron-left-icon />
          </router-link>
          <task-type-name
            class="flexrow-item"
            :task-type="currentTaskType"
          />
          <div
            class="flexrow-item ml1"
          >
            <search-field
              ref="task-search-field"
              :can-save="true"
              @change="onSearchChange"
              @save="saveSearchQuery"
              placeholder="ex: retake chara"
            />
          </div>
          <div class="flexrow-item ml1">
            {{ $t('main.sorted_by') }}
          </div>
          <div class="flexrow-item ml1 sorting-combobox">
            <combobox
              :options="sortOptions"
              locale-key-prefix="tasks.fields."
              v-model="currentSort"
            />
          </div>
        </div>
      </div>
      <div class="query-list">
        <search-query-list
          :queries="searchQueries"
          @changesearch="changeSearch"
          @removesearch="removeSearchQuery"
          v-if="!loading.entities"
        />
      </div>
      <task-list
        ref="task-list"
        :tasks="tasks"
        :is-assets="isAssets"
        :is-loading="loading.entities"
        :is-error="errors.entities"
        @task-selected="onTaskSelected"
      />
    </div>
  </div>

  <div
    class="column side-column"
    v-if="nbSelectedTasks === 1"
  >
    <task-info
      :task="Object.values(selectedTasks)[0]"
    />
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import firstBy from 'thenby'
import { buildSupervisorTaskIndex, indexSearch } from '../../lib/indexing'
import { applyFilters, getKeyWords, getTaskFilters } from '../../lib/filtering'

import { ChevronLeftIcon } from 'vue-feather-icons'
import Combobox from '../widgets/Combobox'
import EntityThumbnail from '../widgets/EntityThumbnail'
import TaskInfo from '../sides/TaskInfo'
import SearchField from '../widgets/SearchField'
import SearchQueryList from '../widgets/SearchQueryList'
import SubscribeButton from '../widgets/SubscribeButton'
import TaskList from '../lists/TaskList'
import TableInfo from '../widgets/TableInfo'
import TaskTypeEntityBlock from '../pages/tasktype/TaskTypeEntityBlock'
import TaskTypeName from '../widgets/TaskTypeName'
import ValidationTag from '../widgets/ValidationTag'

export default {
  name: 'task-type-page',
  components: {
    ChevronLeftIcon,
    Combobox,
    EntityThumbnail,
    SearchField,
    SearchQueryList,
    SubscribeButton,
    TaskList,
    TableInfo,
    TaskInfo,
    TaskTypeEntityBlock,
    TaskTypeName,
    ValidationTag
  },

  entityListCache: [],

  data () {
    return {
      currentSort: 'entity_name',
      currentTask: null,
      isAssets: true,
      tasks: [],
      selection: {},
      loading: {
        entities: false
      },
      errors: {
        entities: false
      }
    }
  },

  created () {
    if (!this.currentProduction) {
      this.setProduction(this.$route.params.production_id)
    }
  },

  mounted () {
    this.isAssets = this.$route.path.includes('assets')
    setTimeout(() => {
      this.initData(false)
    }, 100)
  },

  beforeDestroy () {
  },

  computed: {
    ...mapGetters([
      'assetsByType',
      'assetMap',
      'assetsPath',
      'currentEpisode',
      'currentProduction',
      'currentTaskType',
      'isTVShow',
      'nbSelectedTasks',
      'selectedTasks',
      'sequenceSubscriptions',
      'shotsByEpisode',
      'shotMap',
      'shotsPath',
      'taskSearchQueries',
      'taskMap'
    ]),

    assetTasks () {
      return this.getTasks(Object.values(this.assetMap))
    },

    shotTasks () {
      return this.getTasks(Object.values(this.shotMap))
    },

    title () {
      if (this.currentProduction) {
        if (this.isTVShow && this.currentEpisode) {
          return `${this.currentProduction.name} / ` +
                 `${this.currentEpisode.name} / ` +
                 `${this.currentTaskType.name}`
        } else {
          return `${this.currentProduction.name} / ${this.currentTaskType.name}`
        }
      } else {
        return 'Loading...'
      }
    },

    sortOptions () {
      return [
        'entity_name',
        'estimation',
        'duration',
        'task_status_short_name',
        'retake_count',
        'real_start_date',
        'real_end_date',
        'last_comment_date'
      ].map((name) => ({ label: name, value: name }))
    },

    searchQueries () {
      if (this.isAssets) {
        return this.taskSearchQueries.filter(t => t.entity_type === 'Asset')
      } else {
        return this.taskSearchQueries
      }
    }
  },

  methods: {
    ...mapActions([
      'clearSelectedTasks',
      'initTaskType',
      'saveTaskSearch',
      'removeTaskSearch',
      'setProduction',
      'subscribeToSequence',
      'unsubscribeFromSequence'
    ]),

    initData (force) {
      this.loading.entities = true
      this.errors.entities = false
      this.initTaskType(force)
        .then(() => {
          this.loading.entities = false
          if (this.isAssets) {
            this.tasks = this.assetTasks
            this.$options.taskIndex = buildSupervisorTaskIndex(
              this.assetTasks
            )
          } else {
            this.tasks = this.shotTasks
            this.$options.taskIndex = buildSupervisorTaskIndex(
              this.shotTasks
            )
          }
          this.$refs['task-search-field'].focus()
        })
        .catch((err) => {
          console.error(err)
          this.loading.entities = false
          this.errors.entities = true
        })
    },

    changeSearch (searchQuery) {
      this.$refs['task-search-field'].setValue(searchQuery.search_query)
      this.$refs['task-search-field'].$emit('change', searchQuery.search_query)
    },

    onSearchChange (query) {
      if (query) {
        query = query.toLowerCase().trim()
        const keywords = getKeyWords(query) || []
        const filters = getTaskFilters(this.$options.taskIndex, query)
        if (keywords && keywords.length > 0) {
          this.tasks = indexSearch(this.$options.taskIndex, keywords)
        } else {
          this.resetTasks()
        }
        this.tasks = applyFilters(this.tasks, filters, this.taskMap)
        this.tasks = this.sortTasks()
      } else {
        this.resetTasks()
      }
    },

    onTaskSelected (task) {
      this.currentTask = task
    },

    resetTasks () {
      if (this.isAssets) {
        this.tasks = this.assetTasks
      } else {
        this.tasks = this.shotTasks
      }
      this.tasks = this.sortTasks()
    },

    getTasks (entities) {
      const tasks = []
      entities.forEach((entity) => {
        entity.tasks.forEach((taskId) => {
          const task = this.taskMap[taskId]
          if (task && task.task_type_id === this.currentTaskType.id) {
            tasks.push(task)
          }
        })
      })
      return tasks
    },

    sortTasks () {
      const isName = ['task_status_short_name', 'entity_name'].includes(
        this.currentSort
      )
      return this.tasks.sort(
        firstBy(this.currentSort, isName ? 1 : -1)
          .thenBy('entity_name')
      )
    },

    saveSearchQuery (searchQuery) {
      const entityType = this.isAssets ? 'Asset' : 'Shot'
      this.saveTaskSearch({ searchQuery, entityType })
        .then(() => {
        })
        .catch((err) => {
          if (err) console.log('error')
        })
    },

    removeSearchQuery (searchQuery) {
      this.removeTaskSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.log('error')
        })
    }
  },

  watch: {
    $route () {
      this.initData(true)
    },

    currentProduction () {
      this.initData(true)
    },

    currentSort () {
      this.sortTasks()
      this.$refs['task-list'].resetSelection()
      this.clearSelectedTasks()
    }
  },

  metaInfo () {
    return {
      title: `${this.title} - Kitsu`
    }
  }
}
</script>

<style scoped lang="scss">
.page-header {
  margin-top: 1em;
}

.page {
  height: 100%;
}

.back-link {
  padding-top: 5px;
  margin-right: 5px;
}

.supervisor-asset-type,
.supervisor-sequence {
  text-transform: uppercase;
  color: $grey;
  border-bottom: 1px solid $light-grey;
  font-size: 1.2em;
  margin-bottom: 1em;
  padding-bottom: 0.5em;
}

.supervisor-asset-list,
.supervisor-shot-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.task-type {
  display: flex;
  flex-direction: column;
}

.columns {
  display: flex;
  flex-direction: row;
}

.column {
  overflow-y: auto;
  padding: 0;
}

.main-column {
  border-right: 3px solid $light-grey;
}

.sorting-combobox {
  padding-top: 3px;
}

.field {
  margin: 0;
}

.query-list {
  margin-bottom: 0;
  margin-left: 11em;
}
</style>
