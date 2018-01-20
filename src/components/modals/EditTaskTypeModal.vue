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
          v-focus
        >
        </text-field>
        <combobox
          :label="$t('task_types.fields.priority')"
          :options="priorityOptions"
          v-model="form.priority"
        >
        </combobox>
        <combobox
          :label="$t('task_types.fields.dedicated_to')"
          :options="dedicatedToOptions"
          v-model="form.for_shots"
        >
        </combobox>
        <color-field
          ref="colorField"
          :label="$t('task_types.fields.color')"
          v-model="form.color"
        >
        </color-field>
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
  name: 'edit-task-type-modal',
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
    'taskTypeToEdit'
  ],

  watch: {
    taskTypeToEdit () {
      if (this.taskTypeToEdit) {
        this.form = {
          name: this.taskTypeToEdit.name,
          color: this.taskTypeToEdit.color,
          priority: String(this.taskTypeToEdit.priority),
          for_shots: String(this.taskTypeToEdit.for_shots)
        }
      }
    }
  },

  data () {
    return {
      form: {
        name: '',
        color: '#999999',
        priority: '',
        for_shots: 'false'
      },
      priorityOptions: [
        {label: '1', value: '1'},
        {label: '2', value: '2'},
        {label: '3', value: '3'},
        {label: '4', value: '4'},
        {label: '5', value: '5'},
        {label: '6', value: '6'},
        {label: '7', value: '7'},
        {label: '8', value: '8'},
        {label: '9', value: '9'},
        {label: '10', value: '10'}
      ],
      dedicatedToOptions: [
        {label: this.$tc('assets.title'), value: 'false'},
        {label: this.$tc('shots.title'), value: 'true'}
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
    confirmClicked () {
      this.$emit('confirm', this.form)
    },
    isEditing: () => this.taskTypeToEdit && this.taskTypeToEdit.id
  }
}
</script>

<style scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}
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
