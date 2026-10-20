<template>
  <div class="production-parameters">
    <form class="form" @submit.prevent="editParameters">
      <div class="box section general">
        <h2 class="subtitle">
          {{ $t('productions.parameters.general_title') }}
        </h2>
        <header class="picture-header" v-if="currentProduction?.id">
          <production-name
            :production="currentProduction"
            :size="120"
            only-avatar
          />
          <div class="picture-actions">
            <button
              class="link-button"
              type="button"
              @click="modals.avatar = true"
            >
              {{ $t('productions.picture') }}
            </button>
            <template v-if="currentProduction.has_avatar">
              <span class="dot">·</span>
              <button
                class="link-button muted"
                type="button"
                :disabled="loading.avatar"
                @click="removePicture"
              >
                {{ $t('productions.remove_picture') }}
              </button>
            </template>
          </div>
        </header>
        <text-field
          :label="$t('productions.fields.name')"
          :maxlength="80"
          required
          v-focus
          v-model.trim="form.name"
        />
        <text-field
          :label="$t('productions.fields.code')"
          :maxlength="80"
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
          :options="PRODUCTION_TYPE_OPTIONS"
          v-model="form.production_type"
        />

        <combobox-styled
          class="mb2"
          locale-key-prefix="productions.style."
          :label="$t('productions.fields.style')"
          :options="PRODUCTION_STYLE_OPTIONS"
          v-model="form.production_style"
          v-if="currentProduction?.id"
        />

        <combobox-styled
          class="mb2"
          locale-key-prefix="productions.homepage."
          :label="$t('productions.fields.homepage')"
          :options="HOME_PAGE_OPTIONS"
          v-model="form.homepage"
          v-if="currentProduction?.id"
        />
      </div>

      <div class="box section comments">
        <h2 class="subtitle">
          {{ $t('productions.parameters.comments_and_retakes') }}
        </h2>
        <text-field
          class="number-line"
          type="number"
          :step="1"
          :description="$t('productions.parameters.max_retakes_description')"
          :label="$t('productions.fields.max_retakes')"
          v-model="form.max_retakes"
          v-if="currentProduction?.id"
        />

        <template v-if="currentProduction?.id">
          <checkbox
            class="mb0"
            :toggle="true"
            :label="$t('productions.fields.is_publish_default')"
            v-model="form.is_publish_default_for_artists"
          />
          <p class="field-help mb2">
            {{ $t('productions.parameters.publish_default_description') }}
          </p>
        </template>
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

    <change-avatar-modal
      :active="modals.avatar"
      :is-loading="loading.avatar"
      :is-error="errors.avatar"
      shape="rounded"
      :title="$t('productions.picture')"
      @confirm="uploadPicture"
      @cancel="modals.avatar = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'

import {
  HOME_PAGE_OPTIONS,
  PRODUCTION_STYLE_OPTIONS,
  PRODUCTION_TYPE_OPTIONS
} from '@/lib/productions'
import { formatSimpleDate, parseSimpleDate } from '@/lib/time'

import ChangeAvatarModal from '@/components/modals/ChangeAvatarModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import DateField from '@/components/widgets/DateField.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'
import TextField from '@/components/widgets/TextField.vue'

const store = useStore()

// State
// --------------------------------------------------------------------------
const isLoading = ref(false)
const isError = ref(false)
const modals = reactive({ avatar: false })
const loading = reactive({ avatar: false })
const errors = reactive({ avatar: false })

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
  is_publish_default_for_artists: false,
  homepage: HOME_PAGE_OPTIONS[0].value
})

const form = ref(emptyForm())

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const isTVShow = computed(() => store.getters.isTVShow)

// Functions
// --------------------------------------------------------------------------
const uploadPicture = async formData => {
  loading.avatar = true
  errors.avatar = false
  try {
    await store.dispatch('storeProductionPicture', formData)
    await store.dispatch('uploadProductionAvatar', currentProduction.value.id)
    modals.avatar = false
  } catch (err) {
    console.error(err)
    errors.avatar = true
  } finally {
    store.dispatch('storeProductionPicture', null)
    loading.avatar = false
  }
}

const removePicture = async () => {
  loading.avatar = true
  try {
    await store.dispatch('editProduction', {
      id: currentProduction.value.id,
      has_avatar: false
    })
  } catch (err) {
    console.error(err)
  } finally {
    loading.avatar = false
  }
}

const updateTvShowRelatedDatas = tvShow => {
  if (tvShow && currentProduction.value) {
    form.value.nb_episodes = currentProduction.value.nb_episodes
    form.value.episode_span = currentProduction.value.episode_span
  } else {
    form.value.nb_episodes = 0
    form.value.episode_span = 0
  }
}

const resetForm = () => {
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
      max_retakes: production.max_retakes,
      nb_episodes: production.nb_episodes,
      is_publish_default_for_artists:
        !!production.is_publish_default_for_artists,
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

// Watchers
// --------------------------------------------------------------------------
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

// Lifecycle
// --------------------------------------------------------------------------
onMounted(resetForm)
</script>

<style lang="scss" scoped>
.columns {
  margin-bottom: 2em;
}

.production-parameters {
  margin-bottom: 2em;
}

.picture-header {
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: 1rem 0 2rem;
}

.picture-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  margin-top: 1rem;
}

.dot {
  color: var(--text-alt);
}

.link-button {
  background: none;
  border: none;
  color: $green;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }

  &.muted {
    color: var(--text-alt);
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
}
</style>
