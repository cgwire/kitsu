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
        <textarea-field
          ref="textField"
          :label="$t('comments.fields.text')"
          v-model="form.text"
          @enter="runConfirmation"
          v-focus
        >
        </textarea-field>
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
        <router-link
          :to="cancelRoute"
          class="button is-link">
          {{ $t("main.cancel") }}
        </router-link>
      </p>

      <p class="error has-text-right info-message" v-if="isError">
        {{ $t("assets.edit_fail") }}
      </p>
    </div>
  </div>
</div>
</template>

<script>
import Combobox from '../widgets/Combobox'
import TextareaField from '../widgets/TextareaField'

export default {
  name: 'edit-comment-modal',
  components: {
    Combobox,
    TextareaField
  },

  props: [
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'commentToEdit'
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
    runConfirmation () {
      this.$emit('confirm', {
        id: this.commentToEdit.id,
        ...this.form
      })
    }
  }
}
</script>

<style scoped>
.is-danger {
  color: #ff3860;
  font-style: italic;
}
.title {
  border-bottom: 2px solid #DDD;
  padding-bottom: 0.5em;
  margin-bottom: 1.2em;
}
</style>
