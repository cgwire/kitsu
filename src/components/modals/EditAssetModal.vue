<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <combobox
        :label="$t('assets.fields.type')"
        :options="productionAssetTypeOptions"
        v-model="form.entity_type_id"
      />
      <combobox
        ref="episodeField"
        :label="$t('assets.fields.episode')"
        :options="episodeOptions"
        required
        v-model="form.source_id"
        v-if="isTVShow"
      />
      <text-field
        ref="nameField"
        :label="$t('assets.fields.name')"
        :maxlength="160"
        v-model.trim="form.name"
        @enter="runConfirmation"
        v-focus
      />
      <textarea-field
        :label="$t('assets.fields.description')"
        v-model="form.description"
        @keyup.ctrl.enter="runConfirmation"
        @keyup.meta.enter="runConfirmation"
      />
      <text-field
        :label="$t('shots.fields.resolution')"
        :placeholder="currentProduction?.resolution"
        v-model.trim="form.data.resolution"
        @enter="runConfirmation"
      />
      <template v-if="assetToEdit">
        <metadata-field
          :key="descriptor.id"
          :descriptor="descriptor"
          :entity="assetToEdit"
          @enter="runConfirmation"
          v-model="form.data[descriptor.field_name]"
          v-for="descriptor in assetMetadataDescriptors"
        />
      </template>
      <combobox-boolean
        :label="$t('assets.fields.shared')"
        v-model="form.is_shared"
        @enter="runConfirmation"
      />
    </form>

    <div class="has-text-right">
      <a
        :class="{
          button: true,
          'is-primary': true,
          'is-loading': isLoadingStay
        }"
        @click="confirmAndStayClicked"
        v-if="!assetToEdit?.id"
      >
        {{ $t('main.confirmation_and_stay') }}
      </a>
      <a
        :class="{
          button: true,
          'is-primary': true,
          'is-loading': isLoading
        }"
        @click="confirmClicked"
      >
        {{ $t('main.confirmation') }}
      </a>
      <button class="button is-link" @click="$emit('cancel')">
        {{ $t('main.close') }}
      </button>
      <p class="error has-text-right info-message" v-if="isError">
        {{ $t('assets.edit_fail') }}
      </p>
      <p class="success has-text-right info-message" v-if="isSuccess">
        {{ assetSuccessText }}
      </p>
    </div>
  </base-modal>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import BaseModal from '@/components/modals/BaseModal.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import MetadataField from '@/components/widgets/MetadataField.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

const { t } = useI18n()
const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  assetToEdit: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  isLoadingStay: { type: Boolean, default: false },
  isSuccess: { type: Boolean, default: false },
  text: { type: String, default: '' }
})

const emit = defineEmits(['cancel', 'confirm', 'confirm-and-stay'])

const form = ref({
  name: '',
  description: '',
  source_id: 'null',
  data: { resolution: '' },
  is_shared: 'false'
})
const assetSuccessText = ref('')
const episodeField = ref(null)
const nameField = ref(null)

const assetCreated = computed(() => store.getters.assetCreated)
const assetMetadataDescriptors = computed(
  () => store.getters.assetMetadataDescriptors
)
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const episodes = computed(() => store.getters.episodes)
const isTVShow = computed(() => store.getters.isTVShow)
const openProductions = computed(() => store.getters.openProductions)
const productionAssetTypeOptions = computed(
  () => store.getters.productionAssetTypeOptions
)

const isEditing = computed(() => Boolean(props.assetToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? `${t('assets.edit_title')} ${props.assetToEdit.name}`
    : t('assets.new_asset')
)

const episodeOptions = computed(() => {
  const options = episodes.value.map(episode => ({
    label: episode.name,
    value: episode.id
  }))
  if (currentProduction.value?.production_style !== 'video-game') {
    options.unshift({ label: t('main.main_pack'), value: 'null' })
  }
  return options
})

const validateForm = () => {
  if (isTVShow.value && !episodeField.value?.isValid) {
    episodeField.value?.focus()
    return false
  }
  if (!form.value.name) {
    nameField.value?.focus()
    return false
  }
  return true
}

const buildPayload = () => ({
  ...form.value,
  is_shared: form.value.is_shared === 'true'
})

const confirmClicked = () => {
  if (!validateForm()) return
  emit('confirm', buildPayload())
}

const confirmAndStayClicked = () => {
  if (!validateForm()) return
  emit('confirm-and-stay', buildPayload())
}

const runConfirmation = () => {
  if (isEditing.value) confirmClicked()
  else confirmAndStayClicked()
}

const getEntityTypeIdDefaultValue = () => {
  const options = productionAssetTypeOptions.value
  let entityTypeId = props.assetToEdit.asset_type_id || options[0]?.value
  const isInOptions = options.some(option => option.value === entityTypeId)
  if (!isInOptions) entityTypeId = options[0]?.value
  return entityTypeId
}

const resetForm = () => {
  if (isEditing.value) {
    form.value = {
      entity_type_id: getEntityTypeIdDefaultValue(),
      project_id: props.assetToEdit.project_id,
      name: props.assetToEdit.name,
      description: props.assetToEdit.description,
      source_id:
        props.assetToEdit.source_id || props.assetToEdit.episode_id || 'null',
      data: {
        ...props.assetToEdit.data,
        resolution: props.assetToEdit.data?.resolution || ''
      },
      is_shared: String(props.assetToEdit.is_shared === true)
    }
  } else {
    if (!form.value.entity_type_id && productionAssetTypeOptions.value[0]) {
      form.value.entity_type_id = productionAssetTypeOptions.value[0].value
    }
    if (openProductions.value.length > 0) {
      form.value.project_id = currentProduction.value?.id || ''
    }
    form.value.name = ''
    form.value.description = ''
    form.value.source_id = ['all', 'main'].includes(currentEpisode.value?.id)
      ? 'null'
      : currentEpisode.value?.id || 'null'
    form.value.data = {}
    form.value.is_shared = 'false'
  }
}

watch(() => props.assetToEdit, resetForm)

watch(assetCreated, value => {
  assetSuccessText.value = isEditing.value
    ? t('assets.edit_success', { name: value })
    : t('assets.new_success', { name: value })
})

watch(
  () => props.active,
  active => {
    assetSuccessText.value = ''
    resetForm()
    if (active) {
      setTimeout(() => {
        nameField.value?.focus()
      }, 100)
    }
  }
)

watch(currentProduction, () => {
  form.value.entity_type_id = null
  resetForm()
})

onMounted(() => {
  resetForm()
  assetSuccessText.value = ''
})
</script>

<style lang="scss" scoped>
.info-message {
  margin-top: 1em;
}
</style>
