<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
    <div class="box">
      <h1 class="title" v-if="isEditing">
        {{ $t("playlists.edit_title") }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("playlists.create_title") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('playlists.fields.name')"
          @enter="runConfirmation"
          v-model="form.name"
          v-focus
        />
        <combobox
          :label="$t('playlists.fields.for_client')"
          :options="forClientOptions"
          v-model="forClient"
        />
        <combobox
          :label="$t('playlists.fields.for_entity')"
          :options="forEntityOptions"
          v-model="form.for_entity"
          v-if="!isEditing"
        />
      </form>

      <modal-footer
        :error-text="$t('playlists.edit_error')"
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
import Combobox from '../widgets/Combobox'
import ModalFooter from './ModalFooter'
import TextField from '../widgets/TextField'

import { mapGetters } from 'vuex'
import { modalMixin } from './base_modal'

export default {
  name: 'edit-playlist-modal',
  mixins: [modalMixin],
  components: {
    Combobox,
    ModalFooter,
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
        for_entity: this.playlistToEdit.for_entity || this.defaultForEntity,
        for_client: this.playlistToEdit.for_client,
        is_for_all: this.currentEpisode && this.currentEpisode.id === 'all'
      }
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode'
    ]),

    isEditing () {
      return this.playlistToEdit && this.playlistToEdit.id
    },

    forEntityOptions () {
      if (this.currentEpisode &&
          ['main', 'all'].includes(this.currentEpisode.id)) {
        return [
          { label: this.$t('assets.title'), value: 'asset' }
        ]
      } else {
        return [
          { label: this.$t('assets.title'), value: 'asset' },
          { label: this.$t('shots.title'), value: 'shot' }
        ]
      }
    },

    defaultForEntity () {
      const isAssetEpisode =
        this.currentEpisode && ['all', 'main'].includes(this.currentEpisode.id)
      return isAssetEpisode ? 'asset' : 'shot'
    }
  },

  methods: {
    runConfirmation () {
      this.form.for_client = this.forClient === 'true'
      this.$emit('confirm', this.form)
    },

    resetForm () {
      if (this.isEditing) {
        this.form.name = this.playlistToEdit.name
        this.form.for_entity = this.playlistToEdit.for_entity
        this.form.is_for_all = this.currentEpisode && this.currentEpisode.id === 'all'
      } else {
        this.form = {
          name: this.playlistToEdit.name,
          for_entity: this.defaultForEntity,
          for_client: 'false',
          is_for_all: this.currentEpisode && this.currentEpisode.id === 'all'
        }
      }
    }
  },

  watch: {
    playlistToEdit () {
      this.resetForm()
    },

    active () {
      if (this.active) {
        this.forClient = this.playlistToEdit.for_client ? 'true' : 'false'
        this.resetForm()
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
