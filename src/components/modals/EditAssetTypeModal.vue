<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">

    <div class="box">
      <h1 class="title" v-if="assetTypeToEdit && assetTypeToEdit.id">
        {{ $t("asset_types.edit_title") }} {{ assetTypeToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("asset_types.new_asset_type") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('asset_types.fields.name')"
          :maxlength="30"
          v-model="form.name"
          @enter="runConfirmation"
          v-focus
        />

        <label class="label">
          {{ $t('asset_types.fields.task_types') }}
        </label>
        <div class="flexrow task-types mb1">
          <div
            class="flexrow-item mb1"
            :key="taskTypeId"
            @click="removeTaskType(taskTypeId)"
            v-for="taskTypeId in form.task_types"
          >
            <task-type-name
              :task-type="taskTypeMap.get(taskTypeId)"
              :deletable="true"
              v-if="taskTypeId"
            />
          </div>
          <combobox
            class="flexrow-item mb1"
            :options="availableTaskTypes"
            :with-margin="false"
            @input="id => {
              taskTypeMap.get(id) && form.task_types.push(id)
            }"
            v-if="availableTaskTypes.length > 1"
          />
        </div>
      </form>

      <modal-footer
        :error-text="$t('asset_types.create_error')"
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
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'

import { sortByName } from '@/lib/sorting'

import Combobox from '@/components/widgets/Combobox.vue'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '@/components/widgets/TextField'
import TaskTypeName from '@/components/widgets/TaskTypeName'

export default {
  name: 'edit-asset-type-modal',
  mixins: [modalMixin],
  components: {
    Combobox,
    TaskTypeName,
    ModalFooter,
    TextField
  },

  props: [
    'onConfirmClicked',
    'text',
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'assetTypeToEdit'
  ],

  data () {
    return {
      form: {
        name: '',
        task_types: []
      }
    }
  },

  computed: {
    ...mapGetters([
      'taskTypes',
      'taskTypeMap',
      'assetTypes',
      'assetTypeStatusOptions'
    ]),

    availableTaskTypes () {
      const taskTypes = sortByName(
        this.taskTypes.filter(taskType => {
          return (
            this.form.task_types.indexOf(taskType.id) === -1 &&
            taskType.for_entity === 'Asset'
          )
        })
      )
      return [
        {
          name: '+ Task Type',
          id: '-'
        },
        ...taskTypes
      ].map(taskType => {
        return {
          label: taskType.name,
          value: taskType.id
        }
      })
    }
  },

  methods: {
    ...mapActions([
      'loadTaskTypes'
    ]),

    removeTaskType (idToRemove) {
      const taskTypeIndex = this.form.task_types.indexOf(idToRemove)
      if (taskTypeIndex >= 0) {
        this.form.task_types.splice(taskTypeIndex, 1)
      }
    },

    runConfirmation () {
      this.$emit('confirm', this.form)
    }
  },

  watch: {
    active () {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    },

    assetTypeToEdit () {
      if (this.assetTypeToEdit.id) {
        const types = this.assetTypeToEdit.task_types || []
        this.form = {
          name: this.assetTypeToEdit.name,
          task_types: [...types]
        }
      } else {
        this.form = {
          name: '',
          task_types: this.taskTypes.filter(taskType => {
            return taskType.for_entity === 'Asset'
          }).map(taskType => {
            return taskType.id
          })
        }
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
