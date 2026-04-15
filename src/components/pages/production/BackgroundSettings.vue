<template>
  <div class="background-settings">
    <div class="flexrow mt1 mb1" v-if="remainingBackgrounds.length">
      <combobox
        class="flexrow-item mb0"
        :options="remainingBackgroundsOptions"
        v-model="backgroundToAdd"
      />
      <button class="button flexrow-item" @click="onAdd">
        {{ $t('main.add') }}
      </button>
    </div>
    <div class="box" v-if="linkedBackgrounds.length === 0">
      {{ $t('settings.production.empty_backgrounds') }}
    </div>
    <table class="datatable" v-else>
      <thead class="datatable-head">
        <tr>
          <th class="name">{{ $t('backgrounds.fields.name') }}</th>
          <th class="is-default">
            {{ $t('backgrounds.fields.is_default') }}
          </th>
          <th class="actions"></th>
        </tr>
      </thead>
      <tbody class="datatable-body">
        <tr
          class="datatable-row"
          v-for="background in linkedBackgrounds"
          :key="background.id"
        >
          <td class="name">
            <span class="flexrow">
              <a
                class="thumbnail-wrapper thumbnail-picture entity-thumbnail flexrow-item"
                :href="background.url"
                target="_blank"
                v-if="background.url"
              >
                <img
                  :src="background.thumbnail"
                  :alt="background.name"
                  width="100"
                  height="67"
                />
              </a>
              {{ background.name }}
            </span>
          </td>
          <td class="is-default">
            <boolean-field
              class="ml05 mb0"
              :disabled="isGlobalDefault(background)"
              :label="$t('backgrounds.fields.is_default')"
              :model-value="String(isCurrentDefault(background))"
              @click="value => onSetDefault(background, value === 'true')"
            />
          </td>
          <td>
            <button class="button" @click="$emit('remove', background.id)">
              {{ $t('main.remove') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p class="has-text-centered nb-backgrounds" v-if="linkedBackgrounds.length">
      {{ linkedBackgrounds.length }}
      {{
        $t('backgrounds.number', linkedBackgrounds.length, {
          n: linkedBackgrounds.length
        })
      }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import BooleanField from '@/components/widgets/BooleanField.vue'
import Combobox from '@/components/widgets/Combobox.vue'

const props = defineProps({
  backgrounds: { type: Array, default: () => [] },
  allBackgrounds: { type: Array, default: () => [] },
  defaultBackgroundId: { type: String, default: null }
})

const emit = defineEmits(['add', 'remove', 'set-default'])

const backgroundToAdd = ref(null)

const backgroundMap = computed(() => {
  const map = new Map()
  props.allBackgrounds.forEach(bg => map.set(bg.id, bg))
  return map
})

const linkedBackgrounds = computed(() =>
  props.backgrounds
    .map(bg => {
      const full = backgroundMap.value.get(bg.id) || bg
      return { ...full, ...bg }
    })
    .filter(Boolean)
)

const linkedIds = computed(() => new Set(props.backgrounds.map(bg => bg.id)))

const remainingBackgrounds = computed(() =>
  props.allBackgrounds.filter(bg => !linkedIds.value.has(bg.id))
)

const remainingBackgroundsOptions = computed(() =>
  remainingBackgrounds.value.map(bg => ({
    label: bg.name,
    value: bg.id
  }))
)

const resetSelection = () => {
  backgroundToAdd.value = remainingBackgrounds.value[0]?.id || null
}

watch(
  remainingBackgrounds,
  () => {
    resetSelection()
  },
  { immediate: true }
)

const isGlobalDefault = background => {
  return background.is_default && isCurrentDefault(background)
}

const isCurrentDefault = background => {
  return props.defaultBackgroundId
    ? background.id === props.defaultBackgroundId
    : Boolean(background.is_default)
}

const onAdd = () => {
  if (!backgroundToAdd.value) return
  emit('add', backgroundToAdd.value)
}

const onSetDefault = (background, isDefault) => {
  emit('set-default', isDefault ? background.id : null)
}
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  width: 300px;
  min-width: 300px;
  font-weight: bold;
  word-break: break-word;

  .entity-thumbnail {
    display: flex;
    border-radius: 5px;
    max-width: none;

    img {
      background-color: black;
      border-radius: inherit;
      min-width: 100px;
    }
  }
}

.is-default {
  text-align: center;
  width: 200px;
  white-space: nowrap;
}

.nb-backgrounds {
  margin-top: 1em;
  color: var(--text);
}
</style>
