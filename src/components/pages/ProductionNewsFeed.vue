<template>
<div
  class="columns fixed-page"
>
  <div
    class="column main-column"
  >
    <div
      class="news page"
      ref="body"
      v-scroll="onBodyScroll"
    >
      <div class="timeline-wrapper">
      <div class="timeline">
      <div
        class="empty-list has-text-centered"
        v-if="!loading.news && (!newsList || newsList.length === 0)"
      >
        {{ $t('news.no_news') }}
      </div>
      <div
        class="has-text-centered"
        v-if="loading.news"
      >
        <spinner />
      </div>

      <div
        :key="dayList.length > 0 ? dayList[0].created_at : ''"
        v-for="dayList in newsListByDay"
      >
        <div class="has-text-centered subtitle timeline-entry">
          <span class="big-dot"></span>
          {{ dayList.length > 0 ? formatDay(dayList[0].created_at) : ''}}
        </div>
        <div
          :key="'news-' + news.id"
          v-for="news in dayList"
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
            <span class="dot"></span>
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

            <div class="flexrow-item validation-wrapper">
              <validation-tag
                class="validation-tag"
                :task="buildTaskFromNews(news)"
                v-if="news.change"
              />
            </div>

            <div class="flexrow-item comment-content">
              <div>
                <div class="news-info flexrow">
                  <people-avatar
                    class="flexrow-item"
                    :person="personMap[news.author_id]"
                    :size="30"
                    :no-link="true"
                    v-if="personMap[news.author_id]"
                  />
                  <span
                    class="explaination flexrow-item"
                  >
                    <span class="strong person-name">
                      {{ personName(news) }}
                    </span>
                    <span>
                      {{ $t('news.commented_on') }}
                    </span>
                    <span class="strong">
                      {{ ' ' + news.project_name }} / {{ news.full_entity_name }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="preview" v-if="news.preview_file_id">
            <div
              :class="{
                'news-line': true,
                'timeline-entry': true,
                flexrow: true,
                selected: news.id === currentNewsId
              }"
              @click.prevent="onNewsSelected(news)"
            >
              <span class="date flexrow-item">
              </span>
              <div class="flexrow-item task-type-wrapper">
              </div>
              <div class="flexrow-item validation-wrapper">
              </div>

              <div class="flexrow-item comment-content">
                <div>
                  <div class="news-info flexrow">
                    <people-avatar
                      class="flexrow-item"
                      :person="personMap[news.author_id]"
                      :size="30"
                      :no-link="true"
                      v-if="personMap[news.author_id]"
                    />
                    <span
                      class="explaination flexrow-item"
                    >
                      <span class="strong person-name">
                        {{ personName(news) }}
                      </span>
                      <span>
                        {{ $t('news.set_preview_on') }}
                      </span>
                      <span class="strong">
                        {{ ' ' + news.project_name }} / {{ news.full_entity_name }}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="has-text-centered"
            >
              <div
                v-if="news.preview_file_extension == 'mp4'"
              >
                <video-player
                  :preview="{id: news.preview_file_id}"
                  :task-type-map="taskTypeMap"
                  :read-only="true"
                  :light="true"
                />
              </div>

              <model-viewer
                class="model-viewer"
                :preview-url="getPreviewPath(news)"
                :preview-dl-path="getPreviewDlPath(news)"
                :light="true"
                :read-only="true"
                v-else-if="news.preview_file_extension == 'obj'"
              />

              <picture-viewer
                :preview="{previews: [{id: news.preview_file_id}]}"
                :light="true"
                :read-only="true"
                ref="preview-picture"
                v-else-if="news.preview_file_extension == 'png'"
              />

              <div
                class="preview-standard-file"
                v-else
              >
                <a
                  class="button"
                  ref="preview-file"
                  :href="getPreviewDlPath(news)"
                >
                  <download-icon class="icon" />
                  <span class="text">
                    {{ $t('tasks.download_pdf_file', {extension: news.preview_file_extension}) }}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
  </div>

  <div
    class="column side-column is-hidden-mobile hide-small-screen"
    v-if="currentTask"
  >
    <task-info
      :task="currentTask"
      :is-loading="loading.currentTask"
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
import {
  DownloadIcon
} from 'vue-feather-icons'
import moment from 'moment-timezone'

import EntityThumbnail from '../widgets/EntityThumbnail'
import ModelViewer from '../previews/ModelViewer'
import PeopleAvatar from '../widgets/PeopleAvatar'
import PictureViewer from '../previews/PictureViewer'
import TaskInfo from '../sides/TaskInfo'
import TaskTypeName from '../widgets/TaskTypeName'
import Spinner from '../widgets/Spinner'
import ValidationTag from '../widgets/ValidationTag'
import VideoPlayer from '../previews/VideoPlayer'

