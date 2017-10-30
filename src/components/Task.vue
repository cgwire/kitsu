<template>
  <div class="page fixed-page">
    <h1 class="title">
       <div class="level">
         <div class="level-left">
           <div class="level-item">
             {{ currentTask ? title : 'Loading...'}}
           </div>
           <div class="level-item" v-if="currentTask">
             <span
               class="tag is-medium"
               :style="{
                 'background-color': currentTask.task_type_color,
                 color: 'white'
               }">
               {{ currentTask.task_type_name }}
             </span>
           </div>
           <div class="level-item" v-if="currentTask">
             <validation-tag
               :task="currentTask"
               class="is-medium"
             ></validation-tag>
           </div>
           <div v-if="currentTask">
             <people-avatar
               :key="personId"
               :person="personMap[personId]"
               :size="30"
               :font-size="16"
               v-for="personId in currentTask.assignees">
             </people-avatar>
           </div>
         </div>
         <div class="level-right">
           <button-link
             class="level-item"
             text=""
             icon="delete"
             :path="currentTask ? `/tasks/${currentTask.id}/delete` : ''"
           >
           </button-link>
         </div>
       </div>
    </h1>

    <div class="column-container">
      <div class="task-column">
        <h2 class="subtitle">
          {{ $t('tasks.preview') }}
        </h2>
        <div class="preview-picture">
          <img
            v-if="currentTaskPreviews.length > 0"
            :src="getPreviewPath()" />
        </div>
        <div class="preview-list" v-if="currentTaskPreviews.length > 0">
          <preview-row
            :preview="preview"
            :taskId="currentTask ? currentTask.id : ''"
            :key="preview.id"
            v-for="preview in currentTaskPreviews"
          >
          </preview-row>
        </div>
        <div v-else>
          <em>
            {{ $t('tasks.no_preview')}}
          </em>
        </div>
			</div>


      <div class="task-column">
        <h2 class="subtitle validation-title">
          {{ $t('tasks.validation') }}
        </h2>

        <div v-if="currentTask">
          <div class="tabs hidden">
            <ul>
              <li :class="(this.selectedTab === 'validation') ? 'is-active' : '' ">
                <a @click="changeTab('validation')">Validation</a> </li>
              <li :class="(this.selectedTab === 'metadatas') ? 'is-active' : '' ">
                <a @click="changeTab('metadatas')">Metadatas</a></li>
              </li>
            </ul>
          </div>

          <div
            :class="{
              validation: true,
              hidden: selectedTab !== 'validation'
            }"
          >
            <add-comment
              :addComment="addComment"
              :isAddCommentLoading="addCommentLoading.isLoading"
              :user="user"
              :task="currentTask"
              :taskStatusOptions="taskStatusOptions"
            >
            </add-comment>
            <div class="comments" v-if="currentTaskComments.length > 0">
              <comment
                :comment="comment"
                :key="comment.id"
                v-for="comment in currentTaskComments"
              >
              </comment>
            </div>
            <div class="no-comment" v-else>
              <em>
                {{ $t('tasks.no_comment')}}
              </em>
            </div>
          </div>

          <table
            :class="{
              table: true,
              hidden: selectedTab !== 'metadatas'
            }"
          >
            <tr>
              <td><strong>Project</strong></td>
              <td>{{ currentTask.project_name }}</td>
            </tr>
            <tr>
              <td><strong>Due date</strong></td>
              <td>{{ currentTask.due_date ? currentTask.due_date.substring(0, 10) : '' }}</td>
            </tr>
            <tr>
              <td><strong>Start date</strong></td>
              <td>{{ currentTask.start_date ? currentTask.start_date.substring(0, 10) : '' }}</td>
            </tr>

            <tr>
              <td><strong>Real start date</strong></td>
              <td>{{ currentTask.real_start_date ? currentTask.real_start_date.substring(0, 10) : '' }}</td>
            </tr>

            <tr>
              <td><strong>End date</strong></td>
              <td>{{ currentTask.end_date ? currentTask.end_date.substring(0, 10) : '' }}</td>
            </tr>
            <tr>
              <td><strong>Duration</strong></td>
              <td>{{ currentTask.duration ? (currentTask.duration - 3600) / 3600 : '' }} hours</td>
            </tr>
            <tr>
              <td><strong>Estimation</strong></td>
              <td>{{ currentTask.duration ? currentTask.duration / 3600 : '' }} hours</td>
            </tr>
          </table>

        </div>

        <div class="has-text-centered" v-else>
          <img src="../assets/spinner.svg" />
        </div>

			</div>
    </div>

    <add-preview-modal
      :active="display.addPreview"
      :is-loading="loading.addPreview"
      :is-error="errors.addPreview"
      :cancel-route="currentTask ? '/tasks/' + currentTask.id : ''"
      :form-data="addPreviewFormData"
      @fileselected="selectFile"
      @confirm="createPreview"
    >
    </add-preview-modal>

    <delete-modal
      :active="display.deleteTask"
      :is-loading="loading.deleteTask"
      :is-error="errors.deleteTask"
      :cancel-route="currentTask ? `/tasks/${currentTask.id}` : ''"
      :text="deleteText"
      :error-text="$t('tasks.delete_error')"
      @confirm="confirmDeleteTask"
    >
    </delete-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleAvatar from './widgets/PeopleAvatar'
