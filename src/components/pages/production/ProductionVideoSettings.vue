<template>
  <form class="production-video form" @submit.prevent="save">
    <div class="box section encoding">
      <h2 class="subtitle">{{ $t('productions.video.encoding_title') }}</h2>
      <p class="explanation mb1">
        {{ $t('productions.video.encoding_explanation') }}
      </p>
      <text-field
        type="number"
        :max="60"
        :step="0.001"
        :label="$t('productions.fields.fps')"
        placeholder="25"
        v-model="form.fps"
      />
      <text-field
        :label="$t('productions.fields.ratio')"
        placeholder="16:9"
        :maxlength="10"
        v-model.trim="form.ratio"
      />
      <text-field
        :label="$t('productions.fields.resolution')"
        placeholder="1920x1080"
        v-model.trim="form.resolution"
      />
    </div>

    <div class="box section bitrates">
      <h2 class="subtitle">{{ $t('productions.video.bitrates') }}</h2>
      <p class="explanation mb1">
        {{ $t('productions.video.bitrate_explanation') }}
      </p>
      <movie-bitrate-field
        :default-value="bitrateDefaults.hd_bitrate_compression"
        :description="$t('productions.video.hd_bitrate_description')"
        :label="$t('productions.fields.hd_bitrate_compression')"
        :max="bitrateDefaults.hd_bitrate_compression"
        v-model="form.hd_bitrate_compression"
      />
      <movie-bitrate-field
        :ceiling="bitrateDefaults.hd_bitrate_compression"
        :default-value="bitrateDefaults.ld_bitrate_compression"
        :description="$t('productions.video.ld_bitrate_description')"
        is-low-definition
        :label="$t('productions.fields.ld_bitrate_compression')"
        :max="ldBitrateCeiling"
        v-model="form.ld_bitrate_compression"
      />
    </div>

    <div class="box section previews">
      <h2 class="subtitle">{{ $t('productions.video.previews_title') }}</h2>
      <text-field
        class="number-line"
        type="number"
        :step="1"
        :min="0"
        :max="8"
        :description="$t('productions.video.revision_padding_description')"
        :label="$t('productions.fields.revision_padding')"
        v-model="form.revision_padding"
      />
      <checkbox
        class="mb1"
        :toggle="true"
        :label="$t('productions.fields.is_preview_download_allowed')"
        v-model="form.is_preview_download_allowed"
      />
      <checkbox
        class="mb1"
        :toggle="true"
        :label="$t('productions.fields.is_set_preview_automated')"
        v-model="form.is_set_preview_automated"
      />
      <checkbox
        class="mb1"
        :toggle="true"
        :label="$t('productions.fields.is_single_preview_per_revision')"
        v-model="form.is_single_preview_per_revision"
      />
      <checkbox
        class="mb0"
        :toggle="true"
        :label="$t('productions.fields.is_frame_in_numbering')"
        v-model="form.is_frame_in_numbering"
      />
      <p class="field-help mb1">
        {{ $t('productions.video.frame_in_description') }}
      </p>
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
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { clampBitrate, clampBitrates } from '@/lib/productions'

import MovieBitrateField from '@/components/pages/production/MovieBitrateField.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import TextField from '@/components/widgets/TextField.vue'

// Composables
// --------------------------------------------------------------------------
const store = useStore()

// State
// --------------------------------------------------------------------------
const form = ref({})
const isLoading = ref(false)
const isError = ref(false)

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const bitrateDefaults = computed(() => store.getters.movieBitrateDefaults)

const ldBitrateCeiling = computed(
  () =>
    clampBitrate(
      form.value.hd_bitrate_compression,
      bitrateDefaults.value.hd_bitrate_compression
    ) ?? bitrateDefaults.value.hd_bitrate_compression
)

// Functions
// --------------------------------------------------------------------------
const resetForm = () => {
  const production = currentProduction.value || {}
  form.value = {
    fps: production.fps ?? '',
    ratio: production.ratio ?? '',
    resolution: production.resolution ?? '',
    hd_bitrate_compression: production.hd_bitrate_compression ?? '',
    ld_bitrate_compression: production.ld_bitrate_compression ?? '',
    revision_padding: production.revision_padding ?? 0,
    is_frame_in_numbering: !!production.is_frame_in_numbering,
    is_preview_download_allowed: !!production.is_preview_download_allowed,
    is_set_preview_automated: !!production.is_set_preview_automated,
    is_single_preview_per_revision: !!production.is_single_preview_per_revision
  }
}

const save = async () => {
  isLoading.value = true
  isError.value = false
  const bitrates = clampBitrates(form.value, {
    max: bitrateDefaults.value.hd_bitrate_compression
  })
  Object.assign(form.value, bitrates)
  try {
    await store.dispatch('editProduction', {
      ...form.value,
      id: currentProduction.value.id,
      ...bitrates
    })
  } catch {
    isError.value = true
  }
  isLoading.value = false
}

// Watchers
// --------------------------------------------------------------------------
watch(currentProduction, resetForm, { deep: true })

// Lifecycle
// --------------------------------------------------------------------------
onMounted(resetForm)
</script>

<style lang="scss" scoped>
.production-video {
  margin-bottom: 2em;
}
</style>