export default {
  name: 'news-page',
  components: {
    DownloadIcon,
    EntityThumbnail,
    ModelViewer,
    PeopleAvatar,
    PictureViewer,
    TaskTypeName,
    ValidationTag,
    Spinner,
    TaskInfo,
    VideoPlayer
  },

  data () {
    return {
      loading: {
        more: false,
        news: false,
        currentTask: true
      },
      errors: {
        news: false
      },
      currentNewsId: null,
      currentPage: 1,
      currentTask: null
    }
  },

  mounted () {
    if (
      (
        this.newsList.length === 0 ||
        this.newsList[0].project_id !== this.currentProduction.id
      ) &&
      !this.loading.news
    ) {
      this.init()
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'newsList',
      'newsListByDay',
      'personMap',
      'taskTypeMap',
      'taskStatusMap'
    ])
  },

  methods: {
    ...mapActions([
      'loadNews',
      'loadSingleNews',
      'loadMoreNews',
      'loadTask'
    ]),

    loadFollowingNews () {
      if (!this.loading.more && !this.loading.news) {
        this.loading.more = true
        this.currentPage += 1
        this.loadMoreNews({
          productionId: this.currentProduction.id,
          page: this.currentPage
        })
          .then(() => {
            this.loading.more = false
          })
      }
    },

    formatDay (date) {
      const utcDate = moment.tz(date, 'UTC')
      return utcDate.format('LL')
    },

    formatTime (date) {
      const utcDate = moment.tz(date, 'UTC')
      return utcDate.format('HH:mm')
    },

    personName (news) {
      const person = this.personMap[news.author_id]
      return person ? person.full_name : ''
    },

    buildTaskFromNews (news) {
      return {
        id: news.task_id,
        task_status_id: news.task_status_id,
        task_type_id: news.task_type_id,
        episode_id: news.episode_id
      }
    },

    buildTaskTypeFromNews (news) {
      return {
        ...this.taskTypeMap[news.task_type_id],
        episode_id: news.episode_id
      }
    },

    onNewsSelected (news) {
      this.loading.currentTask = true
      this.loadTask({
        taskId: news.task_id,
        callback: (err, task) => {
          if (err) console.log(err)
          this.loading.currentTask = false
          this.currentTask = task
          this.currentNewsId = news.id
        }
      })
    },

    init () {
      this.currentPage = 1
      this.loading.news = true
      this.errors.news = false
      this.currentTask = null
      this.loadNews(this.currentProduction.id)
        .then(() => {
          this.loading.news = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.news = false
          this.errors.news = true
        })
    },

    onBodyScroll (event, position) {
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < (position.scrollTop + 100) &&
         this.newsList.length % 50 === 0) {
        this.loadFollowingNews()
      }
    },

    getPreviewPath (news) {
      let previewId = news.preview_file_id
      const extension = news.preview_file_extension
      return `/api/pictures/originals/preview-files/${previewId}.${extension}`
    },

    getPreviewDlPath (news) {
      let previewId = news.preview_file_id
      return `/api/pictures/originals/preview-files/${previewId}/download`
    }
  },

  watch: {
    currentProduction () {
      if (!this.loading.news) this.init()
    }
  },

  socket: {
    events: {
      'preview-file:add-file' (eventData) {
        const commentId = eventData.comment_id
        const previewId = eventData.preview_file_id
        const extension = eventData.extension
        this.$store.commit('NEWS_ADD_PREVIEW', {
          previewId,
          commentId,
          extension
        })
      },

      'news:new' (eventData) {
        console.log(eventData, eventData.project_id, this.currentProduction.id)
        if (eventData.project_id === this.currentProduction.id) {
          this.loadSingleNews({
            productionId: this.currentProduction.id,
            newsId: eventData.news_id
          })
        }
      }
    }
  },

  metaInfo () {
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

  .news-line {
    &.selected {
      border-left: 6px solid $dark-purple;
    }
  }

  .icon,
  .comment-text {
    color: $light-grey-light;
  }

  a {
    color: $light-grey-light;
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
  border-right: 3px solid $light-grey;
  flex: 1 1 auto;
  padding-top: 70px;
  background: $white-grey-light;
  overflow-y: hidden;
  height: 100%;
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
      left: -37px;
      background: $blue-light;
      width: 8px;
      height: 8px;
      border-radius: 4px;
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

  .explaination,
  .explaination span {
    display: inline;
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
  border-left: 6px solid transparent;
  padding-left: 1em;
  align-items: middle;
  cursor: pointer;
  margin: 1em 0;

  &:hover {
    border-left: 6px solid $grey;
  }

  &.selected {
    border-left: 6px solid $purple;
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
</style>
