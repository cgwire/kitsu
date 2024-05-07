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
          {{ $t('status_automations.edit_title') }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('status_automations.new_status_automation') }}
        </h1>

        <form @submit.prevent>
          <h3 class="subtitle">{{ $t('status_automations.entity_title') }}</h3>
          <combobox
            :label="$t('status_automations.fields.entity_type')"
            :options="entityTypeOptions"
            locale-key-prefix="status_automations.entity_types."
            @enter="confirmClicked"
            v-model="form.entityType"
            v-if="!isEditing"
          />
          <span class="entity-type-name" v-else> {{ form.entityType }} </span>

          <h2 class="subtitle">{{ $t('status_automations.in_title') }}</h2>

          <div class="flexrow">
            <combobox-task-type
              class="flexrow-item"
              :label="$t('status_automations.fields.in_task_type')"
              :task-type-list="form.inEntityTaskTypes"
              v-model="form.inTaskTypeId"
              @enter="confirmClicked"
            />

            <combobox-status
              class="flexrow-item"
              :label="$t('status_automations.fields.in_task_status')"
              :task-status-list="taskStatusList"
              v-model="form.inTaskStatusId"
              @enter="confirmClicked"
            />
          </div>

          <h2 class="subtitle">{{ $t('status_automations.out_title') }}</h2>

          <div class="flexrow">
            <combobox
              class="flexrow-item margin-fix"
              :label="$t('status_automations.fields.out_field_type')"
              :options="fieldTypeOptions"
              locale-key-prefix="status_automations.field_types."
              @enter="confirmClicked"
              v-model="form.outFieldType"
              v-if="!isEditing && form.entityType === 'asset'"
            />
            <span
              class="flexrow-item"
              v-if="isEditing && form.outFieldType === 'ready_for'"
            >
              {{ $t('status_automations.field_types.ready_for') }}
            </span>

            <combobox-task-type
              class="flexrow-item"
              :label="$t('status_automations.fields.out_task_type')"
              :task-type-list="form.outEntityTaskTypes"
              :open-top="true"
              @enter="confirmClicked"
              v-model="form.outTaskTypeId"
            />

            <combobox-status
              class="flexrow-item"
              :label="$t('status_automations.fields.out_task_status')"
              :task-status-list="taskStatusList"
              :open-top="true"
              @enter="confirmClicked"
              v-model="form.outTaskStatusId"
              v-if="form.outFieldType === 'status'"
            />
          </div>

          <combobox-boolean
            :label="$t('status_automations.fields.import_last_revision')"
            @enter="confirmClicked"
            v-model="form.importLastRevision"
            v-if="isEditing"
          />

          <combobox-boolean
            :label="$t('main.archived')"
            @enter="confirmClicked"
            v-model="form.archived"
            v-if="isEditing"
          />
        </form>

        <modal-footer
          :error-text="$t('status_automations.create_error')"
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
import Combobox from '@/components/widgets/Combobox'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean'
import ComboboxStatus from '@/components/widgets/ComboboxStatus'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import ModalFooter from '@/components/modals/ModalFooter'

