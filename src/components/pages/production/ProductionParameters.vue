<template>
  <div class="columns">
    <div class="column is-one-third box">
      <form class="form" @submit.prevent="editParameters">
        <text-field
          :label="$t('productions.fields.name')"
          :maxlength="80"
          @enter="runConfirmation"
          required
          v-focus
          v-model.trim="form.name"
        />
        <text-field
          :label="$t('productions.fields.code')"
          :maxlength="80"
          @enter="runConfirmation"
          v-model.trim="form.code"
        />
        <div class="columns">
          <div class="mr1">
            <date-field
              class="mb0"
              :can-delete="false"
              :label="$t('productions.fields.start_date')"
              :max-date="form.end_date"
              :with-margin="false"
              v-model="form.start_date"
            />
          </div>
          <div>
            <date-field
              class="mb0"
              :can-delete="false"
              :label="$t('productions.fields.end_date')"
              :min-date="form.start_date"
              :with-margin="false"
              v-model="form.end_date"
            />
          </div>
        </div>

        <combobox-styled
          class="mb2"
          locale-key-prefix="productions.type."
          :label="$t('productions.fields.type')"
          :options="productionTypeOptions"
          @enter="runConfirmation"
          v-model="form.production_type"
        />

        <combobox-styled
          class="mb2"
          locale-key-prefix="productions.style."
          :label="$t('productions.fields.style')"
          :options="productionStyleOptions"
          @enter="runConfirmation"
          v-model="form.production_style"
          v-if="currentProduction && currentProduction.id"
        />

        <combobox-styled
          class="mb2"
          locale-key-prefix="productions.homepage."
          :label="$t('productions.fields.homepage')"
          :options="homepageOptions"
          @enter="runConfirmation"
          v-model="form.homepage"
          v-if="currentProduction && currentProduction.id"
        />

        <!--text-field
          type="number"
          :step="1"
          :label="$t('productions.fields.nb_episodes')"
          @enter="runConfirmation"
          v-model="form.nb_episodes"
          v-if="currentProduction && currentProduction.id && isLocalTVShow"
        /-->
        <!--text-field
          :label="$t('productions.fields.episode_span')"
          @enter="runConfirmation"
          v-focus
          v-model="form.episode_span"
          v-if="currentProduction && currentProduction.id && isLocalTVShow"
        /-->

        <text-field
          type="number"
          :max="60"
          :step="0.001"
          :label="$t('productions.fields.fps')"
          placeholder="25"
          @enter="runConfirmation"
          v-model="form.fps"
          v-if="currentProduction && currentProduction.id"
        />
        <text-field
          :label="$t('productions.fields.ratio')"
          placeholder="16:9"
          :maxlength="10"
          @enter="runConfirmation"
          v-model.trim="form.ratio"
          v-if="currentProduction && currentProduction.id"
        />
        <text-field
          :label="$t('productions.fields.resolution')"
          placeholder="1920x1080"
          @enter="runConfirmation"
          v-model.trim="form.resolution"
          v-if="currentProduction && currentProduction.id"
        />
        <combobox-boolean
          :label="$t('productions.fields.is_clients_isolated')"
          @enter="runConfirmation"
          v-model="form.is_clients_isolated"
          v-if="currentProduction && currentProduction.id"
        />
        <combobox-boolean
          :label="$t('productions.fields.is_preview_download_allowed')"
          @enter="runConfirmation"
          v-model="form.is_preview_download_allowed"
          v-if="currentProduction && currentProduction.id"
        />
        <combobox-boolean
          :label="$t('productions.fields.is_set_preview_automated')"
          @enter="runConfirmation"
          v-model="form.is_set_preview_automated"
          v-if="currentProduction && currentProduction.id"
        />
        <combobox-boolean
          :label="$t('productions.fields.is_publish_default')"
          @enter="runConfirmation"
          v-model="form.is_publish_default_for_artists"
          v-if="currentProduction && currentProduction.id"
        />
        <text-field
          type="number"
          :step="1"
          :label="$t('productions.fields.max_retakes')"
          @enter="runConfirmation"
          v-model="form.max_retakes"
          v-if="currentProduction && currentProduction.id"
        />
        <div v-if="currentProduction && currentProduction.id">
          <label class="label">{{ $t('productions.picture') }}</label>
          <file-upload
            ref="fileField"
            :is-primary="false"
            :label="$t('main.csv.upload_file')"
            @fileselected="onFileSelected"
            accept=".png,.jpg,.jpeg"
          />
        </div>
        <p v-if="isError" class="error mt1">
          {{ $t('productions.edit_error') }}
        </p>
        <div class="has-text-right mt2">
          <button-simple
            :is-primary="true"
            :class="{ 'is-loading': isLoading }"
            :disabled="isLoading"
            :text="$t('main.save')"
            type="submit"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useStore } from 'vuex'

