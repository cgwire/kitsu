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

<script setup>
import { computed, onMounted, ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { useModal } from '@/composables/modal'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  errorText: { type: String, default: '' },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  isLoadingStay: { type: Boolean, default: false },
  text: { type: String, default: '' },
  title: { type: String, default: '' }
})

const emit = defineEmits(['cancel', 'confirm', 'confirm-and-stay'])

useModal(toRef(props, 'active'), emit)

const form = ref({ task_type_id: '' })
const selectionOnly = ref('true')

const currentProduction = computed(() => store.getters.currentProduction)
const productionAssetTaskTypes = computed(
  () => store.getters.productionAssetTaskTypes
)
const productionEditTaskTypes = computed(
  () => store.getters.productionEditTaskTypes
)
const productionEpisodeTaskTypes = computed(
  () => store.getters.productionEpisodeTaskTypes
)
const productionSequenceTaskTypes = computed(
  () => store.getters.productionSequenceTaskTypes
)
const productionShotTaskTypes = computed(
  () => store.getters.productionShotTaskTypes
)

const selectionOptions = computed(() => [
  { label: t('tasks.for_selection'), value: 'true' },
  { label: t('tasks.for_project'), value: 'false' }
])

const getApplicableTaskTypes = () => {
  const path = route.path
  if (path.includes('assets')) return productionAssetTaskTypes.value
  if (path.includes('shots')) return productionShotTaskTypes.value
  if (path.includes('sequences')) return productionSequenceTaskTypes.value
  if (path.includes('edits')) return productionEditTaskTypes.value
  if (path.includes('episodes')) return productionEpisodeTaskTypes.value
  return []
}

const buildPayload = () => ({
  form: form.value,
  selectionOnly: selectionOnly.value === 'true'
})

const confirmClicked = () => {
  emit('confirm', buildPayload())
}

const confirmAndStayClicked = () => {
  emit('confirm-and-stay', buildPayload())
}

onMounted(() => {
  const taskTypes = getApplicableTaskTypes()
  if (taskTypes.length > 0) {
    form.value.task_type_id = taskTypes[0].id
  }
})
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
