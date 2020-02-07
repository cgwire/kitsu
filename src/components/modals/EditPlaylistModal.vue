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
        {{ $t("playlists.create_title") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('playlists.fields.name')"
          v-model="form.name"
          @enter="runConfirmation"
          v-focus
        />
        <combobox
          :label="$t('playlists.fields.for_client')"
          :options="forClientOptions"
          v-model="forClient"
        />
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
import Combobox from '../widgets/Combobox'
import TextField from '../widgets/TextField'

import { modalMixin } from './base_modal'

export default {
  name: 'edit-playlist-modal',
  mixins: [modalMixin],
  components: {
    Combobox,
    TextField
  },

  props: [
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'playlistToEdit'
  ],

  data () {
    return {
      forClient: 'false',
      forClientOptions: [
        { label: this.$t('playlists.for_client'), value: 'true' },
        { label: this.$t('playlists.for_studio'), value: 'false' }
      ],
      form: {
        name: this.playlistToEdit.name,
        for_client: this.playlistToEdit.for_client
      }
    }
  },

  methods: {
    runConfirmation () {
      this.form.for_client = this.forClient === 'true'
      this.$emit('confirm', this.form)
    }
  },

  watch: {
    playlistToEdit () {
      if (this.playlistToEdit) {
        this.form.name = this.playlistToEdit.name
      } else {
        this.form = {
          name: ''
        }
      }
    },

    active () {
      if (this.active) {
        this.forClient = this.playlistToEdit.for_client ? 'true' : 'false'
        setTimeout(() => {
          this.$refs.nameField.focus()
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
</style>