export default {
  name: 'edit-status-automation-modal',

  mixins: [modalMixin],

  components: {
    Combobox,
    ComboboxBoolean,
    ComboboxStatus,
    ComboboxTaskType,
    ModalFooter
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    statusAutomationToEdit: {
      type: Object,
      default: () => {}
    },
    taskStatus: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      entityTypeOptions: [
        {
          label: 'asset',
          value: 'asset'
        },
        {
          label: 'shot',
          value: 'shot'
        }
      ],
      fieldTypeOptions: [
        {
          label: 'status',
          value: 'status'
        },
        {
          label: 'ready_for',
          value: 'ready_for'
        }
      ],
      form: {
        entityType: 'asset',
        outFieldType: 'status',
        inEntityTaskTypes: [],
        outEntityTaskTypes: [],
        inTaskTypeId: '',
        outTaskTypeId: '',
        inTaskStatusId: '',
        outTaskStatusId: '',
        importLastRevision: 'false',
        archived: 'false'
      }
    }
  },

  computed: {
    ...mapGetters([
      'statusAutomations',
      'statusAutomationsStatusOptions',
      'assetTaskTypes',
      'shotTaskTypes',
      'taskStatuses'
    ]),

    taskStatusList() {
      return this.taskStatuses.filter(status => !status.for_concept)
    },

    isEditing() {
      return this.statusAutomationToEdit?.id
    }
  },

  methods: {
    confirmClicked() {
      this.$emit('confirm', this.form)
    },

    setTaskTypes(fieldType) {
      if (fieldType === 'asset') {
        this.form.inEntityTaskTypes = this.assetTaskTypes
        if (this.form.outFieldType === 'status') {
          this.form.outEntityTaskTypes = this.assetTaskTypes
        } else {
          this.form.outEntityTaskTypes = this.shotTaskTypes
        }
      } else if (fieldType === 'shot') {
        this.form.inEntityTaskTypes = this.shotTaskTypes
        this.form.outFieldType = 'status'
        this.form.outEntityTaskTypes = this.shotTaskTypes
      }
    }
  },

  watch: {
    statusAutomationToEdit() {
      if (this.statusAutomationToEdit) {
        let entityTaskTypes = []
        if (this.form.entityType === 'asset') {
          entityTaskTypes = this.assetTaskTypes
        } else if (this.form.entityType === 'shot') {
          entityTaskTypes = this.shotTaskTypes
        }
        this.form = {
          entityType: this.isEditing
            ? this.statusAutomationToEdit.entity_type
            : 'asset',
          inEntityTaskTypes: entityTaskTypes,
          outEntityTaskTypes: entityTaskTypes,
          inTaskTypeId: this.isEditing
            ? this.statusAutomationToEdit.in_task_type_id
            : entityTaskTypes[0].id,
          inTaskStatusId: this.isEditing
            ? this.statusAutomationToEdit.in_task_status_id
            : this.taskStatusList[0].id,
          outFieldType: this.isEditing
            ? this.statusAutomationToEdit.out_field_type
            : 'status',
          outTaskTypeId: this.isEditing
            ? this.statusAutomationToEdit.out_task_type_id
            : entityTaskTypes[1].id,
          outTaskStatusId: this.isEditing
            ? this.statusAutomationToEdit.out_task_status_id
            : this.taskStatusList[1].id,
          importLastRevision: this.isEditing
            ? String(this.statusAutomationToEdit.import_last_revision === true)
            : 'false',
          archived: this.isEditing
            ? String(this.statusAutomationToEdit.archived === true)
            : 'false'
        }
      }
    },

    // Adapt available values to the entity type
    'form.entityType': function (entityType) {
      this.setTaskTypes(entityType)
      if (!this.isEditing) {
        this.form.inTaskTypeId = this.form.inEntityTaskTypes[0].id
        this.form.inTaskStatusId = this.taskStatusList[0].id
        this.form.outTaskTypeId = this.form.outEntityTaskTypes[1].id
        this.form.outTaskStatusId = this.taskStatusList[1].id
      }
    },

    // Adapt available values to the automation type
    // * Ready for apply to assets
    // * Status apply to the same entity.
    'form.outFieldType': function (outFieldType) {
      if (outFieldType === 'ready_for') {
        this.form.outEntityTaskTypes = this.shotTaskTypes
        this.form.outTaskTypeId = this.shotTaskTypes[1].id
      } else if (outFieldType === 'status') {
        this.setTaskTypes(this.form.entityType)
        this.form.outTaskTypeId = this.form.outEntityTaskTypes[1].id
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.margin-fix {
  margin-top: 5px;
}
.subtitle {
  font-size: 1.4em;
  margin-top: 2em;
  margin-bottom: 0.5em;
  text-transform: none;
}
.entity-type-name {
  font-size: 1.2em;
  text-transform: capitalize;
}
</style>
