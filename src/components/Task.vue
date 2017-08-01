<template>
  <div class="page">
    <h1 class="title">
       <div class="level">
         <div class="level-left">
           <div class="level-item">
             {{ currentTask ? currentTask.entity_name : 'Loading...'}}
           </div>
           <div class="level-item" v-if="currentTask">
             <span class="tag animation is-medium">
               {{ currentTask.task_type_name }}
             </span>
           </div>
           <div class="level-item" v-if="currentTask">
             <validation-tag
               :task="currentTask"
               class="is-medium"
             ></validation-tag>
           </div>
         </div>
       </div>
    </h1>

    <div class="columns">
      <div class="column">
        <h2 class="subtitle">
          {{ $t('tasks.preview') }}
        </h2>
			</div>

      <div class="column">
        <h2 class="subtitle validation-title">
          {{ $t('tasks.validation') }}
        </h2>

        <div v-if="currentTask">
          <div class="tabs hidden">
            <ul>
              <li :class="(this.selectedTab === 'validation') ? 'is-active' : '' ">
                <a @click="changeTab('validation')">Validation</a>
              </li>
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
            <comment
              :comment="comment"
              :key="comment.id"
              v-for="comment in currentTaskComments"
            >
            </comment>
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleAvatar from './widgets/PeopleAvatar'
import PeopleName from './widgets/PeopleName'
import AddComment from './widgets/AddComment'
import Comment from './widgets/Comment'
import ValidationTag from './widgets/ValidationTag.vue'

export default {
  name: 'task',
  components: {
    AddComment,
    PeopleAvatar,
    Comment,
    ValidationTag,
    PeopleName
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
      currentTask: null,
      currentTaskComments: []
    }
  },

  created () {
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
      'getTaskComments'
    ])
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
    getCurrentTaskComments () {
      return this.getTaskComments(this.route.params.task_id)
    },
    updateComment () {
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
            this.addCommentLoading = {
              isLoading: false,
              isError: true
            }
          } else {
            this.addCommentLoading = {
              isLoading: false,
              isError: false
            }
            this.currentTaskComments = this.getCurrentTaskComments()
            this.currentTask = this.getCurrentTask()
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.animation {
  background-color: #7986CB;
  color: white;
}

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
</style>
