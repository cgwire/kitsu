<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box content">
        <h1 class="title">
          {{ $t('entities.thumbnails.title') }}
        </h1>

        <p>
          {{ $t('entities.thumbnails.explaination') }}
        </p>

        <combobox-task-type
          :label="$t('entities.thumbnails.select_task_type')"
          :task-type-list="taskTypeList"
          v-model="taskTypeId"
        />

        <p>
          {{ $t('entities.thumbnails.explaination_two') }}
          {{ $t(`entities.thumbnails.${parent}_pattern`) }}
        </p>

        <label class="label">
          {{ $t('entities.thumbnails.select_files') }}
        </label>

        <file-upload
          ref="preview-field"
          :label="$t('main.csv.upload_file')"
          :accept="extensions"
          @fileselected="onFileSelected"
          :multiple="true"
        />

        <label class="label mt2" v-if="thumbnailList.length > 0">
          {{ $t('entities.thumbnails.selected_files') }}
        </label>

        <div
          class="thumbnail-line flexrow"
          :key="thumbnailInfo.id"
          v-for="thumbnailInfo in thumbnailList"
        >
          <img
            class="flexrow-item"
            src="../../assets/icons/movie-thumbnail.png"
            width="150"
            height="100"
            v-if="!thumbnailInfo.src"
          />
          <img
            class="flexrow-item"
            :src="thumbnailInfo.src"
            width="150"
            height="100"
            v-if="thumbnailInfo.src"
          />
          <span class="flexrow-item">
            <template v-if="thumbnailInfo.parentName">
              {{ thumbnailInfo.parentName }} /
            </template>
            {{ thumbnailInfo.name }}
          </span>
          <spinner v-if="loading[thumbnailInfo.id]" :size="10" />
          <check-icon v-if="uploaded[thumbnailInfo.id]" />
        </div>

        <modal-footer
          :error-text="$t('entities.thumbnails.error')"
          :is-loading="isLoading"
          :is-disabled="!isFormFilled"
          @confirm="confirm"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'

import { CheckIcon } from 'vue-feather-icons'

import stringHelpers from '@/lib/string'
import assetStore from '@/store/modules/assets'
import editStore from '@/store/modules/edits'
import shotStore from '@/store/modules/shots'

import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import FileUpload from '@/components/widgets/FileUpload'
import ModalFooter from '@/components/modals/ModalFooter'
import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'add-thumbnails-modal',
  mixins: [modalMixin],

  components: {
    CheckIcon,
    ComboboxTaskType,
    FileUpload,
    ModalFooter,
    Spinner
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    entityType: {
      type: String,
      required: true,
      validator: value => ['Asset', 'Edit', 'Shot'].includes(value)
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    parent: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      extensions: '.png,.jpg,.jpeg,.mp4,.mov',
      forms: [],
      loading: {},
      taskTypeId: null,
      uploaded: {},
      thumbnailList: []
    }
  },

  mounted() {
    this.reset()
  },

  computed: {
    ...mapGetters([
      'assetValidationColumns',
      'editValidationColumns',
      'shotValidationColumns',
      'taskTypeMap',
      'taskMap'
    ]),

    isFormFilled() {
      return this.thumbnailList.length > 0
    },

    taskTypeList() {
      let validationColumns = []
      if (this.isAssets) {
        validationColumns = this.assetValidationColumns
      } else if (this.isEdits) {
        validationColumns = this.editValidationColumns
      } else if (this.isShots) {
        validationColumns = this.shotValidationColumns
      }
      return validationColumns.map(taskTypeId =>
        this.taskTypeMap.get(taskTypeId)
      )
    },

    isAssets() {
      return this.entityType === 'Asset'
    },
    isEdits() {
      return this.entityType === 'Edit'
    },
    isShots() {
      return this.entityType === 'Shot'
    }
  },

  methods: {
    reset() {
      if (this.taskTypeList.length > 0) {
        this.taskTypeId = this.taskTypeList[0].id
      }
      if (this.$refs['preview-field'].reset) {
        // Needed for tests
        this.$refs['preview-field'].reset()
      }
      this.thumbnailList = []
      this.loading = {}
      this.uploaded = {}
    },

    confirm() {
      return this.$emit('confirm', this.forms.map(this.addTaskInformation))
    },

    addEntityToEntityMap(entity) {
      let fullName = ''
      if (this.isAssets) {
        fullName = stringHelpers.slugify(
          `${entity.asset_type_name}_${entity.name}`
        )
      } else if (this.isEdits) {
        fullName = stringHelpers.slugify(
          entity.episode_name
            ? `${entity.episode_name}_${entity.name}`
            : entity.name
        )
      } else if (this.isShots) {
        fullName = stringHelpers.slugify(
          `${entity.sequence_name}_${entity.name}`
        )
      }
      this.entityMap[fullName] = entity
    },

    addTaskInformation(form) {
      const filename = this.slugifyFilename(form)
      const entity = this.entityMap[filename]
      const task = this.taskMap.get(entity.validations.get(this.taskTypeId))
      form.task = task
      return form
    },

    onFileSelected(forms) {
      this.entityMap = {}
      this.uploaded = {}
      let cachedEntities = []
      if (this.isAssets) {
        cachedEntities = assetStore.cache.assets
      } else if (this.isEdits) {
        cachedEntities = editStore.cache.edits
      } else if (this.isShots) {
        cachedEntities = shotStore.cache.shots
      }
      cachedEntities.forEach(this.addEntityToEntityMap)
      this.forms = this.filterForms(forms)
      this.buildThumbnailList()
    },

    filterForms(forms) {
      return forms.filter(form => {
        const filename = this.slugifyFilename(form)
        const asset = this.entityMap[filename]
        return asset && asset.validations.get(this.taskTypeId)
      })
    },

    buildThumbnailList() {
      this.thumbnailList = this.forms.map(form => {
        const asset = this.entityMap[this.slugifyFilename(form)]
        const url = this.prepareImagePreview(form)
        let parentName = ''
        if (this.isAssets) {
          parentName = asset.asset_type_name
        } else if (this.isEdits) {
          parentName = asset.episode_name
        } else if (this.isShots) {
          parentName = asset.sequence_name
        }
        form.asset = asset
        return {
          parentName,
          name: asset.name,
          id: asset.id,
          src: url
        }
      })
      return this.thumbnailList
    },

    slugifyFilename(form) {
      const filename = form.get('file').name
      return stringHelpers.slugify(filename.substring(0, filename.length - 3))
    },

    prepareImagePreview(form) {
      if (form.get('file').type.startsWith('image')) {
        return window.URL.createObjectURL(form.get('file'))
      }
      return ''
    },

    markLoading(assetId) {
      this.loading = {}
      this.loading[assetId] = true
    },

    markUploaded(assetId) {
      this.uploaded[assetId] = true
    }
  },

  watch: {
    active() {
      if (this.active) {
        this.reset()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.thumbnail-line {
  margin-top: 1em;
  img {
    max-height: 33px;
    max-width: 50px;
  }
}

.modal-content {
  max-height: calc(100vh - 7rem);
  margin-top: 3rem;
}
</style>
