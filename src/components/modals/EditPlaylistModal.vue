<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <h1 class="title" v-if="playlistToEdit && playlistToEdit.id">
        {{ $t("playlists.edit_title") }} {{ playlistToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("playlists.no_playlist") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('playlists.fields.name')"
          v-model="form.name"
          @enter="runConfirmation"
          v-focus
        >
        </text-field>
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
          @click="$emit('cancel')"
          class="button is-link">
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
import TextField from '../widgets/TextField'

import { modalMixin } from './base_modal'

export default {
  name: 'edit-playlist-modal',
  mixins: [modalMixin],
  components: {
    TextField
  },

  props: [
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'playlistToEdit'
  ],

  watch: {
    playlistToEdit () {
      if (this.playlistToEdit && this.playlistToEdit.id) {
        this.form.name = this.playlistToEdit.name
      } else {
        this.form = {
          name: ''
        }
      }
    },

    active () {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    }
  },

  data () {
    if (this.playlistToEdit && this.playlistToEdit.id) {
      return {
        form: {
          name: this.playlistToEdit.name
        }
      }
    } else {
      return {
        form: {
          name: ''
        }
      }
    }
  },

  methods: {
    runConfirmation () {
      this.$emit('confirm', this.form)
    }
  }
}
</script>

<style lang="scss" scoped>
.is-danger {
  color: #ff3860;
  font-style: italic;
}
</style>
