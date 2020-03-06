<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">

    <div class="box">

      <h1 class="title" v-if="isEditing()">
        {{ $t("task_types.edit_title") }} {{ taskTypeToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("task_types.new_task_type") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('task_types.fields.name')"
          v-model="form.name"
          @enter="confirmClicked"
          v-focus
        />
        <combobox
          :label="$t('task_types.fields.dedicated_to')"
          :options="dedicatedToOptions"
          @enter="confirmClicked"
          v-model="form.for_shots"
        />
        <combobox-boolean
          :label="$t('task_types.fields.allow_timelog')"
          @enter="confirmClicked"
          v-model="form.allow_timelog"
        />
        <color-field
          ref="colorField"
          :label="$t('task_types.fields.color')"
          v-model="form.color"
        />
      </form>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          @click="confirmClicked"
        >
          {{ $t("main.confirmation") }}
        </a>
        <router-link
          :to="cancelRoute"
          class="button is-link"
        >
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
import ComboboxBoolean from '../widgets/ComboboxBoolean.vue'
import ColorField from '../widgets/ColorField'

export default {
  name: 'edit-task-type-modal',
  components: {
    Combobox,
    ComboboxBoolean,
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
    'taskTypeToEdit',
    'entries'
  ],

  watch: {
    taskTypeToEdit () {
      if (this.taskTypeToEdit) {
        this.form = {
          name: this.taskTypeToEdit.name,
          color: this.taskTypeToEdit.color,
          for_shots: String(this.taskTypeToEdit.for_shots === true),
          allow_timelog: String(this.taskTypeToEdit.allow_timelog === true)
        }
      }
    }
  },

  data () {
    return {
      form: {
        name: '',
        color: '$grey',
        for_shots: 'false',
        allow_timelog: 'false'
      },
      dedicatedToOptions: [
        { label: this.$t('assets.title'), value: 'false' },
        { label: this.$t('shots.title'), value: 'true' }
      ]
    }
  },

  computed: {
    ...mapGetters([
      'taskTypes',
      'taskTypeStatusOptions'
    ])
  },

  methods: {
    ...mapActions([
    ]),

    newPriority (forShots) {
      if (forShots === 'true') {
        return this.entries.filter(taskType => taskType.for_shots).length + 1
      } else {
        return this.entries.filter(taskType => !taskType.for_shots).length + 1
      }
    },

    confirmClicked () {
      if (!this.isEditing) {
        this.form.priority = this.newPriority(this.form.for_shots)
      }
      this.$emit('confirm', this.form)
    },

    isEditing () {
      return this.taskTypeToEdit && this.taskTypeToEdit.id
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}
.is-danger {
  color: #ff3860;
  font-style: italic;
}
</style>
