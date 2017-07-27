<template>
  <div class="home page">
    <h1 class="title">
       <div class="level">
         <div class="level-left">
           <div class="level-item">
             {{ task.loaded ? task.name : 'loading' }}
           </div>
           <div class="level-item">
             <span class="tag animation is-medium">
             {{ task.task_type ? task.task_type.name : ''}}
             </span>
           </div>
           <div class="level-item">
             <span
               :class="'tag is-medium ' + this.getStatusClass(task)">
               {{ getTaskStatus(task) }}
             </span>
           </div>
           <div class="level-item">
             <span :class="{
               tag: true,
               'is-medium': true,
               'is-danger': (task.nb_retakes > 3)
             }"
               v-if="task.nb_retakes > 0"
             >
               {{ task.nb_retakes }}
             </span>
           </div>

         </div>
       </div>
    </h1>

    <div class="columns">
      <div class="column">
        <h2 class="subtitle">Preview</h2>
			</div>

      <div class="column">
        <h2 class="subtitle validation-title">Infos</h2>

        <div v-if="task.loaded">
          <div class="tabs">
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
              :taskCommentText="taskCommentText"
              :updateComment="updateComment"
              :addComment="addComment"
              :isAddCommentLoading="isAddCommentLoading"
              :user="user"
              :withButton="true"
            >
            </add-comment>
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
              <td>{{ task.project.name }}</td>
            </tr>
            <tr>
              <td><strong>Due date</strong></td>
              <td>{{ task.due_date ? task.due_date.substring(0, 10) : '' }}</td>
            </tr>
            <tr>
              <td><strong>Start date</strong></td>
              <td>{{ task.start_date ? task.start_date.substring(0, 10) : '' }}</td>
            </tr>

            <tr>
              <td><strong>Real start date</strong></td>
              <td>{{ task.real_start_date ? task.real_start_date.substring(0, 10) : '' }}</td>
            </tr>

            <tr>
              <td><strong>End date</strong></td>
              <td>{{ task.end_date ? task.end_date.substring(0, 10) : '' }}</td>
            </tr>
            <tr>
              <td><strong>Duration since last retake</strong></td>
              <td>10 hours</td>
            </tr>
            <tr>
              <td><strong>Duration</strong></td>
              <td>{{ task.duration ? (task.duration - 3600) / 3600 : '' }} hours</td>
            </tr>
            <tr>
              <td><strong>Estimation</strong></td>
              <td>{{ task.duration ? task.duration / 3600 : '' }} hours</td>
            </tr>
            <tr>
              <td><strong>Status</strong></td>
              <td>
              </td>
            </tr>
          </table>
        </div>

        <div class="has-text-centered" v-else>
          <img src="../assets/spinner.svg" />
        </div>
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
      selectedTab: 'validation'
    }
  },
  created () {
    if (!this.isAddCommentLoading) {
      const taskId = { id: this.route.params.task_id }
      if (!this.task.loaded) {
        this.$store.dispatch('loadTask', taskId)
      } else {
        this.$store.dispatch('loadComments', { objectId:
          this.route.params.task_id
        })
      }
    }
  },
  computed: {
    ...mapGetters([
      'tasks',
      'comments',
      'commentTexts',
      'route',
      'user',
      'isAddCommentLoading'
    ]),
    task () {
      let task = this.tasks.find((todo) => {
        return todo.id === this.route.params.task_id
      })

      if (task === undefined) {
        task = {loaded: false}
      } else {
        task.loaded = true
      }
      return task
    },
    taskComments () {
      return this.comments[this.route.params.task_id] || []
    },
    taskCommentText () {
      return this.commentTexts[this.route.params.task_id]
    }
  },
  methods: {
    ...mapActions([
    ]),
    changeTab (tab) {
      this.selectedTab = tab
      console.log(tab)
    },
    updateComment (event) {
      const taskId = this.route.params.task_id
      this.$store.dispatch('updateComment', {
        objectId: taskId,
        text: event.target.value
      })
    },
    addComment (event) {
      const taskId = this.route.params.task_id
      this.$store.dispatch('addComment', {
        objectId: taskId,
        user: this.user
      })
    },
    renderAssignees (task) {
      let personNames = []
      for (let person of task.persons) {
        personNames.push(person.first_name + ' ' + person.last_name)
      }
      return personNames.join(', ')
    },
    getTaskStatus (task) {
      if (task && task.task_status_name) {
        return task.task_status_name
      } else if (task && task.task_status) {
        return task.task_status.name
      } else {
        return ''
      }
    },
    getStatusClass (task) {
      const taskStatus = this.getTaskStatus(task)
      if (taskStatus === 'WIP') {
        return 'is-info'
      } else if (taskStatus === 'Ready for Next Stage') {
        return 'is-success'
      } else if (taskStatus === 'Confirmed') {
        return 'is-warning'
      } else if (taskStatus === 'DONE') {
        return 'is-success'
      } else if (taskStatus === 'WFA') {
        return 'is-primary'
      } else {
        return ''
      }
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
</style>
