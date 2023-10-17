<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="news page" ref="body" v-scroll="onBodyScroll">
        <div class="timeline-wrapper">
          <div class="has-text-right filler filter-button">
            <span @click="toggleFilters">
              <template v-if="isFiltersDisplayed">
                {{ $t('main.less_filters') }}
              </template>
              <template v-else>
                {{ $t('main.more_filters') }}
              </template>
            </span>
            &bull;

            <span @click="toggleStats">
              <template v-if="isStatsDisplayed">
                {{ $t('news.hide_stats') }}
              </template>
              <template v-else>
                {{ $t('news.show_stats') }}
              </template>
            </span>
          </div>

          <div class="filters flexrow">
            <combobox
              class="flexrow-item selector"
              :label="$t('shots.fields.episode')"
              :options="runningEpisodeOptions"
              v-model="episodeId"
              v-show="isTVShow"
            />
            <combobox-status
              class="flexrow-item selector"
              :label="$t('news.task_status')"
              :task-status-list="taskStatusList"
              v-model="taskStatusId"
            />
            <combobox-task-type
              class="flexrow-item selector"
              :label="$t('news.task_type')"
              :task-type-list="taskTypeList"
              v-model="taskTypeId"
            />
            <div class="field flexrow-item selector small">
              <label class="label person-label">
                {{ $t('main.person') }}
              </label>
              <people-field :people="team" :big="true" v-model="person" />
            </div>
          </div>

          <div class="filters flexrow mt1" v-show="isFiltersDisplayed">
            <date-field
              class="flexrow-item"
              :disabled-dates="{ from: today }"
              :label="$t('main.from')"
              :with-margin="false"
              v-model="after"
            />
            <date-field
              class="flexrow-item"
              :label="$t('main.to')"
              :disabled-dates="{ from: today }"
              :with-margin="false"
              v-model="before"
            />
            <combobox
              class="flexrow-item selector"
              :label="$t('news.infos')"
              :options="previewOptions"
              v-model="previewMode"
            />
          </div>

          <div class="stats mt1" v-if="isStatsDisplayed">
            <span class="news-number">
              {{ newsTotal }} {{ $t('news.news') }}
            </span>
            <template v-for="stat in renderedStats">
              <span
                :key="'stat-value-' + stat.name.toLowerCase()"
                class="tag stat-tag"
                :title="stat.name + ': ' + stat.value"
                :style="{
                  background: stat.color,
                  color: stat.is_default ? '#666' : 'white'
                }"
              >
                {{ stat.name }} : {{ stat.value }}
              </span>
            </template>
          </div>

          <div class="timeline">
            <div
              class="empty-list has-text-centered"
              v-if="!loading.news && (!newsList || newsList.length === 0)"
            >
              {{ $t('news.no_news') }}
            </div>
            <div class="has-text-centered mt2" v-if="loading.news">
              <spinner />
            </div>

            <div
              :key="dayList.length > 0 ? dayList[0].created_at : ''"
              v-for="dayList in newsListByDay(timezone)"
              v-if="!loading.news"
            >
              <div class="has-text-centered subtitle timeline-entry">
                <span class="big-dot"></span>
                {{ dayList.length > 0 ? formatDay(dayList[0].created_at) : '' }}
              </div>
              <div
                :key="'news-' + news.id"
                :ref="'news-' + news.id"
                v-for="(news, index) in dayList"
              >
                <div v-if="previewMode === 'comments'">
                  <div
                    :class="{
                      'news-line': true,
                      'timeline-entry': true,
                      flexrow: true,
                      selected: news.id === currentNewsId
                    }"
                    @click.prevent="onNewsSelected(news)"
                  >
                    <span
                      :class="{
                        dot: true,
                        red: hasRetakeValue(news),
                        green: hasDoneValue(news)
                      }"
                    ></span>
                    <span class="date flexrow-item">
                      {{ formatTime(news.created_at) }}
                    </span>

                    <div
                      class="flexrow-item production-name-wrapper"
                      v-if="isStudio"
                    >
                      <production-name
                        :production="productionMap.get(news.project_id)"
                        only-avatar
                      />
                    </div>

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
                        :task="buildTaskFromNews(news)"
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
                          <span class="explaination flexrow-item">
                            <span class="strong person-name">
                              {{ personName(news) }}
                            </span>
                            <span>
                              {{ $t('news.commented_on') }}
                            </span>
                            <entity-thumbnail
                              class="ml05"
                              :entity="{
                                id: news.task_entity_id,
                                preview_file_id: news.entity_preview_file_id
                              }"
                              v-if="news.entity_preview_file_id"
                            />

                            <span class="strong">
                              {{ news.full_entity_name }}
                            </span>
                          </span>
                        </div>
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
                      selected: news.id === currentNewsId
                    }"
                    @click.prevent="onNewsSelected(news)"
                  >
                    <span
                      :class="{
                        dot: true,
                        red: hasRetakeValue(news),
                        green: hasDoneValue(news)
                      }"
                    ></span>
                    <span class="date flexrow-item">
                      {{ formatTime(news.created_at) }}
                    </span>

                    <div class="flexrow-item task-type-wrapper">
                      <task-type-name
                        class="task-type-name"
                        :task-type="buildTaskTypeFromNews(news)"
                        :production-id="currentProduction.id"
                      />
                    </div>

                    <div class="flexrow-item comment-content">
                      <div>
                        <div class="news-info flexrow">
                          <people-avatar
                            class="flexrow-item"
                            :person="personMap.get(news.author_id)"
                            :size="30"
                            :no-link="true"
                            v-if="personMap.get(news.author_id)"
                          />
                          <span class="explaination flexrow-item">
                            <span class="strong person-name">
                              {{ personName(news) }}
                            </span>
                            <span>
                              {{ $t('news.set_preview_on') }}
                            </span>
                            <entity-thumbnail
                              class="ml05"
                              :entity="{
                                id: news.task_entity_id,
                                preview_file_id: news.entity_preview_file_id
                              }"
                              v-if="news.entity_preview_file_id"
                            />
                            <span class="strong">
                              {{ news.full_entity_name }}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="has-text-centered"
                    v-if="previewMode == 'previews'"
                  >
                    <preview-player
                      :canvas-id="`annotation-canvas-${dayList[0].created_at.substring(
                        0,
                        10
                      )}-${index}`"
                      :previews="[
                        {
                          id: news.preview_file_id,
                          extension: news.preview_file_extension,
                          annotations: news.preview_file_annotations
                        }
                      ]"
                      :read-only="true"
                      :light="true"
                      :big="true"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="side-column" class="column side-column" v-if="currentTask">
      <task-info
        :task="currentTask"
        :is-loading="loading.currentTask"
        with-actions
      />
    </div>
  </div>
</template>

<script>
/*
 * This modules aims at displaying what happened on the production during the
 * last few days.
 * News entry are fetched by page of 50. Loading of older news is done via
 * infinite scrolling.
 */
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import { sortByName, sortPeople } from '@/lib/sorting'
import { formatFullDateWithRevertedTimezone } from '@/lib/time'
import { timeMixin } from '@/components/mixins/time'

import Combobox from '@/components/widgets/Combobox'
import ComboboxStatus from '@/components/widgets/ComboboxStatus'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import DateField from '@/components/widgets/DateField'
import PeopleField from '@/components/widgets/PeopleField'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import ProductionName from '@/components/widgets/ProductionName'
import TaskInfo from '@/components/sides/TaskInfo'
import TaskTypeName from '@/components/widgets/TaskTypeName'
import Spinner from '@/components/widgets/Spinner'
import ValidationTag from '@/components/widgets/ValidationTag'
import PreviewPlayer from '@/components/previews/PreviewPlayer'

export default {
  name: 'production-news-feed',
  mixins: [timeMixin],
  components: {
    Combobox,
    ComboboxStatus,
    ComboboxTaskType,
    DateField,
    EntityThumbnail,
    PeopleAvatar,
    PeopleField,
    PreviewPlayer,
    ProductionName,
    TaskTypeName,
    ValidationTag,
    Spinner,
    TaskInfo
  },

  data() {
    return {
      after: null,
      before: null,
      currentNewsId: null,
      currentPage: 1,
      currentTask: null,
      episodeId: '',
      isFiltersDisplayed: false,
      isStatsDisplayed: false,
      errors: {
        news: false
      },
      loading: {
        more: false,
        news: false,
        currentTask: true
      },
      person: null,
      previewMode: 'comments',
      previewOptions: [
        {
          label: this.$t('news.only_comments'),
          value: 'comments'
        },
        {
          label: this.$t('news.only_previews'),
          value: 'previews'
        }
      ],
      taskStatusId: '',
      taskTypeId: ''
    }
  },

  mounted() {
    this.$options.silent = true
    this.previewMode = localStorage.getItem('news:preview-mode') || 'comments'
    this.taskTypeId = localStorage.getItem('news:task-type-id') || ''
    if (this.$route && this.$route.query && this.$route.query.task_type_id) {
      this.taskTypeId = this.$route.query.task_type_id
    }
    this.taskStatusId = localStorage.getItem('news:task-status-id') || ''
    if (this.$route && this.$route.query && this.$route.query.task_status_id) {
      this.taskStatusId = this.$route.query.task_status_id
    }
    this.before = null
    this.after = null
    this.$options.silent = false
    window.addEventListener('keydown', this.onKeyDown, false)

    if (
      (this.newsList.length === 0 ||
        (this.currentProduction &&
          this.newsList[0].project_id !== this.currentProduction.id)) &&
      !this.loading.news
    ) {
      this.init()
    }
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'isTVShow',
      'newsList',
      'newsTotal',
      'newsStats',
      'newsListByDay',
      'personMap',
      'productionMap',
      'productionTaskStatuses',
      'productionTaskTypes',
      'runningEpisodes',
      'taskStatusMap',
      'taskTypeMap',
      'taskStatusMap',
      'taskStatus',
      'taskTypes',
      'user'
    ]),

    isStudio() {
      return this.$route.path.indexOf('productions') < 0
    },

    params() {
      const params = {
        productionId: this.currentProduction.id,
        only_preview: this.previewMode === 'previews',
        page_size: this.previewMode === 'previews' ? 6 : 50,
        task_type_id: this.taskTypeId !== '' ? this.taskTypeId : undefined,
        task_status_id:
          this.taskStatusId !== '' ? this.taskStatusId : undefined,
        person_id: this.person ? this.person.id : undefined,
        page: this.currentPage,
        episode_id: this.episodeId,
        before: formatFullDateWithRevertedTimezone(this.before, this.timezone),
        after: formatFullDateWithRevertedTimezone(this.after, this.timezone)
      }
      if (this.episodeId === 'all') delete params['episode_id']
      return params
    },

    taskStatusList() {
      return [
        {
          id: '',
          color: '#999',
          short_name: this.$t('news.all')
        }
      ].concat(sortByName([...this.productionTaskStatuses]))
    },

    taskTypeList() {
      return [
        {
          id: '',
          color: '#999',
          name: this.$t('news.all')
        }
      ].concat(sortByName([...this.productionTaskTypes]))
    },

    runningEpisodeOptions() {
      return [
        {
          value: 'all',
          label: this.$t('news.all')
        }
      ].concat(
        this.runningEpisodes.map(episode => {
          return {
            label: episode.name,
            value: episode.id
          }
        })
      )
    },

    team() {
      return sortPeople(
        this.currentProduction.team.map(personId =>
          this.personMap.get(personId)
        )
      )
    },

    renderedStats() {
      if (this.newsStats) {
        return Object.keys(this.newsStats)
          .map(taskStatusId => {
            const name = this.taskStatusMap
              .get(taskStatusId)
              .short_name.toUpperCase()
            const color = this.taskStatusMap.get(taskStatusId).color
            return {
              name,
              color,
              value: this.newsStats[taskStatusId]
            }
          })
          .sort((a, b) => a.name.localeCompare(b.name))
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions(['loadNews', 'loadSingleNews', 'loadMoreNews', 'loadTask']),

    onKeyDown(event) {
      if (this.newsList && this.newsList.length > 0 && event.altKey) {
        let index = this.lastSelection ? this.lastSelection : 0
        if ([37, 38].includes(event.keyCode)) {
          index = index - 1 < 0 ? (index = this.newsList.length - 1) : index - 1
          this.onNewsSelected(this.newsList[index])
        } else if ([39, 40].includes(event.keyCode)) {
          index = index + 1 >= this.newsList.length ? (index = 0) : index + 1
          this.onNewsSelected(this.newsList[index])
        }
      }
    },

    loadFollowingNews() {
      if (!this.loading.more && !this.loading.news) {
        this.loading.more = true
        this.currentPage += 1
        this.loadMoreNews(this.params).then(() => {
          this.loading.more = false
        })
      }
    },

    formatDay(date) {
      const utcDate = moment.tz(date, 'UTC').tz(this.timezone)
      return utcDate.format('LL')
    },

    formatTime(date) {
      const utcDate = moment.tz(date, 'UTC').tz(this.timezone)
      return utcDate.format('HH:mm')
    },

    personName(news) {
      const person = this.personMap.get(news.author_id)
      return person ? person.full_name : ''
    },

    buildTaskFromNews(news) {
      return {
        id: news.task_id,
        task_status_id: news.task_status_id,
        task_type_id: news.task_type_id,
        episode_id: news.episode_id
      }
    },

    buildTaskTypeFromNews(news) {
      return {
        ...this.taskTypeMap.get(news.task_type_id),
        episode_id: news.episode_id
      }
    },

    onNewsSelected(news) {
      this.loading.currentTask = true
      const index = this.newsList.findIndex(n => n.id === news.id)
      if (this.lastSelection !== index) {
        this.lastSelection = index
        this.loadTask({
          taskId: news.task_id
        })
          .then(task => {
            this.loading.currentTask = false
            this.currentTask = task
            this.currentNewsId = news.id
          })
          .catch(console.error)
        this.scrollToLine(news)
      } else {
        this.lastSelection = -1
        this.currentTask = null
        this.currentNewsId = ''
      }
    },

    scrollToLine(news) {
      const newsLine = this.$refs[`news-${news.id}`]
      if (newsLine && this.$refs.body) {
        const margin = 30
        const rect = newsLine[0].getBoundingClientRect()
        const listRect = this.$refs.body.getBoundingClientRect()
        const isBelow = rect.bottom > listRect.bottom - margin
        const isAbove = rect.top < listRect.top + margin

        if (isBelow) {
          const scrollingRequired = rect.bottom - listRect.bottom + margin
          this.setScrollPosition(this.$refs.body.scrollTop + scrollingRequired)
        } else if (isAbove) {
          const scrollingRequired = listRect.top - rect.top + margin
          this.setScrollPosition(this.$refs.body.scrollTop - scrollingRequired)
        }
      }
    },

    setScrollPosition(scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    init() {
      if (this.loading.news) return
      if (!this.$options.silent) {
        this.currentPage = 1
        this.loading.news = true
        this.errors.news = false
        this.currentTask = null
        const query = {
          task_status_id: this.params.task_status_id,
          task_type_id: this.params.task_type_id
        }
        if (this.$router) this.$router.push({ query })
        if (this.$route.path.indexOf('productions') < 0) {
          this.params.isStudio = true
        }
        this.loadNews(this.params)
          .then(() => {
            this.loading.news = false
          })
          .catch(err => {
            console.error(err)
            this.loading.news = false
            this.errors.news = true
          })
      }
    },

    onBodyScroll(event, position) {
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < position.scrollTop + 200) {
        this.loadFollowingNews()
      }
    },

    getPreviewPath(news) {
      const previewId = news.preview_file_id
      const extension = news.preview_file_extension
      return `/api/pictures/originals/preview-files/${previewId}.${extension}`
    },

    getPreviewDlPath(news) {
      const previewId = news.preview_file_id
      return `/api/pictures/originals/preview-files/${previewId}/download`
    },

    hasRetakeValue(news) {
      const taskStatus = this.taskStatusMap.get(news.task_status_id)
      return taskStatus ? news.change && taskStatus.is_retake : false
    },

    hasDoneValue(news) {
      const taskStatus = this.taskStatusMap.get(news.task_status_id)
      return taskStatus ? news.change && taskStatus.is_done : false
    },

    toggleFilters() {
      this.isFiltersDisplayed = !this.isFiltersDisplayed
    },

    toggleStats() {
      this.isStatsDisplayed = !this.isStatsDisplayed
    }
  },

  socket: {
    events: {
      'preview-file:add-file'(eventData) {
        const commentId = eventData.comment_id
        const previewId = eventData.preview_file_id
        const extension = eventData.extension
        this.$store.commit('NEWS_ADD_PREVIEW', {
          previewId,
          commentId,
          extension
        })
      },

      'news:new'(eventData) {
        if (
          eventData.project_id === this.currentProduction.id &&
          (!this.taskTypeId || this.taskTypeId === eventData.task_type_id) &&
          (!this.taskStatusId || this.taskStatusId === eventData.task_status_id)
        ) {
          this.loadSingleNews({
            productionId: this.currentProduction.id,
            newsId: eventData.news_id
          })
        }
      },

      'task:update'(eventData) {
        const relatedNews = this.newsList.find(
          n => n.task_id === eventData.task_id
        )
        if (relatedNews) {
          this.loadSingleNews({
            productionId: this.currentProduction.id,
            newsId: relatedNews.id
          })
        }
      }
    }
  },

  watch: {
    currentProduction() {
      this.init()
    },

    previewMode() {
      localStorage.setItem('news:preview-mode', this.previewMode)
      this.init()
    },

    taskTypeId() {
      localStorage.setItem('news:task-type-id', this.taskTypeId)
      this.init()
    },

    taskStatusId() {
      localStorage.setItem('news:task-status-id', this.taskStatusId)
      this.init()
    },

    person() {
      this.init()
    },

    before() {
      this.init()
    },

    after() {
      this.init()
    },

    $route() {
      this.init()
    },

    episodeId() {
      this.init()
    }
  },

  metaInfo() {
    if (this.currentProduction) {
      return {
        title: `${this.currentProduction.name} ${this.$t('news.title')} - Kitsu`
      }
    } else {
      return {
        title: `${this.$t('news.title')} - Kitsu`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .page {
    background: $dark-grey-light;
  }

  .icon,
  .comment-text {
    color: $light-grey-light;
  }

  a {
    color: $light-grey-light;
  }

  .stats {
    .news-number {
      border: 2px solid $light-grey;
      color: $light-grey;
    }
  }

  .timeline-wrapper {
    background: $dark-grey;
  }

  .timeline {
    border-color: $blue;

    .dot {
      background: $blue;
    }

    .big-dot {
      background: $blue;
    }

    .selected .date {
      color: $light-grey;
    }
  }
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
  flex: 1 1 auto;
  padding-top: 60px;
  background: $white-grey-light;
  height: 100%;
  overflow: hidden;
}

.news {
  background: $white-grey-light;
  width: 100%;
  padding: 0;
  overflow-y: auto;
  height: 100%;
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
  padding-left: 25px;
  padding-bottom: 2em;

  .subtitle {
    margin-top: 2em;
  }

  .timeline-entry {
    position: relative;

    .big-dot {
      position: absolute;
      display: block;
      left: -33px;
      top: 3px;
      background: $blue-light;
      width: 12px;
      height: 12px;
      border-radius: 6px;
    }

    .dot {
      position: absolute;
      display: block;
      left: -31px;
      background: $blue-light;
      width: 8px;
      height: 8px;
      border-radius: 4px;

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
  cursor: pointer;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  border-radius: 0.5em;

  &:hover {
    background: var(--background-hover);
  }

  &.selected {
    background: var(--background-selected);
  }
}

.preview {
  margin: 0em auto 2em auto;
  max-width: 800px;
}

.side-column {
  width: 450px;
  min-width: 450px;
  max-width: 450px;
}

.selector {
  margin-bottom: 0;
  margin-right: 1em;
}

.person-label {
  margin-top: 5px;
  margin-bottom: 4px;
}

.filter-button {
  color: $grey;
  cursor: pointer;
  float: right;
  text-transform: lowercase;
}

.stats {
  text-align: left;
  margin-top: 2em;

  .news-number {
    font-weight: bold;
    border: 2px solid $grey-strong;
    border-radius: 1em;
    padding: 0.3em;
    margin-right: 0.8em;
  }

  .stat-tag {
    margin-right: 1em;
    margin-top: 0;
    margin-bottom: 1em;
  }
}
</style>
