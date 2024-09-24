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
        <h1 class="title" v-if="assetTypeToEdit && assetTypeToEdit.id">
          {{ $t('asset_types.edit_title') }} {{ assetTypeToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('asset_types.new_asset_type') }}
        </h1>

        <form @submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('asset_types.fields.name')"
            :maxlength="30"
            v-model="form.name"
            @enter="runConfirmation"
            v-focus
          />
          <text-field
            ref="shortNameField"
            :label="$t('asset_types.fields.short_name')"
            :maxlength="30"
            v-model="form.short_name"
            @enter="runConfirmation"
          />
          <textarea-field
            :label="$t('asset_types.fields.description')"
            v-model="form.description"
            @enter="runConfirmation"
          />
          <combobox-boolean
            :label="$t('main.archived')"
            @enter="runConfirmation"
            v-model="form.archived"
            v-if="isEditing"
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
              @update:model-value="
                id => {
                  taskTypeMap.get(id) && form.task_types.push(id)
                }
              "
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
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'edit-asset-type-modal',

  mixins: [modalMixin],

  components: {
    Combobox,
    ComboboxBoolean,
    ModalFooter,
    TaskTypeName,
    TextareaField,
    TextField
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
    assetTypeToEdit: {
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

    isEditing() {
      return this.assetTypeToEdit && this.assetTypeToEdit.id
    },

    availableTaskTypes() {
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
    ...mapActions(['loadTaskTypes']),

    removeTaskType(idToRemove) {
      const taskTypeIndex = this.form.task_types.indexOf(idToRemove)
      if (taskTypeIndex >= 0) {
        this.form.task_types.splice(taskTypeIndex, 1)
      }
    },

    runConfirmation() {
      this.$emit('confirm', this.form)
    }
  },

  watch: {
    active() {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    },

    assetTypeToEdit() {
      if (this.assetTypeToEdit.id) {
        const types = this.assetTypeToEdit.task_types || []
        this.form = {
          name: this.assetTypeToEdit.name,
          short_name: this.assetTypeToEdit.short_name,
          description: this.assetTypeToEdit.description,
          task_types: [...types],
          archived: String(this.assetTypeToEdit.archived === true)
        }
      } else {
        this.form = {
          name: '',
          short_name: '',
          description: '',
          task_types: [],
          archived: 'false'
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

.task-types {
  flex-wrap: wrap;
}
</style>
