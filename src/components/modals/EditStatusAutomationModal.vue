<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">

    <div class="box">

      <h1 class="title" v-if="isEditing()">
        {{ $t("status_automations.edit_title") }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("status_automations.new_status_automation") }}
      </h1>

      <form v-on:submit.prevent>
        <combobox
          :label="$t('status_automations.fields.entity_type')"
          :options="entityTypeOptions"
          v-if="!isEditing()"
          v-model="form.entityType"
          locale-key-prefix="status_automations.entity_types."
          @enter="confirmClicked"
        />
        <span v-else> {{ form.entityType }} </span>

        <h3>{{ $t("status_automations.in_title") }}</h3>

        <div class="flexrow">

          <combobox-task-type class="flexrow-item"
            :label="$t('status_automations.fields.in_task_type')"
            :task-type-list="form.inEntityTaskTypes"
            v-model="form.inTaskTypeId"
            @enter="confirmClicked"
          />

          <combobox-status class="flexrow-item"
            :label="$t('status_automations.fields.in_task_status')"
            :task-status-list="productionTaskStatuses"
            v-model="form.inTaskStatusId"
            @enter="confirmClicked"
          />
        </div>

        <h3>{{ $t("status_automations.out_title") }}</h3>

        <div class="flexrow">
          <combobox class="flexrow-item"
            :label="$t('status_automations.fields.out_field_type')"
            :options="fieldTypeOptions"
            v-if="!isEditing() && form.entityType == 'asset'"
            v-model="form.outFieldType"
            locale-key-prefix="status_automations.field_types."
            @enter="confirmClicked"
          />
          <span class="flexrow-item"
          v-if="isEditing() && form.outFieldType == 'ready_for'">Ready For</span>

          <combobox-task-type class="flexrow-item"
            :label="$t('status_automations.fields.out_task_type')"
            :task-type-list="form.outEntityTaskTypes"
            v-model="form.outTaskTypeId"
            @enter="confirmClicked"
          />

          <combobox-status class="flexrow-item"
            :label="$t('status_automations.fields.out_task_status')"
            :task-status-list="productionTaskStatuses"
            v-if="form.outFieldType == 'status'"
            v-model="form.outTaskStatusId"
            @enter="confirmClicked"
          />
        </div>
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
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'
import Combobox from '../widgets/Combobox'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import ComboboxStatus from '@/components/widgets/ComboboxStatus'
import ModalFooter from './ModalFooter'

export default {
  name: 'edit-status-automation-modal',
  mixins: [modalMixin],
  components: {
    Combobox,
    ComboboxTaskType,
    ComboboxStatus,
    ModalFooter
  },

  props: [
    'onConfirmClicked',
    'text',
    'active',
    'isLoading',
    'isError',
    'errorText',
    'statusAutomationToEdit',
    'taskStatus'
  ],

  computed: {
    ...mapGetters([
      'statusAutomations',
      'statusAutomationsStatusOptions',
      'assetTaskTypes',
      'shotTaskTypes',
      'productionTaskTypes',
      'productionTaskStatuses'
    ])
  },

  data () {
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
        mode: 'status',
        inEntityTaskTypes: [],
        outEntityTaskTypes: [],
        inTaskTypeId: '',
        outTaskTypeId: '',
        inTaskStatusId: '',
        outTaskStatusId: ''
      }
    }
  },

  methods: {
    ...mapActions([
    ]),
    confirmClicked () {
      this.$emit('confirm', this.form)
    },
    isEditing () {
      return this.statusAutomationToEdit && this.statusAutomationToEdit.id
    },
    setTaskTypes (fieldType) {
      if (fieldType === 'asset') {
        this.form.inEntityTaskTypes = this.assetTaskTypes
        this.form.outEntityTaskTypes = this.assetTaskTypes
      } else if (fieldType === 'shot') {
        this.form.inEntityTaskTypes = this.shotTaskTypes
        this.form.outEntityTaskTypes = this.shotTaskTypes
      }
    }
  },

  watch: {
    statusAutomationToEdit () {
      if (this.statusAutomationToEdit) {
        var entityTaskTypes = []
        if (this.form.entityType === 'asset') {
          entityTaskTypes = this.assetTaskTypes
        } else if (this.form.entityType === 'shot') {
          entityTaskTypes = this.shotTaskTypes
        }

        // Preset form values as example
        this.form = {
          entityType: this.isEditing() ? this.statusAutomationToEdit.entity_type : 'asset',
          inEntityTaskTypes: entityTaskTypes,
          outEntityTaskTypes: entityTaskTypes,
          // inFieldType: this.isEditing() ? this.statusAutomationToEdit.in_field_type : 'status',
          inTaskTypeId: this.isEditing() ? this.statusAutomationToEdit.in_task_type_id : entityTaskTypes[0].id,
          inTaskStatusId: this.isEditing() ? this.statusAutomationToEdit.in_task_status_id : this.productionTaskStatuses[0].id,
          outFieldType: this.isEditing() ? this.statusAutomationToEdit.out_field_type : 'status',
          outTaskTypeId: this.isEditing() ? this.statusAutomationToEdit.out_task_type_id : entityTaskTypes[1].id,
          outTaskStatusId: this.isEditing() ? this.statusAutomationToEdit.out_task_status_id : this.productionTaskStatuses[1].id
        }
      }
    },
    // Update values when entity type is changed
    'form.entityType': function (entityType) {
      this.setTaskTypes(entityType)

      // Set default entity type and status values
      if (!this.isEditing()) {
        this.form.inTaskTypeId = this.form.inEntityTaskTypes[0].id
        this.form.inTaskStatusId = this.productionTaskStatuses[0].id
        this.form.outTaskTypeId = this.form.outEntityTaskTypes[1].id
        this.form.outTaskStatusId = this.productionTaskStatuses[1].id
      }
    },
    // Update values when IN field type is changed
    // 'form.inFieldType': function (inFieldType) {
    //   if (inFieldType === 'ready_for') {
    //     this.form.inEntityTaskTypes = this.shotTaskTypes
    //     this.form.inTaskTypeId = this.shotTaskTypes[1].id
    //   } else if (inFieldType === 'status') {
    //     this.setTaskTypes(this.form.entityType)
    //     this.form.inTaskTypeId = this.form.inEntityTaskTypes[1].id
    //   }
    // },
    // Update values when IN field type is changed
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
.modal-content .box p.text {
  margin-bottom: 1em;
}
.is-danger {
  color: #ff3860;
  font-style: italic;
}
</style>
