<template>
  <div v-if="previewMode === 'comments'">
    <div
      :class="{
        'news-line': true,
        'timeline-entry': true,
        flexrow: true,
        selected: isSelected,
        'is-new': isNew
      }"
      @click.prevent="$emit('select', news)"
    >
      <span
        :class="{
          dot: true,
          red: hasRetakeValue,
          green: hasDoneValue
        }"
      ></span>
      <span class="date flexrow-item">
        {{ formatTime(news.created_at) }}
      </span>

      <div class="flexrow-item production-name-wrapper" v-if="isStudio">
        <production-name
          :production="productionMap.get(news.project_id)"
          only-avatar
        />
      </div>

      <people-avatar
        class="flexrow-item"
        :person="personMap.get(news.author_id)"
        :size="30"
        :font-size="14"
        :is-link="false"
        v-if="personMap.get(news.author_id)"
      />

      <div class="flexrow-item task-type-wrapper">
        <task-type-name
          class="task-type-name"
          :task-type="taskType"
          :production-id="news.project_id"
          :is-static="true"
        />
      </div>

      <div class="flexrow-item validation-wrapper">
        <validation-tag
          class="validation-tag"
          :task="task"
          :is-static="true"
          :thin="!news.change"
        />
      </div>

      <div class="flexrow-item comment-content">
        <div class="news-info flexrow">
          <span class="flexrow-item flexrow">
            <entity-thumbnail
              class="ml1 entity-thumbnail mr1 flexrow-item"
              :entity="{
                id: news.task_entity_id,
                preview_file_id: news.entity_preview_file_id
              }"
              :with-link="false"
            />
            <span class="strong ml05">
              {{ news.full_entity_name }}
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div
    class="preview"
    v-if="news.preview_file_id && previewMode === 'previews'"
  >
    <div
      :class="{
        'news-line': true,
        'timeline-entry': true,
        flexrow: true,
        selected: isSelected,
        'is-new': isNew
      }"
      @click.prevent="$emit('select', news)"
    >
      <span
        :class="{
          dot: true,
          red: hasRetakeValue,
          green: hasDoneValue
        }"
      ></span>
      <span class="date flexrow-item">
        {{ formatTime(news.created_at) }}
      </span>

      <people-avatar
        class="flexrow-item"
        :person="personMap.get(news.author_id)"
        :size="30"
        :no-link="true"
        v-if="personMap.get(news.author_id)"
      />

      <div class="flexrow-item task-type-wrapper">
        <task-type-name
          class="task-type-name"
          :task-type="taskType"
          :production-id="news.project_id"
        />
      </div>

      <div class="flexrow-item comment-content">
        <div class="news-info flexrow">
          <span class="flexrow-item flexrow">
            <entity-thumbnail
              class="ml1"
              :entity="{
                id: news.task_entity_id,
                preview_file_id: news.entity_preview_file_id
              }"
              :with-link="false"
              v-if="news.entity_preview_file_id"
            />
            <span class="strong ml05 flexrow-item">
              {{ news.full_entity_name }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <div class="has-text-centered">
      <preview-player
        :canvas-id="canvasId"
        :previews="news.preview_files"
        :task="previewPlayerTask"
        :read-only="true"
        :light="true"
        :big="true"
      />
    </div>
  </div>
</template>

<script setup>
import moment from 'moment-timezone'
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useTime } from '@/composables/time'

import PreviewPlayer from '@/components/previews/PreviewPlayer.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

const store = useStore()
const { timezone } = useTime()

const props = defineProps({
  canvasId: { type: String, required: true },
  isNew: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  isStudio: { type: Boolean, default: false },
  news: { type: Object, required: true },
  previewMode: { type: String, default: 'comments' }
})

defineEmits(['select'])

// Computed

const personMap = computed(() => store.getters.personMap)
const productionMap = computed(() => store.getters.productionMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const task = computed(() => ({
  id: props.news.task_id,
  task_status_id: props.news.task_status_id,
  task_type_id: props.news.task_type_id,
  episode_id: props.news.episode_id
}))

const taskType = computed(() => ({
  ...taskTypeMap.value.get(props.news.task_type_id),
  episode_id: props.news.episode_id
}))

const previewPlayerTask = computed(() => ({
  id: props.news.task_id,
  project_id: props.news.project_id,
  task_type_id: props.news.task_type_id,
  assignees: []
}))

const hasRetakeValue = computed(() => {
  const status = taskStatusMap.value.get(props.news.task_status_id)
  return status ? props.news.change && status.is_retake : false
})

const hasDoneValue = computed(() => {
  const status = taskStatusMap.value.get(props.news.task_status_id)
  return status ? props.news.change && status.is_done : false
})

// Functions

const formatTime = date =>
  moment.tz(date, 'UTC').tz(timezone.value).format('HH:mm')
</script>

<style lang="scss" scoped>
.timeline-entry {
  position: relative;
}

.timeline-entry .dot {
  position: absolute;
  display: block;
  left: -34px;
  background: $blue-light;
  width: 9px;
  height: 9px;
  border-radius: 4px;

  &.red {
    background: $red;
  }

  &.green {
    background: $light-green;
  }
}

.task-type-wrapper {
  min-width: 100px;
}

.validation-wrapper {
  min-width: 80px;
}

.date {
  min-width: 30px;
  font-size: 0.8em;
  color: $grey;
}

.news-info {
  vertical-align: middle;

  span,
  a {
    vertical-align: middle;
    display: inline-flex;
    align-items: center;
  }
}

.news-line {
  padding-left: 1em;
  align-items: middle;
  border: 3px solid transparent;
  cursor: pointer;
  margin-bottom: 1px;
  padding-top: 0.3em;
  padding-bottom: 0.3em;
  border-radius: 0.5em;
  transition: border 0.1s linear;

  &:hover {
    border: 3px solid var(--background-selectable);
  }

  &.selected {
    border: 3px solid var(--background-selected);
  }

  // Real-time arrival highlight: slide in + pulse fade.
  &.is-new {
    animation:
      news-arrival-slide 0.35s ease-out forwards,
      news-arrival-pulse 2.4s ease-out 0.35s forwards;
  }
}

@keyframes news-arrival-slide {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes news-arrival-pulse {
  0% {
    background: rgba($light-green, 0.18);
  }
  100% {
    background: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .news-line.is-new {
    animation: none;
  }
}

.preview {
  margin: 0 auto 2em auto;
  max-width: 800px;
}

.preview .news-line .dot {
  left: -54px;
}

.dark {
  .dot,
  .big-dot {
    background: $blue;
  }

  .selected .date {
    color: $light-grey;
  }
}
</style>
