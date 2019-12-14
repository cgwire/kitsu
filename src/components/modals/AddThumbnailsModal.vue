<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>

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
      </p>

      <label class="label">
        {{ $t('entities.thumbnails.select_files') }}
      </label>

      <file-upload
        ref="preview-field"
        :accept="extensions"
        @fileselected="onFileSelected"
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
          :src="thumbnailInfo.src"
          width="150"
          height="100"
        />
        <span class="flexrow-item">
          {{ thumbnailInfo.parentName }} / {{ thumbnailInfo.name }}
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
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'

import { CheckIcon } from 'vue-feather-icons'

import { slugify } from '../../lib/string'
import assetStore from '../../store/modules/assets'
import shotStore from '../../store/modules/shots'

import ComboboxTaskType from '../widgets/ComboboxTaskType'
import FileUpload from '../widgets/FileUpload'
import ModalFooter from './ModalFooter'
import Spinner from '../widgets/Spinner'

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
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      extensions: '.png,.jpg',
      forms: [],
      loading: {},
      taskTypeId: null,
      uploaded: {},
      thumbnailList: []
    }
  },

  mounted () {
    this.reset()
  },

  computed: {
    ...mapGetters([
      'assetValidationColumns',
      'shotValidationColumns',
      'taskTypeMap',
      'taskMap'
    ]),

    isFormFilled () {
      return this.thumbnailList.length > 0
    },

    taskTypeList () {
      if (this.isAssets) {
        return this.assetValidationColumns
          .map((taskTypeId) => this.taskTypeMap[taskTypeId])
      } else {
        return this.shotValidationColumns
          .map((taskTypeId) => this.taskTypeMap[taskTypeId])
      }
    },

    isAssets () {
      return this.$route.path.indexOf('assets') > -1
    }
  },

  methods: {
    ...mapActions([
    ]),

    reset () {
      if (this.taskTypeList.length > 0) {
        this.taskTypeId = this.taskTypeList[0].id
      }
      this.$refs['preview-field'].reset()
      this.thumbnailList = []
      this.loading = {}
      this.uploaded = {}
    },

    confirm () {
      return this.$emit('confirm', this.forms.map(this.addTaskInformation))
    },

    addEntityToEntityMap (entity) {
      let fullName = ''
      if (this.isAssets) {
        fullName = slugify(`${entity.asset_type_name}_${entity.name}`)
      } else {
        fullName = slugify(`${entity.sequence_name}_${entity.name}`)
      }
      this.entityMap[fullName] = entity
      return this.entityMap
    },

    addTaskInformation (form) {
      const filename = this.slugifyFilename(form)
      const entity = this.entityMap[filename]
      const task = this.taskMap[entity.validations[this.taskTypeId]]
      form.task = task
      return form
    },

    onFileSelected (forms) {
      this.entityMap = {}
      this.uploaded = {}
      if (this.isAssets) {
        assetStore.cache.assets.forEach(this.addEntityToEntityMap)
      } else {
        shotStore.cache.shots.forEach(this.addEntityToEntityMap)
      }
      this.forms = this.filterForms(forms)
      return this.buildThumbnailList()
    },

    filterForms (forms) {
      return forms
        .filter((form) => {
          const filename = this.slugifyFilename(form)
          const asset = this.entityMap[filename]
          return asset && asset.validations[this.taskTypeId]
        })
    },

    buildThumbnailList () {
      this.thumbnailList = this.forms
        .map((form) => {
          const asset = this.entityMap[this.slugifyFilename(form)]
          const url = this.prepareImagePreview(form)
          const parentName =
            this.isAssets ? asset.asset_type_name : asset.sequence_name
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

    slugifyFilename (form) {
      const filename = form.get('file').name
      return slugify(filename.substring(0, filename.length - 3))
    },

    prepareImagePreview (form) {
      return window.URL.createObjectURL(form.get('file'))
      /*
      const canvas = document.createElement('img')
      const img = document.createElement('img')
      const reader = new FileReader()
      reader.onload = (e) => { img.src = e.target.result }
      reader.readAsDataURL(form.get('file'))

      let ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const MAX_WIDTH = 50
      const MAX_HEIGHT = 33
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
      }
      canvas.width = width
      canvas.height = height
      ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      return canvas.toDataURL('image/png')
      */
    },

    markLoading (assetId) {
      this.loading = {}
      this.loading[assetId] = true
    },

    markUploaded (assetId) {
      this.uploaded[assetId] = true
    }
  },

  watch: {
    active () {
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
  max-height: 900px;
}
</style>
