<template>
  <div class="page">
    <h1 class="subtitle flexrow">
      <span class="production-name flexrow-item">
        {{ currentProduction.name }}
      </span>
      <task-type-name
        class="flexrow-item"
        :task-type="currentTaskType"
      >
      </task-type-name>
    </h1>

    <table-info
      :is-loading="loading.entities"
      :is-error="errors.entities"
    >
    </table-info>

    <div
      v-if="!this.currentTaskType.for_shots"
    >
      <div
        class="supervisor-type-assets"
        :key="typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''"
        v-if="Object.keys(assetMap).length > 0"
        v-for="typeAssets in assetsByType"
      >
        <div class="supervisor-asset-type">
          {{ typeAssets.length > 0 ? typeAssets[0].asset_type_name : '' }}
        </div>
        <div class="supervisor-asset-list">
          <div
            class="supervisor-asset"
            :key="asset.id"
            v-for="asset in typeAssets"
          >
            <router-link
              class="asset-block"
              :to="{
                name: 'asset',
                params: {
                  asset_id: asset.id
                }
              }"
            >
              <entity-thumbnail
                :entity="asset"
                :square="true"
                :empty-width="60"
                :empty-height="60"
              >
              </entity-thumbnail>
              <span class="asset-name">
                {{ asset.name }}
              </span>
            </router-link>
            <validation-tag
              :task="asset.validations[currentTaskType.name]"
              v-if="asset.validations[currentTaskType.name]"
            >
            </validation-tag>
          </div>
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
          <div
            class="supervisor-shot"
            :key="shot.id"
            v-for="shot in sequenceShots"
          >
            <router-link
              class="shot-block"
              :to="{
                name: 'shot',
                params: {
                  shot_id: shot.id
                }
              }"
            >
              <entity-thumbnail
                :entity="shot"
                :square="true"
                :empty-width="60"
                :empty-height="60"
              >
              </entity-thumbnail>
              <span class="shot-name">
                {{ shot.name }}
              </span>
            </router-link>
            <validation-tag
              :task="shot.validations[currentTaskType.name]"
              v-if="shot.validations[currentTaskType.name]"
            >
            </validation-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import EntityThumbnail from './widgets/EntityThumbnail'
import PageTitle from './widgets/PageTitle'
import SubscribeButton from './widgets/SubscribeButton'
import TableInfo from './widgets/TableInfo'
import TaskTypeName from './widgets/TaskTypeName'
import ValidationTag from './widgets/ValidationTag'

export default {
  name: 'task-type-page',
  components: {
    EntityThumbnail,
    PageTitle,
    SubscribeButton,
    TableInfo,
    TaskTypeName,
    ValidationTag
  },

  data () {
    return {
      loading: {
        entities: false
      },
      errors: {
        entities: false
      }
    }
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetsByType',
      'currentTaskType',
      'currentProduction',
      'displayedAssets',
      'sequenceSubscriptions',
      'shotsByEpisode',
      'shotMap',
      'taskTypeMap'
    ]),

    title () {
      return `${this.currentProduction.name} / ${this.currentTaskType.name}`
    }
  },

  methods: {
    ...mapActions([
      'initTaskType',
      'loadShots',
      'loadAssets',
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
        })
        .catch((err) => {
          console.error(err)
          this.loading.entities = false
          this.errors.entities = true
        })
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
    }
  },

  mounted () {
    this.initData(false)
  },

  watch: {
    $route () {
      this.initData(true)
    },

    currentProduction () {
      if (this.currentProduction.id !== this.$route.params.production_id) {
        this.$router.push({
          name: 'task-type',
          params: {production_id: this.currentProduction.id}
        })
      }
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

.supervisor-shot,
.supervisor-asset {
  text-align: center;
  display: flex;
  flex-direction: column;
  max-width: 60px;
  min-width: 60px;
  margin-right: 2em;
  font-size: 0.8em;
  margin-bottom: 2em;
  word-wrap: break-word;
}

.shot-block,
.asset-block {
  flex: 1;
}
</style>
