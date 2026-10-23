<template>
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
      v-model="fps"
    />
    <text-field
      :label="$t('productions.fields.ratio')"
      placeholder="16:9"
      :maxlength="10"
      v-model.trim="ratio"
    />
    <p class="field-error" v-if="errors.ratio">{{ errors.ratio }}</p>
    <text-field
      :label="$t('productions.fields.resolution')"
      placeholder="1920x1080"
      v-model.trim="resolution"
    />
    <p class="field-error" v-if="errors.resolution">
      {{ errors.resolution }}
    </p>
  </div>

  <div class="box section bitrates">
    <h2 class="subtitle">{{ $t('productions.video.bitrates') }}</h2>
    <p class="explanation mb1">
      {{ $t('productions.video.bitrate_explanation') }}
    </p>
    <movie-bitrate-field
      :default-value="defaultBitrates.hd_bitrate_compression"
      :description="$t('productions.video.hd_bitrate_description')"
      :label="$t('productions.fields.hd_bitrate_compression')"
      :max="defaultBitrates.hd_bitrate_compression"
      v-model="hdBitrate"
    />
    <movie-bitrate-field
      :ceiling="defaultBitrates.hd_bitrate_compression"
      :default-value="defaultBitrates.ld_bitrate_compression"
      :description="$t('productions.video.ld_bitrate_description')"
      is-low-definition
      :label="$t('productions.fields.ld_bitrate_compression')"
      :max="ldBitrateCeiling"
      v-model="ldBitrate"
    />
  </div>

  <div class="box section previews">
    <h2 class="subtitle">{{ $t('productions.video.previews_title') }}</h2>
    <slot name="previews-extra" />
    <checkbox
      class="mb1"
      :toggle="true"
      :label="$t('productions.fields.is_preview_download_allowed')"
      v-model="isPreviewDownloadAllowed"
    />
    <checkbox
      class="mb1"
      :toggle="true"
      :label="$t('productions.fields.is_set_preview_automated')"
      v-model="isSetPreviewAutomated"
    />
    <checkbox
      class="mb1"
      :toggle="true"
      :label="$t('productions.fields.is_single_preview_per_revision')"
      v-model="isSinglePreviewPerRevision"
    />
    <checkbox
      class="mb0"
      :toggle="true"
      :label="$t('productions.fields.is_frame_in_numbering')"
      v-model="isFrameInNumbering"
    />
    <p class="field-help mb1">
      {{ $t('productions.video.frame_in_description') }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import { clampBitrate } from '@/lib/productions'

import MovieBitrateField from '@/components/pages/production/MovieBitrateField.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import TextField from '@/components/widgets/TextField.vue'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  // Instance bitrates: { hd_bitrate_compression, ld_bitrate_compression }.
  defaultBitrates: { type: Object, default: () => ({}) },
  // Optional { ratio, resolution } messages.
  errors: { type: Object, default: () => ({}) },
  modelValue: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:model-value'])

// Computed
// --------------------------------------------------------------------------
const field = key =>
  computed({
    get: () => props.modelValue[key],
    set: value =>
      emit('update:model-value', { ...props.modelValue, [key]: value })
  })

const fps = field('fps')
const ratio = field('ratio')
const resolution = field('resolution')
const hdBitrate = field('hd_bitrate_compression')
const ldBitrate = field('ld_bitrate_compression')
const isPreviewDownloadAllowed = field('is_preview_download_allowed')
const isSetPreviewAutomated = field('is_set_preview_automated')
const isSinglePreviewPerRevision = field('is_single_preview_per_revision')
const isFrameInNumbering = field('is_frame_in_numbering')

const ldBitrateCeiling = computed(
  () =>
    clampBitrate(
      props.modelValue.hd_bitrate_compression,
      props.defaultBitrates.hd_bitrate_compression
    ) ?? props.defaultBitrates.hd_bitrate_compression
)
</script>

<style lang="scss" scoped>
.field-error {
  color: $red;
  font-size: 0.85em;
  margin-top: -1.4rem;
  margin-bottom: 0.5em;
}
</style>
