<template>
  <div class="page">
    <h1 class="subtitle">
      {{ currentProduction.name }}
      <task-type-name :task-type="currentTaskType">
      </task-type-name>
    </h1>

    <div
      v-if="!this.currentTaskType.for_shots"
    >
      <div
        class="supervisor-type-assets"
        v-if="Object.keys(assetMap).length > 0"
        v-for="typeAssets in assetsByType"
      >
        <div class="supervisor-asset-type">
          {{ typeAssets[0] ? typeAssets[0].asset_type_name : '' }}
        </div>
        <div class="supervisor-asset-list">
          <div
            class="supervisor-asset"
            v-for="asset in typeAssets"
          >
            <router-link
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
                :empty-width="80"
                :empty-height="80"
              >
              </entity-thumbnail>
              <span>
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
        v-if="Object.keys(shotMap).length > 0"
        v-for="sequenceShots in shotsByEpisode"
      >
        <div class="supervisor-sequence"
        >
          {{ sequenceShots[0] ? sequenceShots[0].episode_name + ' / ': '' }}
          {{ sequenceShots[0] ? sequenceShots[0].sequence_name : '' }}
        </div>
        <div class="supervisor-shot-list">
          <div
            class="supervisor-shot"
            v-for="shot in sequenceShots"
          >
            <router-link
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
                :empty-width="80"
                :empty-height="80"
              >
              </entity-thumbnail>
              {{ shot.name }}
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
import TaskTypeName from './widgets/TaskTypeName'
import ValidationTag from './widgets/ValidationTag'

export default {
  name: 'task-type-page',
  components: {
    EntityThumbnail,
    PageTitle,
    TaskTypeName,
    ValidationTag
  },

  data () {
    return {
      loading: {
        notifications: false
      },
      errors: {
        notifications: false
      }
    }
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetsByType',
      'currentProduction',
      'displayedAssets',
      'shotsByEpisode',
      'shotMap',
      'taskTypeMap'
    ]),

    currentTaskType () {
      return this.taskTypeMap[this.$route.params.task_type_id] || {}
    },

    title () {
      return `${this.currentProduction.name} / ${this.currentTaskType.name}`
    }
  },

  methods: {
    ...mapActions([
      'loadShots',
      'loadAssets',
      'setProduction'
    ])
  },

  mounted () {
    const productionId = this.$store.state.route.params.production_id
    if (this.currentProduction.id !== productionId) {
      this.setProduction(productionId)
    }

    if (this.currentTaskType.for_shots) {
      if (Object.keys(this.shotMap).length === 0) {
        this.loadShots()
      }
    } else {
      if (Object.keys(this.assetMap).length === 0) {
        this.loadAssets()
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

.supervisor-asset-type,
.supervisor-sequence {
  text-transform: uppercase;
  color: #999;
  border-bottom: 1px solid #CCC;
  font-size: 1.2em;
  margin-bottom: 1em;
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
  max-width: 80px;
  min-width: 80px;
  margin-right: 2em;
  font-size: 0.8em;
  margin-bottom: 2em;
  word-wrap: break-word;
}
</style>
