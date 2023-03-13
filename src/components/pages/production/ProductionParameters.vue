<template>
  <div class="columns">
    <div class="column is-one-third box">
      <!-- Form -->
      <form class="form" v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('productions.fields.name')"
          @enter="runConfirmation"
          v-focus
          v-model="form.name"
        />
        <div class="columns">
          <div class="mr1">
            <date-field
              ref="startDateField"
              :label="$t('productions.fields.start_date')"
              :short-date="true"
              v-model="form.start_date"
            />
          </div>
          <div>
            <date-field
              ref="endDateField"
              :label="$t('productions.fields.end_date')"
              :short-date="true"
              v-model="form.end_date"
            />
          </div>
        </div>
        <combobox
          ref="productionTypeField"
          localeKeyPrefix="productions.type."
          :label="$t('productions.fields.type')"
          :options="productionTypeOptions"
          @enter="runConfirmation"
          v-model="form.production_type"
        />

        <text-field
          ref="nbEpisodesField"
          :label="$t('productions.fields.nb_episodes')"
          @enter="runConfirmation"
          v-focus
          v-model="form.nb_episodes"
          v-if="currentProduction && currentProduction.id && isLocalTVShow"
        />
        <!--text-field
          ref="episodesSpanField"
          :label="$t('productions.fields.episode_span')"
          @enter="runConfirmation"
          v-focus
          v-model="form.episode_span"
          v-if="currentProduction && currentProduction.id && isLocalTVShow"
        /-->

        <text-field
          ref="fpsField"
          :label="$t('productions.fields.fps')"
          @enter="runConfirmation"
          v-focus
          v-model="form.fps"
          v-if="currentProduction && currentProduction.id"
        />
        <text-field
          ref="ratioField"
          :label="$t('productions.fields.ratio')"
          @enter="runConfirmation"
          v-focus
          v-model="form.ratio"
          v-if="currentProduction && currentProduction.id"
        />
        <text-field
          ref="resolutionField"
          :label="$t('productions.fields.resolution')"
          @enter="runConfirmation"
          v-focus
          v-model="form.resolution"
          v-if="currentProduction && currentProduction.id"
        />
        <combobox-boolean
          ref="isClientsIsolatedField"
          :label="$t('productions.fields.is_clients_isolated')"
          @enter="runConfirmation"
          v-focus
          v-model="form.is_clients_isolated"
          v-if="currentProduction && currentProduction.id"
        />
        <text-field
          ref="maxRetakesField"
          type="number"
          :step="1"
          :label="$t('productions.fields.max_retakes')"
          @enter="runConfirmation"
          v-focus
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
            @click="editParameters"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { formatSimpleDate, parseSimpleDate } from '@/lib/time'
import { PRODUCTION_TYPE_OPTIONS } from '@/lib/productions'

import Combobox from '@/components/widgets/Combobox'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean'
import DateField from '@/components/widgets/DateField'
import FileUpload from '@/components/widgets/FileUpload'
import TextField from '@/components/widgets/TextField'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

export default {
  name: 'production-parameters',
  components: {
    Combobox,
    ComboboxBoolean,
    DateField,
    FileUpload,
    TextField,
    ButtonSimple
  },

  data() {
    return {
      formData: null,
      isLoading: false,
      isError: false,
      isLocalTVShow: false,
      productionTypeOptions: PRODUCTION_TYPE_OPTIONS,
      form: {
        name: '',
        start_date: new Date(),
        end_date: new Date(),
        nb_episodes: 0,
        episode_span: 0,
        fps: '',
        max_retakes: 0,
        is_clients_isolated: 'false',
        ratio: '',
        resolution: '',
        production_type: 'short'
      }
    }
  },
  computed: {
    ...mapGetters([
      'currentProduction',
      'productionAvatarFormData',
      'productionStatus',
      'isTVShow'
    ])
  },
  mounted() {
    this.resetForm()
  },
  watch: {
    currentProduction: {
      handler() {
        this.resetForm()
        this.updateTvShowRelatedDatas(this.isTVShow)
      },
      deep: true
    },
    'form.production_type'(newProductionType) {
      this.updateTvShowRelatedDatas(newProductionType === 'tvshow')
    }
  },
  methods: {
    ...mapActions([
      'editProduction',
      'storeProductionPicture',
      'uploadProductionAvatar'
    ]),

    onFileSelected(formData) {
      this.formData = formData
      this.storeProductionPicture(formData)
    },

    isEmpty(str) {
      return !str || str.length === 0
    },

    runConfirmation() {
      this.$emit('confirm', this.form)
    },

    // Update the isLocalTVShow boolean and changes values linked to tvshow in form
    updateTvShowRelatedDatas(isTVShow) {
      this.isLocalTVShow = isTVShow
      if (isTVShow && this.currentProduction) {
        this.form.nb_episodes = this.currentProduction.nb_episodes
        this.form.episode_span = this.currentProduction.episode_span
      } else {
        this.form.nb_episodes = 0
        this.form.episode_span = 0
      }
    },

    resetForm() {
      if (this.currentProduction) {
        this.form = {
          name: this.currentProduction.name,
          start_date: parseSimpleDate(
            this.currentProduction.start_date
          ).toDate(),
          end_date: parseSimpleDate(this.currentProduction.end_date).toDate(),
          production_type: this.currentProduction.production_type || 'short',
          episode_span: this.currentProduction.episode_span,
          fps: this.currentProduction.fps,
          max_retakes: this.currentProduction.max_retakes,
          nb_episodes: this.currentProduction.nb_episodes,
          is_clients_isolated: this.currentProduction.is_clients_isolated
            ? 'true'
            : 'false',
          ratio: this.currentProduction.ratio,
          resolution: this.currentProduction.resolution
        }
      } else {
        this.form = {
          name: '',
          start_date: new Date(),
          end_date: new Date(),
          production_type: 'short',
          nb_episodes: 0,
          episode_span: 0,
          max_retakes: 0,
          is_clients_isolated: 'false',
          fps: '',
          ratio: '',
          resolution: ''
        }
      }
    },

    async editParameters() {
      this.isLoading = true
      try {
        await this.editProduction({
          id: this.currentProduction.id,
          ...this.form,
          start_date: formatSimpleDate(this.form.start_date),
          end_date: formatSimpleDate(this.form.end_date)
        })
        if (this.productionAvatarFormData) {
          await this.uploadProductionAvatar(this.currentProduction.id)
        }
      } catch {
        this.isLoading = false
        this.isError = true
        return
      }
      this.isLoading = false
    }
  }
}
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
