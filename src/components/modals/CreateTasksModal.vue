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
        <form @submit.prevent class="widden">
          <combobox-task-type
            class="mb1"
            :task-type-list="getApplicableTaskTypes()"
            v-model="form.task_type_id"
          />
          <div class="disclaimer">
            <router-link
              :to="{
                name: 'production-settings',
                params: {
                  production_id: currentProduction?.id
                },
                query: {
                  tab: 'taskTypes'
                }
              }"
              target="_blank"
            >
              {{ $t('tasks.create_tasks_disclaimer') }}
            </router-link>
          </div>
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
import { mapGetters } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'

export default {
  name: 'create-tasks-modal',

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
    text: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },

  emits: ['cancel', 'confirm', 'confirm-and-stay'],

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
      'currentProduction',
      'productionAssetTaskTypes',
      'productionEditTaskTypes',
      'productionEpisodeTaskTypes',
      'productionShotTaskTypes',
      'productionSequenceTaskTypes'
    ]),

    isAssetTasks() {
      return this.$route.path.includes('assets')
    },
    isShotsTasks() {
      return this.$route.path.includes('shots')
    },
    isSequencesTasks() {
      return this.$route.path.includes('sequences')
    },
    isEditsTasks() {
      return this.$route.path.includes('edits')
    },
    isEpisodesTasks() {
      return this.$route.path.includes('episodes')
    }
  },

  methods: {
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
      if (this.isEditsTasks) {
        return this.productionEditTaskTypes
      }
      if (this.isEpisodesTasks) {
        return this.productionEpisodeTaskTypes
      }
      return []
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

.disclaimer {
  font-size: 0.8em;
  font-style: italic;
}
</style>
