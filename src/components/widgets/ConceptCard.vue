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

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { getEntityPath } from '@/lib/path'

import assetsStore from '@/store/modules/assets.js'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

const store = useStore()
const currentProduction = computed(() => store.getters.currentProduction)
const isTVShow = computed(() => store.getters.isTVShow)
const personMap = computed(() => store.getters.personMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)

const props = defineProps({
  concept: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const assetMap = computed(() => {
  return assetsStore.cache.assetMap
})

const linkedEntities = computed(() => {
  return props.concept.entity_concept_links
    .map(id => assetMap.value.get(id))
    .filter(Boolean)
})

const hasTask = computed(() => {
  return props.concept.tasks?.length
})

const taskStatus = computed(() => {
  return taskStatusMap.value.get(props.concept.tasks[0].task_status_id)
})

function entityPath(entity, section) {
  const episodeId = isTVShow.value ? entity.episode_id || 'main' : null
  return getEntityPath(
    entity.id,
    currentProduction.value.id,
    section,
    episodeId,
    { section: 'concepts' }
  )
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
