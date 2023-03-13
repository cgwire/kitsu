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
        <page-title :text="title" />

        <p>{{ text }}</p>

        <form v-on:submit.prevent class="widden">
          <combobox-task-type
            :task-type-list="getApplicableTaskTypes()"
            v-model="form.task_type_id"
          />
        </form>

        <div class="flexrow">
          <div class="filler"></div>
          <combobox
            class="flexrow-item"
            :options="selectionOptions"
            :with-margin="false"
            v-model="selectionOnly"
          />
          <a
            :class="{
              button: true,
              'flexrow-item': true,
              'is-primary': true,
              'is-loading': isLoadingStay
            }"
            @click="confirmAndStayClicked"
          >
            {{ $t('main.confirmation_and_stay') }}
          </a>
          <a
            :class="{
              button: true,
              'flexrow-item': true,
              'is-primary': true,
              'is-loading': isLoading
            }"
            @click="confirmClicked"
          >
            {{ $t('main.confirmation') }}
          </a>
          <button @click="$emit('cancel')" class="button is-link">
            {{ $t('main.cancel') }}
          </button>
        </div>
        <p class="error has-text-right info-message" v-if="isError">
          {{ errorText }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import Combobox from '@/components/widgets/Combobox'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import PageTitle from '@/components/widgets/PageTitle'

export default {
  name: 'create-task-modal',
  mixins: [modalMixin],

  components: {
    Combobox,
    ComboboxTaskType,
    PageTitle
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    errorText: {
      type: String,
      default: ''
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isLoadingStay: {
      type: Boolean,
      default: false
    },
    isSuccess: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      form: {
        task_type_id: ''
      },
      selectionOnly: 'true',
      selectionOptions: [
        { label: this.$t('tasks.for_selection'), value: 'true' },
        { label: this.$t('tasks.for_project'), value: 'false' }
      ]
    }
  },

  computed: {
    ...mapGetters([
      'productionAssetTaskTypes',
      'productionEditTaskTypes',
      'productionEpisodeTaskTypes',
      'productionShotTaskTypes',
      'productionSequenceTaskTypes'
    ]),
    isAssetTasks() {
      return this.$route.path.indexOf('assets') >= 0
    },
    isShotsTasks() {
      return this.$route.path.indexOf('shots') >= 0
    },
    isSequencesTasks() {
      return this.$route.path.indexOf('sequences') >= 0
    },
    isEpisodesTasks() {
      return this.$route.path.indexOf('episodes') >= 0
    },
    isEditsTasks() {
      return this.$route.path.indexOf('edits') >= 0
    }
  },

  methods: {
    ...mapActions([]),

    getApplicableTaskTypes() {
      if (this.isAssetTasks) {
        return this.productionAssetTaskTypes
      }
      if (this.isShotsTasks) {
        return this.productionShotTaskTypes
      }
      if (this.isSequencesTasks) {
        return this.productionSequenceTaskTypes
      }
      if (this.isEpisodesTasks) {
        return this.productionEpisodeTaskTypes
      }
      if (this.isEditsTasks) {
        return this.productionEditTaskTypes
      }
    },

    confirmClicked() {
      this.$emit('confirm', {
        form: this.form,
        selectionOnly: this.selectionOnly === 'true'
      })
    },

    confirmAndStayClicked() {
      this.$emit('confirm-and-stay', {
        form: this.form,
        selectionOnly: this.selectionOnly === 'true'
      })
    }
  },

  mounted() {
    const taskTypes = this.getApplicableTaskTypes()

    if (taskTypes.length > 0) {
      this.form.task_type_id = taskTypes[0].id
    }
  }
}
</script>

<style lang="scss" scoped>
.info-message {
  margin-top: 1em;
}

.widden {
  margin-bottom: 12em;
}

.flexrow-item {
  margin-right: 0;
}
</style>
