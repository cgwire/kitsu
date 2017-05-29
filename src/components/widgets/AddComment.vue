<template>
  <article class="add-comment media">
    <figure class="media-left">
      <div class="level">
        <div class="level-left">
          <people-avatar class="level-item" :person="user">
          </people-avatar>
        </div>
      </div>
    </figure>
    <div class="media-content">
      <p class="control">
        <textarea
          class="textarea"
          placeholder="Add a comment..."
          :value="taskCommentText"
          @input="updateComment"
          @keyup.enter.ctrl="addComment"
          :disabled="isAddCommentLoading"
          v-focus>
        </textarea>
        <span class="select">
          <select>
            <option>Waiting For Approval</option>
            <option>Validated (done)</option>
            <option>Retake</option>
            <option>Work In Progress</option>
            <option>Todo</option>
          </select>
        </span>
        <button
          v-if="withButton"
          v-bind:class="{
            'button': true,
            'is-loading': isAddCommentLoading
          }"
          @click="addComment"
        >
          Post status
        </button>
      </p>
    </div>
  </article>
</template>

<script>
import PeopleAvatar from './PeopleAvatar.vue'

export default {
  name: 'add-comment',
  components: {
    PeopleAvatar
  },
  props: [
    'user',
    'addComment',
    'updateComment',
    'taskCommentText',
    'isAddCommentLoading',
    'withButton'
  ]
}
</script>

<style scoped>
.add-comment {
  margin-left: 1em;
}

.add-comment textarea {
  max-height: 5em;
  min-height: 5em;
  margin-bottom: 0.3em;
}
</style>
