<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <h1 class="title" v-if="commentToEdit && commentToEdit.id">
        {{ $t("comments.edit_title") }}
      </h1>

      <form v-on:submit.prevent>
        <div class="field">
          <at-ta
            :members="team"
            name-key="full_name"
            limit="2"
          >
            <template slot="item" slot-scope="team">
              <div class="flexrow">
                <people-avatar
                  class="flexrow-item"
                  :person="team.item"
                  :size="20"
                  :no-cache="true"
                />
                <span class="flexrow-item">
                  {{ team.item.full_name }}
                </span>
              </div>
            </template>

            <textarea
              class="input"
              ref="textField"
              v-model="form.text"
              @keyup.ctrl="runConfirmation"
              v-focus
            >
            </textarea>
          </at-ta>
        </div>
      </form>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          @click="runConfirmation">
          {{ $t("main.confirmation") }}
        </a>
        <button
          class="button is-link"
          @click="$emit('cancel')"
        >
          {{ $t("main.cancel") }}
        </button>
      </p>

      <p class="error has-text-right info-message" v-if="isError">
        {{ $t("assets.edit_fail") }}
      </p>
    </div>
  </div>
</div>
</template>

<script>
import AtTa from 'vue-at/dist/vue-at-textarea'
import PeopleAvatar from '../widgets/PeopleAvatar'

export default {
  name: 'edit-comment-modal',
  components: {
    AtTa,
    PeopleAvatar
  },

  props: [
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'commentToEdit',
    'team'
  ],

  watch: {
    commentToEdit () {
      if (this.commentToEdit && this.commentToEdit.id) {
        this.form.text = this.commentToEdit.text
      } else {
        this.form = {
          text: ''
        }
      }
    },

    active () {
      if (this.active) {
        setTimeout(() => {
          this.$refs.textField.focus()
        }, 100)
      }
    }
  },

  data () {
    if (this.commentToEdit && this.commentToEdit.id) {
      return {
        form: {
          text: this.commentToEdit.text
        }
      }
    } else {
      return {
        form: {
          text: ''
        }
      }
    }
  },

  methods: {
    runConfirmation (event) {
      if (event.keyCode === 13 || !event.keyCode) {
        this.$emit('confirm', {
          id: this.commentToEdit.id,
          ...this.form
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.is-danger {
  color: #ff3860;
  font-style: italic;
}
.title {
  border-bottom: 2px solid #DDD;
  padding-bottom: 0.5em;
  margin-bottom: 1.2em;
}

textarea {
  min-height: 8em;
  padding: 0.5em;
}

.modal-content {
  overflow: initial;
}
</style>
