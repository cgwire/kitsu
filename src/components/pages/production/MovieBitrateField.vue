<template>
  <div class="movie-bitrate-field">
    <text-field
      ref="fieldRef"
      type="number"
      :description="description"
      :label="label"
      :placeholder="defaultBitrate"
      v-model="bitrate"
      @change="onChange"
    />
    <p class="bitrate-info">
      <span class="bitrate-size">
        {{ $t('productions.video.bitrate_size', { size }) }}
      </span>
      <span v-if="isDefaultMax">
        {{ $t('productions.video.bitrate_default_max', { value: max }) }}
      </span>
      <template v-else>
        <span>
          {{
            $t('productions.video.bitrate_default', { value: defaultBitrate })
          }}
        </span>
        <span v-if="isLowDefinition">
          {{ $t('productions.video.ld_bitrate_max', { value: max }) }}
        </span>
        <span v-else>
          {{ $t('productions.video.bitrate_max', { value: max }) }}
        </span>
      </template>
      <button
        class="button is-link restore-button"
        type="button"
        @click="restoreDefault"
        v-if="isModified"
      >
        {{ $t('productions.video.restore_default') }}
      </button>
    </p>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed, ref } from 'vue'

import {
  clampBitrate,
  getMovieMegabytesPerMinute,
  parseBitrate
} from '@/lib/productions'

import TextField from '@/components/widgets/TextField.vue'

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  // The highest value the field keeps once left, when above max: the low
  // definition field takes up to the instance ceiling and leaves the save
  // to lower it under the high definition bitrate, whatever the order of
  // the edits.
  ceiling: { type: Number, default: null },
  defaultValue: { type: Number, required: true },
  description: { type: String, default: '' },
  // Its maximum is then the high definition bitrate.
  isLowDefinition: { type: Boolean, default: false },
  label: { type: String, default: '' },
  // The instance high definition bitrate, or the high definition bitrate
  // of the form for the low definition field.
  max: { type: Number, required: true }
})

const bitrate = defineModel({ type: [Number, String], default: '' })

// State
// --------------------------------------------------------------------------
const fieldRef = ref(null)

// Computed
// --------------------------------------------------------------------------
// Zou never encodes the low definition version above the high definition
// one: an empty field gets the default within the ceiling.
const defaultBitrate = computed(() => Math.min(props.defaultValue, props.max))

const effectiveBitrate = computed(
  () => clampBitrate(bitrate.value, props.max) ?? defaultBitrate.value
)

const size = computed(() => getMovieMegabytesPerMinute(effectiveBitrate.value))

// The high definition bitrate defaults to the instance ceiling: one figure
// says both.
const isDefaultMax = computed(
  () => !props.isLowDefinition && defaultBitrate.value === props.max
)

const isModified = computed(() => {
  const value = parseBitrate(bitrate.value)
  return value !== null && value !== defaultBitrate.value
})

// Functions
// --------------------------------------------------------------------------
// The field takes any number and leaving it brings the value within the
// bounds, as the task type rows do: no browser error on save.
const onChange = () => {
  const value = clampBitrate(bitrate.value, props.ceiling ?? props.max)
  if (value !== null && value !== bitrate.value) {
    bitrate.value = value
  }
}

// An empty field follows the default, even once the default changes. The
// button hides itself once clicked: the focus goes to the field instead of
// falling back on the page.
const restoreDefault = () => {
  bitrate.value = null
  fieldRef.value.focus()
}
</script>

<style lang="scss" scoped>
.movie-bitrate-field {
  margin-bottom: 1.5em;

  :deep(.field) {
    margin-bottom: 0;
  }
}

.bitrate-info {
  align-items: baseline;
  color: var(--text-alt);
  display: flex;
  flex-wrap: wrap;
  font-size: 0.9em;
  gap: 0 0.8em;
  margin-top: 0.2em;
}

.bitrate-size {
  font-variant-numeric: tabular-nums;
}

// The padding keeps the hover and focus styles of the button off its text,
// the margin keeps the text in line with the rest.
.restore-button {
  font-size: 1em;
  height: auto;
  margin-left: -0.4em;
  padding: 0 0.4em;
}
</style>
