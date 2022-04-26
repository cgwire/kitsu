<template>
  <div class="mt1 news flexcolumn">
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div class="news" v-else-if="newsList.length > 0">
      <div class="timeline">
        <div
          :key="'news-' + news.id"
          v-for="news in newsList"
        >
          <div class="news-line timeline-entry flexrow">
            <span :class="{
              dot: true,
              red: hasRetakeValue(news),
              green: hasDoneValue(news)
            }"></span>
            <span class="date flexrow-item">
              {{ formatFullDate(news.created_at) }}
            </span>

            <div class="flexrow-item task-type-wrapper">
              <task-type-name
                class="task-type-name"
                :task-type="buildTaskTypeFromNews(news)"
                :production-id="currentProduction.id"
                :is-static="true"
              />
            </div>

            <div class="flexrow-item validation-wrapper">
              <validation-tag
                class="validation-tag"
                :task="taskMap.get(news.task_id)"
                :is-static="true"
                :thin="!news.change"
                />
              </div>

              <div class="flexrow-item comment-content">
                <div>
                  <div class="news-info flexrow">
                    <people-avatar
                      class="flexrow-item"
                      :person="personMap.get(news.author_id)"
                      :size="30"
                      :font-size="14"
                      :is-link="false"
                      v-if="personMap.get(news.author_id)"
                    />
                    <span
                      class="explaination flexrow-item"
                    >
                      <span class="strong person-name">
                        {{ personName(news) }}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    <div v-else>
      {{ $t('entities.news.no_news') }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import moment from 'moment-timezone'
import { formatListMixin } from '@/components/mixins/format'
import { timeMixin } from '@/components/mixins/time'

import Spinner from '@/components/widgets/Spinner'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import TaskTypeName from '@/components/widgets/TaskTypeName'
import ValidationTag from '@/components/widgets/ValidationTag'

export default {
  name: 'entity-news',
  mixins: [formatListMixin, timeMixin],
  components: {
    PeopleAvatar,
    Spinner,
    TaskTypeName,
    ValidationTag
  },

  data () {
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

  mounted () {
    if (!this.entity) return
    this.reset()
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'personMap',
      'taskMap',
      'taskTypeMap',
      'taskStatusMap',
      'timezone'
    ])
  },

  methods: {
    ...mapActions([
      'getEntityNews'
    ]),

    buildTaskTypeFromNews (news) {
      return {
        ...this.taskTypeMap.get(news.task_type_id),
        episode_id: news.episode_id
      }
    },

    getTaskType (news) {
      const task = this.taskMap.get(news.task_id)
      return this.taskTypeMap.get(task.task_type_id)
    },

    hasRetakeValue (news) {
      const taskStatus = this.taskStatusMap.get(news.task_status_id)
      return taskStatus ? news.change && taskStatus.is_retake : false
    },

    hasDoneValue (news) {
      const taskStatus = this.taskStatusMap.get(news.task_status_id)
      return taskStatus ? news.change && taskStatus.is_done : false
    },

    formatTime (date) {
      const utcDate = moment.tz(date, 'UTC').tz(this.timezone)
      return utcDate.format('HH:mm')
    },

    personName (news) {
      const person = this.personMap.get(news.author_id)
      return person ? person.full_name : ''
    },

    reset () {
      this.isLoading = true
      this.getEntityNews(this.entity.id)
        .then(data => {
          this.newsList = data.data
          this.isLoading = false
        })
        .catch(err => {
          console.error(err)
          this.newsList = []
          this.isLoading = false
        })
    }
  },

  watch: {
    entity () {
      if (this.entity) this.reset()
    }
  }
}
</script>

<style lang="scss" scoped>
.news {
  overflow: auto;
}

.timeline-wrapper {
  margin: auto;
  max-width: 875px;
  padding-top: 25px;
  padding-left: 25px;
  padding-right: 25px;
  background: $white;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
}

.timeline {
  border-left: 4px solid $blue-light;
  margin-left: 8px;
  padding-bottom: 2em;

  .subtitle {
    margin-top: 2em;
  }

  .timeline-entry {
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

  .task-type-wrapper {
    min-width: 100px;
  }

  .validation-wrapper {
    min-width: 60px;
  }

  .date {
    min-width: 30px;
  }

  .selected .date {
    color: $dark-grey;
  }

  .explaination,
  .explaination span {
    display: inline;

    &.entity-thumbnail {
      display: inline-block;
    }
  }
}

.date {
  margin-left: 0.5em;
  margin-right: 3em;
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
  padding: 0.5em;
}
</style>
