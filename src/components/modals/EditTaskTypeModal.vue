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
          {{ $t('task_types.edit_title') }} {{ taskTypeToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('task_types.new_task_type') }}
        </h1>

        <form @submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('task_types.fields.name')"
            v-model="form.name"
            @enter="confirmClicked"
            v-focus
          />
          <text-field
            ref="shortNameField"
            :label="$t('task_types.fields.short_name')"
            v-model="form.short_name"
            @enter="confirmClicked"
          />
          <boolean-field
            is-field
            :label="$t('task_types.fields.allow_timelog')"
            @enter="confirmClicked"
            v-model="form.allow_timelog"
          />
          <textarea-field
            :label="$t('task_types.fields.description')"
            v-model="form.description"
            @enter="confirmClicked"
          />
          <combobox-simple
            class="field"
            :label="$t('task_types.fields.dedicated_to')"
            :options="dedicatedToOptions"
            @enter="confirmClicked"
            v-model="form.for_entity"
            v-if="!isEditing"
          />
          <combobox-department
            :label="$t('task_types.fields.department')"
            @enter="confirmClicked"
            v-model="form.department_id"
          />
          <color-field
            class="mt2"
            :label="$t('task_types.fields.color')"
            v-model="form.color"
          />
          <combobox-boolean
            :label="$t('main.archived')"
            @enter="confirmClicked"
            v-model="form.archived"
            v-if="isEditing"
          />
        </form>

        <modal-footer
          :error-text="$t('task_types.create_error')"
          :is-loading="isLoading"
          :is-error="isError"
          @confirm="confirmClicked"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import BooleanField from '@/components/widgets/BooleanField.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ComboboxSimple from '@/components/widgets/ComboboxSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ColorField from '@/components/widgets/ColorField.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

export default {
  name: 'edit-task-type-modal',

  mixins: [modalMixin],

  components: {
    BooleanField,
    ComboboxBoolean,
    ComboboxSimple,
    ComboboxDepartment,
    ColorField,
    ModalFooter,
    TextField,
    TextareaField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    forEntity: {
      type: String,
      default: 'Asset'
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    taskTypeToEdit: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        name: '',
        short_name: '',
        description: '',
        color: '#999999',
        for_entity: 'Asset',
        allow_timelog: 'false',
        department_id: null,
        archived: 'false'
      },
      dedicatedToOptions: [
        { label: this.$t('assets.title'), value: 'Asset' },
        { label: this.$t('shots.title'), value: 'Shot' },
        { label: this.$t('sequences.title'), value: 'Sequence' },
        { label: this.$t('episodes.title'), value: 'Episode' },
        { label: this.$t('edits.title'), value: 'Edit' }
      ]
    }
  },

  computed: {
    ...mapGetters(['taskTypes', 'taskTypeStatusOptions', 'departments']),
    isEditing() {
      return this.taskTypeToEdit && this.taskTypeToEdit.id
    }
  },

  methods: {
    newPriority(forEntity) {
      return (
        this.taskTypes.filter(taskType => taskType.for_entity === forEntity)
          .length + 1
      )
    },

    confirmClicked() {
      if (!this.isEditing) {
        this.form.priority = this.newPriority(this.form.for_entity)
      }
      this.$emit('confirm', this.form)
    }
  },

  watch: {
    active() {
      if (this.taskTypeToEdit) {
        this.form = {
          name: this.taskTypeToEdit.name,
          short_name: this.taskTypeToEdit.short_name,
          description: this.taskTypeToEdit.description,
          color: this.taskTypeToEdit.color,
          for_entity: this.taskTypeToEdit.for_entity || 'Asset',
          allow_timelog: String(this.taskTypeToEdit.allow_timelog === true),
          department_id: this.taskTypeToEdit.department_id,
          archived: String(this.taskTypeToEdit.archived === true)
        }
      } else {
        this.form = {
          name: '',
          short_name: '',
          description: '',
          color: '#999999',
          for_entity: this.forEntity,
          allow_timelog: 'false',
          department_id: null,
          archived: 'false'
        }
      }
      this.$nextTick(() => {
        this.form.for_entity = this.forEntity
      })
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
