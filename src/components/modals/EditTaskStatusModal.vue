<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>

  <div class="modal-content">
    <div class="box">

      <h1 class="title" v-if="isEditing()">
        {{ $t("task_status.edit_title") }} {{ taskStatusToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("task_status.new_task_status") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          input-class="task-status-name"
          :label="$t('task_status.fields.name')"
          v-model="form.name"
          v-focus
        />
        <text-field
          ref="shortNameField"
          input-class="task-status-short-name"
          :label="$t('task_status.fields.short_name')"
          v-model="form.short_name"
          v-focus
        />
        <combobox
          :label="$t('task_status.fields.is_done')"
          :options="isDoneOptions"
          v-model="form.is_done"
        />
        <combobox
          :label="$t('task_status.fields.is_retake')"
          :options="isRetakeOptions"
          v-model="form.is_retake"
        />
        <combobox
          :label="$t('task_status.fields.is_artist_allowed')"
          :options="isArtistAllowedOptions"
          v-model="form.is_artist_allowed"
        />

        <color-field
          ref="colorField"
          :label="$t('task_status.fields.color')"
          :colors="colors"
          v-model="form.color"
        />
      </form>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'confirm-edit-task-status': true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          @click="confirmClicked"
        >
          {{ $t("main.confirmation") }}
        </a>
        <router-link
          :to="cancelRoute"
          class="button is-link">
          {{ $t("main.cancel") }}
        </router-link>
      </p>
    </div>

  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TextField from '../widgets/TextField'
import Combobox from '../widgets/Combobox.vue'
import ColorField from '../widgets/ColorField'

export default {
  name: 'edit-task-status-modal',
  components: {
    Combobox,
    TextField,
    ColorField
  },

  props: [
    'onConfirmClicked',
    'text',
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'errorText',
    'taskStatusToEdit'
  ],

  data () {
    return {
      form: {
        name: '',
        short_name: '',
        color: '$grey999',
        is_reviewable: 'true',
        is_done: 'false'
      },
      isRetakeOptions: [
        { label: this.$t('main.yes'), value: 'true' },
        { label: this.$t('main.no'), value: 'false' }
      ],
      isDoneOptions: [
        { label: this.$t('main.yes'), value: 'true' },
        { label: this.$t('main.no'), value: 'false' }
      ],
      isArtistAllowedOptions: [
        { label: this.$t('main.yes'), value: 'true' },
        { label: this.$t('main.no'), value: 'false' }
      ],
      colors: [
        '#000000',
        '#E81123',
        '#ff3860',
        '#FF5722',
        '#FFA000',
        '#AFB42B',
        '#22d160',
        '#43A047',
        '#498205',
        '#607D8B',
        '#3273dc',
        '#8764B8',
        '#ab26ff'
      ]
    }
  },

  computed: {
    ...mapGetters([
      'taskStatus',
      'taskStatusStatusOptions'
    ])
  },

  methods: {
    ...mapActions([
    ]),

    confirmClicked () {
      this.$emit('confirm', this.form)
    },

    isEditing () {
      return this.taskStatusToEdit && this.taskStatusToEdit.id
    },

    resetForm () {
      if (this.taskStatusToEdit) {
        this.form = {
          name: this.taskStatusToEdit.name,
          short_name: this.taskStatusToEdit.short_name,
          color: this.taskStatusToEdit.color,
          is_reviewable: String(this.taskStatusToEdit.is_reviewable),
          is_done: String(this.taskStatusToEdit.is_done),
          is_retake: String(this.taskStatusToEdit.is_retake || false),
          is_artist_allowed: String(this.taskStatusToEdit.is_artist_allowed)
        }
      }
    }
  },

  watch: {
    taskStatusToEdit () {
      this.resetForm()
    },

    active () {
      if (this.active) {
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
.modal-content .box p.text {
  margin-bottom: 1em;
}

.title {
  border-bottom: 2px solid #DDD;
  padding-bottom: 0.5em;
  margin-bottom: 1.2em;
}
</style>
