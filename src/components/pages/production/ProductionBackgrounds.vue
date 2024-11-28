<template>
  <div class="production-backgrounds">
    <div class="flexrow mt1 mb1" v-if="remainingBackgrounds?.length">
      <combobox
        class="flexrow-item mb0"
        :options="remainingBackgroundsOptions"
        v-model="selectedBackgroundId"
      />
      <button class="button flexrow-item" @click="addBackground">
        {{ $t('main.add') }}
      </button>
    </div>
    <div class="box" v-if="!currentProduction.preview_background_files?.length">
      {{ $t('settings.production.empty_list') }}
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
          :key="background.id"
          v-for="background in productionBackgrounds"
        >
          <td class="name">
            <span class="flexrow">
              <a
                class="thumbnail-wrapper thumbnail-picture entity-thumbnail flexrow-item"
                :href="background.url"
                target="_blank"
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
              :disabled="isGlobalDefaultBackground(background)"
              :label="$t('backgrounds.fields.is_default')"
              :model-value="String(isCurrentDefaultBackground(background))"
              @click="setDefaultBackground(background, $event === 'true')"
            />
          </td>
          <td>
            <button class="button" @click="removeBackground(background.id)">
              {{ $t('main.remove') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import BooleanField from '@/components/widgets/BooleanField.vue'
import Combobox from '@/components/widgets/Combobox.vue'

export default {
  name: 'production-backgrounds',

  components: {
    BooleanField,
    Combobox
  },

  data() {
    return {
      selectedBackgroundId: null
    }
  },

  computed: {
    ...mapGetters([
      'backgrounds',
      'currentProduction',
      'productionBackgrounds'
    ]),

    remainingBackgrounds() {
      return this.backgrounds.filter(
        ({ id }) =>
          !this.currentProduction.preview_background_files.includes(id)
      )
    },

    remainingBackgroundsOptions() {
      return this.remainingBackgrounds.map(background => ({
        label: background.name,
        value: background.id
      }))
    }
  },

  methods: {
    ...mapActions([
      'addBackgroundToProduction',
      'removeBackgroundFromProduction',
      'setDefaultBackgroundToProduction'
    ]),

    addBackground() {
      this.addBackgroundToProduction(this.selectedBackgroundId)
    },

    removeBackground(backgroundId) {
      this.removeBackgroundFromProduction(backgroundId)
    },

    resetSelection() {
      this.selectedBackgroundId = this.remainingBackgrounds[0]?.id || ''
    },

    isGlobalDefaultBackground(background) {
      return (
        background.is_default && this.isCurrentDefaultBackground(background)
      )
    },

    isCurrentDefaultBackground(background) {
      const defaultId =
        this.currentProduction.default_preview_background_file_id
      return defaultId ? background.id === defaultId : background.is_default
    },

    setDefaultBackground(background, isDefault) {
      this.setDefaultBackgroundToProduction(isDefault ? background.id : null)
    }
  },

  watch: {
    remainingBackgrounds: {
      deep: true,
      immediate: true,
      handler() {
        this.resetSelection()
      }
    }
  }
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
</style>