import { formatSimpleDate, parseSimpleDate } from '@/lib/time'
import {
  PRODUCTION_TYPE_OPTIONS,
  PRODUCTION_STYLE_OPTIONS,
  HOME_PAGE_OPTIONS
} from '@/lib/productions'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import DateField from '@/components/widgets/DateField.vue'
import FileUpload from '@/components/widgets/FileUpload.vue'
import TextField from '@/components/widgets/TextField.vue'

const emit = defineEmits(['confirm'])

const store = useStore()

const fileField = useTemplateRef('fileField')

const isLoading = ref(false)
const isError = ref(false)
const isLocalTVShow = ref(false)
const productionTypeOptions = PRODUCTION_TYPE_OPTIONS
const productionStyleOptions = PRODUCTION_STYLE_OPTIONS
const homepageOptions = HOME_PAGE_OPTIONS

const emptyForm = () => ({
  name: '',
  code: '',
  start_date: new Date(),
  end_date: new Date(),
  production_type: 'short',
  production_style: '2d3d',
  nb_episodes: 0,
  episode_span: 0,
  max_retakes: 0,
  is_clients_isolated: 'false',
  is_preview_download_allowed: 'false',
  is_set_preview_automated: 'false',
  is_publish_default_for_artists: 'false',
  fps: '',
  ratio: '',
  resolution: '',
  homepage: HOME_PAGE_OPTIONS[0].value
})

const form = ref(emptyForm())

const currentProduction = computed(() => store.getters.currentProduction)
const productionAvatarFormData = computed(
  () => store.getters.productionAvatarFormData
)
const isTVShow = computed(() => store.getters.isTVShow)

const onFileSelected = formData => {
  store.dispatch('storeProductionPicture', formData)
}

const runConfirmation = () => {
  emit('confirm', form.value)
}

const updateTvShowRelatedDatas = tvShow => {
  isLocalTVShow.value = tvShow
  if (tvShow && currentProduction.value) {
    form.value.nb_episodes = currentProduction.value.nb_episodes
    form.value.episode_span = currentProduction.value.episode_span
  } else {
    form.value.nb_episodes = 0
    form.value.episode_span = 0
  }
}

const resetForm = () => {
  fileField.value?.reset()
  store.dispatch('storeProductionPicture', null)

  const production = currentProduction.value
  if (production) {
    form.value = {
      name: production.name,
      code: production.code,
      start_date: parseSimpleDate(production.start_date).toDate(),
      end_date: parseSimpleDate(production.end_date).toDate(),
      production_type: production.production_type || 'short',
      production_style: production.production_style || '2d3d',
      episode_span: production.episode_span,
      fps: production.fps,
      max_retakes: production.max_retakes,
      nb_episodes: production.nb_episodes,
      is_clients_isolated: production.is_clients_isolated ? 'true' : 'false',
      is_preview_download_allowed: production.is_preview_download_allowed
        ? 'true'
        : 'false',
      is_set_preview_automated: production.is_set_preview_automated
        ? 'true'
        : 'false',
      is_publish_default_for_artists: production.is_publish_default_for_artists
        ? 'true'
        : 'false',
      ratio: production.ratio,
      resolution: production.resolution,
      homepage: production.homepage
    }
  } else {
    form.value = emptyForm()
  }
}

const editParameters = async () => {
  isLoading.value = true
  isError.value = false
  try {
    if (productionAvatarFormData.value) {
      await store.dispatch('uploadProductionAvatar', currentProduction.value.id)
    }
    await store.dispatch('editProduction', {
      ...form.value,
      id: currentProduction.value.id,
      start_date: formatSimpleDate(form.value.start_date),
      end_date: formatSimpleDate(form.value.end_date)
    })
  } catch {
    isError.value = true
  }
  isLoading.value = false
}

onMounted(() => {
  resetForm()
})

watch(
  currentProduction,
  () => {
    resetForm()
    updateTvShowRelatedDatas(isTVShow.value)
  },
  { deep: true }
)

watch(
  () => form.value.production_type,
  newType => {
    updateTvShowRelatedDatas(newType === 'tvshow')
  }
)
</script>

<style lang="scss" scoped>
.columns {
  margin-bottom: 2em;
}

.column {
  overflow-y: initial;
  padding: initial;
}

.box {
  padding: 1em;
}
</style>
