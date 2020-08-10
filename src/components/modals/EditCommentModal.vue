<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
    <div class="box">
      <h1 class="title" v-if="commentToEdit && commentToEdit.id">
        {{ $t("comments.edit_title") }}
      </h1>

      <form v-on:submit.prevent>
        <combo-box-status
          :label="$t('task_status.title')"
          :task-status-list="taskStatusForCurrentUser"
          v-model="form.task_status_id"
        />

        <div class="field">
        <label class="label">
          {{ $t('comments.text') }}
        </label>
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

      <modal-footer
        :error-text="$t('comments.edit_error')"
        :is-error="isError"
        :is-loading="isLoading"
        @confirm="runConfirmation"
        @cancel="$emit('cancel')"
      />
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { modalMixin } from './base_modal'

import AtTa from 'vue-at/dist/vue-at-textarea'
import ComboBoxStatus from '../widgets/ComboboxStatus.vue'
import ModalFooter from './ModalFooter'
import PeopleAvatar from '../widgets/PeopleAvatar'

export default {
  name: 'edit-comment-modal',
  mixins: [modalMixin],
  components: {
    AtTa,
    ComboBoxStatus,
    ModalFooter,
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

  data () {
    if (this.commentToEdit && this.commentToEdit.id) {
      return {
        form: {
          text: this.commentToEdit.text,
          task_status_id: this.commentToEdit.task_status_id
        }
      }
    } else {
      return {
        form: {
          text: '',
          task_status_id: null
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'taskStatusForCurrentUser'
    ])
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
  },

  watch: {
    commentToEdit () {
      if (this.commentToEdit && this.commentToEdit.id) {
        this.form.text = this.commentToEdit.text
        this.form.task_status_id = this.commentToEdit.task_status_id
      } else {
        this.form = {
          text: '',
          task_status_id: null
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
  }
}
</script>

<style lang="scss" scoped>
.is-danger {
  color: #ff3860;
  font-style: italic;
}

textarea {
  min-height: 8em;
  padding: 0.5em;
}

.modal-content {
  overflow: initial;
}
</style>