import PeopleName from './widgets/PeopleName'
import AddComment from './widgets/AddComment'
import Comment from './widgets/Comment'
import PreviewRow from './widgets/PreviewRow'
import ValidationTag from './widgets/ValidationTag'
import AddPreviewModal from './modals/AddPreviewModal'
import DeleteModal from './widgets/DeleteModal'
import ButtonLink from './widgets/ButtonLink'

export default {
  name: 'task',
  components: {
    AddComment,
    ButtonLink,
    PeopleAvatar,
    Comment,
    ValidationTag,
    PeopleName,
    PreviewRow,
    AddPreviewModal,
    DeleteModal
  },

  data () {
    return {
      selectedTab: 'validation',
      taskLoading: {
        isLoading: true,
        isError: false
      },
      addCommentLoading: {
        isLoading: false,
        isError: false
      },
      display: {
        addPreview: false,
        deleteTask: false
      },
      loading: {
        addPreview: false,
        deleteTask: false
      },
      errors: {
        addPreview: false,
        deleteTask: false
      },
      currentTask: null,
      currentTaskComments: [],
      currentTaskPreviews: [],
      addPreviewFormData: null
    }
  },

  created () {
    this.$store.commit('CLEAR_SELECTED_TASKS')
    let task = this.getCurrentTask()
    if (!task) {
      this.taskLoading = {
        isLoading: true,
        isError: false
      }
      this.$store.dispatch('loadTask', {
        taskId: this.route.params.task_id,
        callback: (err) => {
          if (err) {
            this.taskLoading = {
              isLoading: false,
              isError: true
            }
          } else {
            this.taskLoading = {
              isLoading: false,
              isError: false
            }
            task = this.getCurrentTask()
            this.currentTask = task
            this.$store.dispatch('loadTaskComments', {
              taskId: this.route.params.task_id,
              callback: (err) => {
                if (err) {
                } else {
                  this.currentTaskComments = this.getCurrentTaskComments()
                  this.currentTaskPreviews = this.getCurrentTaskPreviews()
                  this.currentComment = this.getCurrentComment()
                }
              }
            })
          }
        }
      })
    } else {
      this.currentTask = task
      this.$store.dispatch('loadTaskComments', {
        taskId: this.route.params.task_id,
        callback: (err) => {
          if (err) {
          } else {
            this.currentTaskComments = this.getCurrentTaskComments()
            this.currentTaskPreviews = this.getCurrentTaskPreviews()
            this.currentComment = this.getCurrentComment()
          }
        }
      })
    }
  },

  computed: {
    ...mapGetters([
      'tasks',
      'comments',
      'commentTexts',
      'route',
      'user',
      'taskStatusOptions',
      'getTask',
      'getTaskComments',
      'getTaskPreviews',
      'getTaskComment',
      'personMap'
    ]),
    title () {
      if (this.currentTask) {
        return `${this.currentTask.project_name} / ${this.currentTask.entity_name}`
      } else {
        return 'Loading...'
      }
    },
    deleteText () {
      if (this.currentTask) {
        return this.$t('main.delete_text', {
          name: `${this.currentTask.entity_name}` +
                ` / ${this.currentTask.task_type_name}`
        })
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions([
    ]),
    changeTab (tab) {
      this.selectedTab = tab
    },
    getCurrentTask () {
      return this.getTask(this.route.params.task_id)
    },
    getCurrentComment () {
      if (this.route.params.comment_id) {
        return this.getTaskComment(
          this.route.params.task_id,
          this.route.params.comment_id
        )
      }
    },
    getCurrentTaskComments () {
      return this.getTaskComments(this.route.params.task_id)
    },
    getCurrentTaskPreviews () {
      return this.getTaskPreviews(this.route.params.task_id)
    },
    getCurrentTaskPath () {
      if (this.currentTask) {
        return `/tasks/${this.currentTask.id}`
      } else {
        return ''
      }
    },
    getPreviewPath () {
      const previewId = this.route.params.preview_id
      if (previewId) {
        return `/api/thumbnails/preview-files/${previewId}.png`
      } else {
        return `/api/thumbnails/preview-files/${this.currentTaskPreviews[0].id}.png`
      }
    },
    addComment (comment, taskStatusId) {
      this.addCommentLoading = {
        isLoading: true,
        isError: false
      }
      this.$store.dispatch('commentTask', {
        taskId: this.route.params.task_id,
        taskStatusId: taskStatusId,
        comment: comment,
        callback: (err) => {
          if (err) {
            console.log(err)
            this.addCommentLoading = {
              isLoading: false,
              isError: true
            }
          } else {
            this.addCommentLoading = {
              isLoading: false,
              isError: false
            }
            this.currentTaskPreviews = this.getCurrentTaskPreviews()
            this.currentTaskComments = this.getCurrentTaskComments()
            this.currentTask = this.getCurrentTask()
          }
        }
      })
    },
    handleModalsDisplay () {
      const path = this.$store.state.route.path

      if (path.indexOf('add-preview') > 0) {
        this.display.addPreview = true
        this.display.deleteTask = false
      } else if (path.indexOf('delete') > 0) {
        this.display.deleteTask = true
        this.display.addPreview = false
        this.currentComment = null
      } else {
        this.display.addPreview = false
        this.display.deleteTask = false
        this.currentComment = null
      }
    },

    selectFile (formData) {
      this.$store.commit('PREVIEW_FILE_SELECTED', formData)
    },

    createPreview () {
      this.errors.addPreview = false
      this.loading.addPreview = true
      this.$store.dispatch('addPreview', {
        taskId: this.route.params.task_id,
        commentId: this.route.params.comment_id,
        callback: (err, preview) => {
          if (err) {
            this.errors.addPreview = true
          } else {
            this.$router.push(`/tasks/${this.route.params.task_id}` +
                              `/previews/${preview.id}`)
          }
          this.loading.addPreview = false
          this.currentTaskPreviews = this.getCurrentTaskPreviews()
          this.currentTaskComments = this.getCurrentTaskComments()
        }
      })
    },

    confirmDeleteTask () {
      this.loading.deleteTask = true
      this.errors.deleteTask = false
      const type = this.currentTask.entity_type_name

      this.$store.dispatch('deleteTask', {
        task: this.currentTask,
        callback: (err) => {
          if (err) {
            this.loading.deleteTask = false
            this.errors.deleteTask = true
          } else {
            if (type === 'Shot') {
              this.$router.push('/shots')
            } else {
              this.$router.push('/assets')
            }
          }
        }
      })
    }
  },
  mounted () {
    this.handleModalsDisplay()
  },
  watch: {
    $route () { this.handleModalsDisplay() }
  }
}
</script>

<style scoped>
.title {
  margin-top: 1em;
}

.source {
  color: #AAA;
  font-size: 0.8em;
}

video {
  width: 100%;
}

.hidden {
  display: none;
}

.validation-buttons button {
  width: 100%;
  margin-bottom: 0.3em;
  border-width: 2px;
  font-weight: bold;
}

.page {
  overflow: hidden;
}

.preview-row {
  margin-bottom: 0.5em;
}

.comments,
.no-comment {
  margin-top: 2em;
}

.column-container {
  display: flex;
  flex-direction: row;
}

.task-column {
  width: 50%;
  padding: 1em;
  overflow-y: auto;
}
</style>
