<template>
  <div class="news flexcolumn">
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div class="timeline mt1" v-else-if="newsList.length">
      <div
        class="timeline-entry flexrow"
        :key="`news-${news.id}`"
        v-for="news in newsList"
      >
        <span
          :class="{
            dot: true,
            red: hasRetakeValue(news),
            green: hasDoneValue(news)
          }"
        ></span>
        <span class="date flexrow-item">
          {{ formatFullDate(news.created_at).substring(10, 0) }}
        </span>

        <people-avatar
          class="flexrow-item"
          :font-size="14"
          :is-link="false"
          :person="personMap.get(news.author_id)"
          :size="30"
          v-if="personMap.get(news.author_id)"
        />

        <div class="flexrow-item task-type-wrapper ml1">
          <task-type-name
            class="task-type-name"
            :is-static="true"
            :production-id="currentProduction.id"
            :task-type="buildTaskTypeFromNews(news)"
          />
        </div>

        <div class="flexrow-item validation-wrapper">
          <validation-tag
            :is-priority="false"
            :is-static="true"
            :task="buildTaskFromNews(news)"
            :thin="!news.change"
          />
        </div>
      </div>
    </div>
    <div v-else>
      {{ $t('news.no_news') }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { formatListMixin } from '@/components/mixins/format'

import Spinner from '@/components/widgets/Spinner.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

export default {
  name: 'entity-news',

  mixins: [formatListMixin],

  components: {
    PeopleAvatar,
    Spinner,
    TaskTypeName,
    ValidationTag
  },

  data() {
    return {
      isLoading: false,
      newsList: []
    }
  },

  props: {
    entity: {
      type: Object,
      default: () => {}
    }
  },

  mounted() {
    this.reset()
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'personMap',
      'taskTypeMap',
      'taskStatusMap'
    ])
  },

  methods: {
    ...mapActions(['getEntityNews']),

    buildTaskFromNews(news) {
      return {
        task_status_id: news.task_status_id
      }
    },

    buildTaskTypeFromNews(news) {
      return {
        ...this.taskTypeMap.get(news.task_type_id),
        episode_id: news.episode_id
      }
    },

    hasRetakeValue(news) {
      const taskStatus = this.taskStatusMap.get(news.task_status_id)
      return taskStatus ? news.change && taskStatus.is_retake : false
    },

    hasDoneValue(news) {
      const taskStatus = this.taskStatusMap.get(news.task_status_id)
      return taskStatus ? news.change && taskStatus.is_done : false
    },

    reset() {
      if (!this.entity) {
        return
      }
      this.isLoading = true
      this.getEntityNews(this.entity.id)
        .then(data => {
          this.newsList = data.data
        })
        .catch(err => {
          console.error(err)
          this.newsList = []
        })
        .finally(() => {
          this.isLoading = false
        })
    }
  },

  watch: {
    entity() {
      this.reset()
    }
  },

  socket: {
    events: {
      'news:new'(eventData) {
        if (
          eventData.project_id === this.currentProduction.id &&
          (!this.taskTypeId || this.taskTypeId === eventData.task_type_id) &&
          (!this.taskStatusId || this.taskStatusId === eventData.task_status_id)
        ) {
          this.reset()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.news {
  overflow: auto;
}

.timeline {
  border-left: 4px solid $blue-light;
  margin-left: 8px;
  padding-bottom: 1em;
  margin-bottom: 1em;

  .timeline-entry {
    padding: 0.5em;
    position: relative;

    .dot {
      position: absolute;
      display: block;
      left: -9px;
      background: $blue-light;
      width: 14px;
      height: 14px;
      border-radius: 16px;
      z-index: 10;

      &.red {
        background: $red;
      }

      &.green {
        background: $light-green;
      }
    }
  }

  .date {
    min-width: 30px;
    margin-left: 0.5em;
    margin-right: 3em;
    font-size: 0.8em;
    color: $grey;
    white-space: nowrap;
  }

  .task-type-wrapper {
    min-width: 100px;
  }

  .validation-wrapper {
    min-width: 60px;
  }
}
</style>
