<template>
  <div class="concept-item" @click="$emit('click')">
    <entity-preview
      :entity="concept"
      :empty-height="200"
      :empty-width="300"
      :height="200"
      :width="300"
      is-rounded-top-border
    />
    <div class="description">
      <ul class="tags">
        <li
          :key="entity.id"
          class="tag"
          @click.stop
          v-for="entity in linkedEntities"
        >
          <router-link :to="entityPath(entity, 'asset')">
            {{ entity.name }}
          </router-link>
        </li>
      </ul>
      <div class="status" v-if="hasTask">
        <span
          class="tag"
          :style="{
            backgroundColor: taskStatus.color,
            color: 'white'
          }"
        >
          {{ taskStatus.short_name }}
        </span>
        <people-avatar
          :font-size="14"
          :is-link="false"
          :person="personMap.get(concept.created_by)"
          :size="25"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getEntityPath } from '@/lib/path'

import assetsStore from '@/store/modules/assets.js'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

export default {
  name: 'concept-card',

  components: {
    EntityPreview,
    PeopleAvatar
  },

  props: {
    concept: {
      type: Object,
      required: true
    }
  },

  emits: ['click'],

  computed: {
    ...mapGetters([
      'assetMap',
      'currentProduction',
      'isTVShow',
      'personMap',
      'taskStatusMap'
    ]),

    assetMap() {
      return assetsStore.cache.assetMap
    },

    linkedEntities() {
      return this.concept.entity_concept_links
        .map(id => this.assetMap.get(id))
        .filter(Boolean)
    },

    hasTask() {
      return this.concept.tasks?.length
    },

    taskStatus(concept) {
      return this.taskStatusMap.get(this.concept.tasks[0].task_status_id)
    }
  },

  methods: {
    entityPath(entity, section) {
      const episodeId = this.isTVShow ? entity.episode_id || 'main' : null
      return getEntityPath(
        entity.id,
        this.currentProduction.id,
        section,
        episodeId,
        { section: 'concepts' }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.concept-item {
  border-radius: 1em;
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);
}

.description {
  display: flex;
  flex: 1;
  flex-direction: column;
  flex-wrap: wrap;
  margin: 0;
  padding: 0.3em;
  row-gap: 10px;
  min-height: 70px;
}

.tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 20px;
  margin-left: 0;
  padding-top: 0.5em;
  flex: 1;

  .tag {
    cursor: pointer;
    transition: transform 0.1s linear;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.tag {
  font-weight: 500;
  letter-spacing: 1px;
}

.status {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .tag {
    text-transform: uppercase;
  }
}
</style>
