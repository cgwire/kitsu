<template>
<div class="columns fixed-page">
  <div class="column main-column">
    <div class="task-type page">

      <div class="header flexrow">
        <router-link
          class="back-link flexrow-item"
          :to="shotsPath"
          v-if="this.currentTaskType.for_shots"
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
          class=""
          :task-type="currentTaskType"
        />
      </div>

      <table-info
        :is-loading="loading.entities"
        :is-error="errors.entities"
      />

      <div
        v-if="!this.currentTaskType.for_shots"
      >
        <div
          :key="getAssetTypeName(typeAssets)"
          class="supervisor-type-assets"
          v-if="isAssets"
          v-for="typeAssets in assetsByType"
        >
          <div class="supervisor-asset-type">
            {{ getAssetTypeName(typeAssets) }}
          </div>
          <div class="supervisor-asset-list">
            <task-type-entity-block
              :key="asset.id"
              :ref="asset.id"
              :entity="asset"
              :task-type="currentTaskType"
              entity-type="asset"
              :selected="selection[asset.id]"
              @select="onSelect"
              @unselect="onUnselect"
              v-for="asset in typeAssets"
            />
          </div>
        </div>
      </div>

      <div
        v-else
      >
        <div
          class="supervisor-sequences"
          :key="sequenceShots.length > 0 ? sequenceShots[0].id : ''"
          v-for="sequenceShots in shotsByEpisode"
          v-if="Object.keys(shotMap).length > 0"
        >
          <div class="supervisor-sequence flexrow">
            <span class="flexrow-item">
              {{ sequenceShots.length > 0 ? sequenceShots[0].episode_name + ' / ': '' }}
              {{ sequenceShots.length > 0 ? sequenceShots[0].sequence_name : '' }}
            </span>
            <subscribe-button
              class="flexrow-item"
              :subscribed="isSubscribed(sequenceShots[0].sequence_id)"
              @click="toggleSubscribe(sequenceShots[0].sequence_id)"
              v-if="sequenceShots.length > 0"
            />
          </div>
          <div class="supervisor-shot-list">
            <task-type-entity-block
              :key="shot.id"
              :ref="shot.id"
              :entity="shot"
              :task-type="currentTaskType"
              entity-type="shot"
              :selected="selection[shot.id]"
              @select="onSelect"
              @unselect="onUnselect"
              v-for="shot in sequenceShots"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="column side-column"
  >
    <task-info
      :task="currentTask"
    />
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { ChevronLeftIcon } from 'vue-feather-icons'
import EntityThumbnail from './widgets/EntityThumbnail'
import PageTitle from './widgets/PageTitle'
import TaskInfo from './sides/TaskInfo'
import SubscribeButton from './widgets/SubscribeButton'
import TableInfo from './widgets/TableInfo'
import TaskTypeEntityBlock from './pages/tasktype/TaskTypeEntityBlock'
import TaskTypeName from './widgets/TaskTypeName'
import ValidationTag from './widgets/ValidationTag'

export default {
  name: 'task-type-page',
  components: {
    ChevronLeftIcon,
    EntityThumbnail,
    PageTitle,
    SubscribeButton,
    TableInfo,
    TaskInfo,
    TaskTypeEntityBlock,
    TaskTypeName,
    ValidationTag
  },

  entityListCache: [],

  data () {
    return {
      currentTask: null,
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
    setTimeout(() => {
      this.initData(false)
    }, 100)
    this.selection = {}
    window.addEventListener('keydown', this.onKeyDown, false)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
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
      'sequenceSubscriptions',
      'shotsByEpisode',
      'shotMap',
      'shotsPath',
      'taskMap'
    ]),

    isAssets () {
      return Object.keys(this.assetMap).length > 0
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
    }
  },

  methods: {
    ...mapActions([
      'initTaskType',
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
          if (
            this.assetsByType &&
            this.assetsByType.length > 0 &&
            this.assetsByType[0].length > 0
          ) {
            this.$options.entityListCache = [].concat(...this.assetsByType)
          } else {
            this.$options.entityListCache = [].concat(...this.shotsByEpisode)
          }
        })
        .catch((err) => {
          console.error(err)
          this.loading.entities = false
          this.errors.entities = true
        })
    },

    getAssetTypeName (typeAssets) {
      return typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''
    },

    isSubscribed (sequenceId) {
      return this.sequenceSubscriptions[sequenceId]
    },

    toggleSubscribe (sequenceId) {
      let taskTypeId = this.currentTaskType.id
      if (!this.isSubscribed(sequenceId)) {
        this.subscribeToSequence({sequenceId, taskTypeId})
      } else {
        this.unsubscribeFromSequence({sequenceId, taskTypeId})
      }
    },

    onSelect (selectionInfo) {
      this.currentTask = selectionInfo.task
      this.selection = {}
      this.selection[selectionInfo.entity.id] = true
    },

    onUnselect (selectionInfo) {
      this.currentTask = null
      this.selection = {}
    },

    getCurrentIndex () {
      let index = 0
      const selectedEntities = Object.keys(this.selection)
      if (selectedEntities.length > 0) {
        const currentSelectionId = selectedEntities[0]
        index = this.$options.entityListCache.findIndex(
          (entity) => entity.id === currentSelectionId
        )
      }
      return index
    },

    selectPreviousTask () {
      let index = this.getCurrentIndex() - 1
      if (Object.keys(this.selection).length > 0 && index < 0) {
        index = this.$options.entityListCache.length - 1
      }
      const entity = this.$options.entityListCache[index]
      if (entity) this.$refs[entity.id][0].select()
    },

    selectNextTask () {
      const maxLength = this.$options.entityListCache.length - 1
      let index = this.getCurrentIndex() + 1
      if (index > maxLength) index = 0
      const entity = this.$options.entityListCache[index]
      if (entity) this.$refs[entity.id][0].select()
    },

    onKeyDown (event) {
      if (event.ctrlKey) {
        if (event.keyCode === 37) {
          this.selectPreviousTask()
        } else if (event.keyCode === 38) {
          this.selectPreviousTask()
        } else if (event.keyCode === 39) {
          this.selectNextTask()
        } else if (event.keyCode === 40) {
          this.selectNextTask()
        }
      }
    }
  },

  watch: {
    $route () {
      this.initData(true)
    },

    currentProduction () {
      this.initData(true)
    }
  },

  metaInfo () {
    return {
      title: `${this.title} - Kitsu`
    }
  }
}
</script>

<style scoped>
.page {
  margin-top: 1em;
  height: 100%;
}

.production-name {
  font-size: 1.5em;
}

.supervisor-asset-type,
.supervisor-sequence {
  text-transform: uppercase;
  color: #999;
  border-bottom: 1px solid #CCC;
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

.header {
  margin-top: 0.5em;
  margin-bottom: 1.5em;
}

.header .back-link {
  padding-top: 5px;
}
</style>
