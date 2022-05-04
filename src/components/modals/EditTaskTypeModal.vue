<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">

    <div class="box">

      <h1 class="title" v-if="isEditing">
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
          v-model="form.for_entity"
           v-if="!isEditing"
        />
        <combobox-boolean
          :label="$t('task_types.fields.allow_timelog')"
          @enter="confirmClicked"
          v-model="form.allow_timelog"
        />
        <combobox-department
          :label="$t('task_types.fields.department')"
          @enter="confirmClicked"
          v-model="form.department_id"
        />
        <label class="label">
          {{ $t('task_types.fields.asset_types') }}
        </label>
        <div class="flexrow asset-types mb1">
          <div
            class="flexrow-item mb1"
            :key="assetTypeId"
            @click="removeAssetType(assetTypeId)"
            v-for="assetTypeId in form.asset_types"
          >
            <asset-type-name
                :asset-type="assetTypeMap.get(assetTypeId)"
                v-if="assetTypeId"
              />
          </div>
          <combobox
            class="flexrow-item mb1"
            :options="availableAssetTypes"
            :with-margin="false"
            @input="id => {
              assetTypeMap.get(id) && form.asset_types.push(id)
            }"
            v-if="availableAssetTypes.length > 1"
          />
        </div>
        <color-field
          ref="colorField"
          :label="$t('task_types.fields.color')"
          v-model="form.color"
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
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'

import { removeModelFromList } from '@/lib/models'
import { sortByName } from '@/lib/sorting'

import Combobox from '../widgets/Combobox.vue'
import ComboboxBoolean from '../widgets/ComboboxBoolean.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ColorField from '../widgets/ColorField'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '../widgets/TextField'
import AssetTypeName from '../widgets/AssetTypeName'

export default {
  name: 'edit-task-type-modal',
  mixins: [modalMixin],
  components: {
    AssetTypeName,
    Combobox,
    ComboboxBoolean,
    ComboboxDepartment,
    ColorField,
    ModalFooter,
    TextField
  },

  props: [
    'active',
    'onConfirmClicked',
    'entries',
    'isLoading',
    'isError',
    'taskTypeToEdit',
    'text'
  ],

  watch: {
    taskTypeToEdit () {
      console.log('taskTypeToEdit', this.taskTypeToEdit)
      if (this.taskTypeToEdit.id) {
        this.form = {
          name: this.taskTypeToEdit.name,
          color: this.taskTypeToEdit.color,
          for_entity: this.taskTypeToEdit.for_entity,
          allow_timelog: String(this.taskTypeToEdit.allow_timelog === true),
          department_id: this.taskTypeToEdit.department_id,
          asset_types: [...this.taskTypeToEdit.asset_types]
        }
      }
    }
  },

  data () {
    return {
      form: {
        name: '',
        color: '$grey',
        for_entity: 'Asset',
        allow_timelog: 'false',
        department_id: null,
        asset_types: []
      },
      dedicatedToOptions: [
        { label: this.$t('assets.title'), value: 'Asset' },
        { label: this.$t('shots.title'), value: 'Shot' },
        { label: this.$t('edits.title'), value: 'Edit' }
      ]
    }
  },

  computed: {
    ...mapGetters([
      'assetTypes',
      'assetTypeMap',
      'taskTypes',
      'taskTypeStatusOptions',
      'departments'
    ]),

    isEditing () {
      return this.taskTypeToEdit && this.taskTypeToEdit.id
    },

    availableAssetTypes () {
      const assetTypes = sortByName(this.assetTypes.filter(assetType => {
        return this.form.asset_types.indexOf(assetType.id) === -1
      }))
      return [
        {
          name: '+ Asset Type',
          id: '-'
        },
        ...assetTypes
      ].map(assetType => {
        return {
          label: assetType.name,
          value: assetType.id
        }
      })
    }
  },

  methods: {
    ...mapActions([
      'loadAssetTypes'
    ]),
    removeModelFromList,

    removeAssetType (idToRemove) {
      const assetTypeIndex = this.form.asset_types.indexOf(idToRemove)
      if (assetTypeIndex >= 0) {
        this.form.asset_types.splice(assetTypeIndex, 1)
      }
    },

    newPriority (forEntity) {
      return this.entries.filter(taskType => taskType.for_entity === forEntity).length + 1
    },

    confirmClicked () {
      if (!this.isEditing) {
        this.form.priority = this.newPriority(this.form.for_entity)
      }
      this.$emit('confirm', this.form)
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
