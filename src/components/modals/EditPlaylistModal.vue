<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box">
        <h1 class="title" v-if="isEditing">
          {{ $t('playlists.edit_title') }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('playlists.create_title') }}
        </h1>

        <form v-on:submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('playlists.fields.name')"
            @enter="runConfirmation"
            v-model="form.name"
            v-focus
          />
          <combobox-simple
            :label="$t('playlists.fields.for_client')"
            :options="forClientOptions"
            v-model="forClient"
          />
          <combobox-simple
            :label="$t('playlists.fields.for_entity')"
            :options="forEntityOptions"
            :disabled="typeDisabled"
            v-model="form.for_entity"
            v-if="!isEditing"
          />
          <combobox-task-type
            class="flexrow-item selector"
            :label="$t('news.task_type')"
            :task-type-list="taskTypeList"
            :up="true"
            v-model="form.task_type_id"
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
import ComboboxSimple from '@/components/widgets/ComboboxSimple'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '@/components/widgets/TextField'

import { mapGetters } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import { sortByName } from '@/lib/sorting'

export default {
  name: 'edit-playlist-modal',
  mixins: [modalMixin],
  components: {
    ComboboxSimple,
    ComboboxTaskType,
    ModalFooter,
    TextField
  },

  props: {
    active: {
      type: Boolean,
      value: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    playlistToEdit: {
      type: Object,
      default: () => {}
    },
    typeDisabled: {
      type: Boolean,
      default: false
    },
    taskTypeId: {
      type: String,
      default: ''
    }
  },

  data() {
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
        is_for_all: this.currentEpisode && this.currentEpisode.id === 'all',
        task_type_id: this.taskTypeId
      }
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'productionTaskTypes'
    ]),

    isEditing() {
      return this.playlistToEdit && this.playlistToEdit.id
    },

    forEntityOptions() {
      if (
        (this.currentEpisode &&
          ['main', 'all'].includes(this.currentEpisode.id)) ||
        this.currentProduction.production_type === 'assets'
      ) {
        return [{ label: this.$t('assets.title'), value: 'asset' }]
      } else if (this.currentProduction.production_type === 'shots') {
        return [
          { label: this.$t('shots.title'), value: 'shot' },
          { label: this.$t('sequences.title'), value: 'sequence' }
        ]
      } else {
        return [
          { label: this.$t('assets.title'), value: 'asset' },
          { label: this.$t('shots.title'), value: 'shot' },
          { label: this.$t('sequences.title'), value: 'sequence' }
        ]
      }
    },

    defaultForEntity() {
      const isOnlyAssets = this.currentProduction.production_type === 'assets'
      const isOnlyShots = this.currentProduction.production_type === 'shots'
      const isAssetEpisode =
        this.currentEpisode && ['all', 'main'].includes(this.currentEpisode.id)
      return (isAssetEpisode || isOnlyAssets) && !isOnlyShots ? 'asset' : 'shot'
    },

    taskTypeList() {
      const taskTypes = [...this.productionTaskTypes].filter(
        taskType => taskType.for_entity.toLowerCase() === this.form.for_entity
      )
      return [
        {
          id: '',
          color: '#999',
          name: this.$t('news.all')
        }
      ].concat(sortByName([...taskTypes]))
    }
  },

  methods: {
    runConfirmation() {
      this.form.for_client = this.forClient === 'true'
      this.$emit('confirm', this.form)
    },

    resetForm() {
      if (this.isEditing) {
        this.form.name = this.playlistToEdit.name
        this.form.for_entity = this.playlistToEdit.for_entity
        this.form.for_client = this.playlistToEdit.for_client
        this.form.is_for_all =
          this.currentEpisode && this.currentEpisode.id === 'all'
        this.form.task_type_id = this.playlistToEdit.task_type_id
      } else {
        this.form = {
          name: this.playlistToEdit.name,
          for_entity: this.playlistToEdit.for_entity || this.defaultForEntity,
          for_client: 'false',
          is_for_all: this.currentEpisode && this.currentEpisode.id === 'all',
          task_type_id: this.taskTypeId
        }
      }
    }
  },

  watch: {
    playlistToEdit() {
      this.resetForm()
    },

    active() {
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
