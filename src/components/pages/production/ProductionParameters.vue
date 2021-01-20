<template>
  <div class="columns">
    <div class="column is-one-third">
      <!-- Form -->
      <form class="form" v-on:submit.prevent>
        <text-field
          v-model="form.name"
          v-focus
          ref="nameField"
          :label="$t('productions.fields.name')"
          @enter="runConfirmation"
        />
        <div class="columns">
          <div class="column is-half">
            <date-field
              v-model="form.start_date"
              :label="$t('productions.fields.start_date')"
              ref="startDateField"
            />
          </div>
          <div class="column is-half">
            <date-field
              v-model="form.end_date"
              :label="$t('productions.fields.end_date')"
              ref="endDateField"
             />
          </div>
        </div>
        <!-- Add v-model -->
        <combobox
          v-model="form.production_type"
          localeKeyPrefix="productions.type."
          :label="$t('productions.fields.type')"
          :options="productionTypeOptions"
          @enter="runConfirmation"
          ref="productionTypeField"
        />

        <text-field
          v-model="form.nb_episodes"
          v-focus
          :label="$t('productions.fields.nb_episodes')"
          @enter="runConfirmation"
          ref="nbEpisodesField"
          v-if="currentProduction && currentProduction.id && isLocalTVShow"
        />
        <text-field
          v-model="form.episode_span"
          v-focus
          :label="$t('productions.fields.episode_span')"
          @enter="runConfirmation"
          ref="episodesSpanField"
          v-if="currentProduction && currentProduction.id && isLocalTVShow"
        />

        <text-field
          v-model="form.fps"
          v-focus
          :label="$t('productions.fields.fps')"
          @enter="runConfirmation"
          ref="fpsField"
          v-if="currentProduction && currentProduction.id"
        />
        <text-field
          v-model="form.ratio"
          v-focus
          :label="$t('productions.fields.ratio')"
          @enter="runConfirmation"
          ref="ratioField"
          v-if="currentProduction && currentProduction.id"
        />
        <text-field
          v-model="form.resolution"
          v-focus
          :label="$t('productions.fields.resolution')"
          ref="resolutionField"
          @enter="runConfirmation"
          v-if="currentProduction && currentProduction.id"
        />
        <div v-if="currentProduction && currentProduction.id">
          <span class="label">{{ $t("productions.picture") }}</span>
          <file-upload
            :label="$t('main.csv.upload_file')"
            @fileselected="onFileSelected"
            accept=".png,.jpg,.jpeg"
            ref="fileField"
          />
        </div>
        <p v-if="isError" class="error mt1">
          {{ $t('productions.edit_error') }}
        </p>
        <div class="has-text-right">
          <div>
            <button-simple
              class="is-primary is-rounded"
              :class="{'is-loading': isLoading}"
              :disabled="isLoading"
              :text="$t('productions.parameters.save.button')"
              @click="editParameters"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import { formatSimpleDate } from '@/lib/time'

import Combobox from '@/components/widgets/Combobox'
import DateField from '@/components/widgets/DateField'
import FileUpload from '@/components/widgets/FileUpload'
import TextField from '@/components/widgets/TextField'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

export default {
  name: 'production-parameters',
  components: {
    Combobox,
    DateField,
    FileUpload,
    TextField,
    ButtonSimple
  },

  data () {
    return {
      formData: null,
      isLoading: false,
      isError: false,
      isLocalTVShow: false,
      productionTypeOptions: [
        {
          label: 'short',
          value: 'short'
        },
        {
          label: 'featurefilm',
          value: 'featurefilm'
        },
        {
          label: 'tvshow',
          value: 'tvshow'
        }
      ],
      form: {
        name: '',
        start_date: new Date(),
        end_date: new Date(),
        nb_episodes: 0,
        episode_span: 0,
        project_status_id: this.productionStatus ? this.productionStatus[0].id : null,
        fps: '',
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
  mounted () {
    this.resetForm()
  },
  watch: {
    currentProduction () {
      this.resetForm()
      this.updateTvShowRelatedDatas(this.isTVShow)
    },
    'form.production_type' (newProductionType) {
      this.updateTvShowRelatedDatas(newProductionType === 'tvshow')
    }
  },
  methods: {
    ...mapActions([
      'editProduction',
      'storeProductionPicture',
      'uploadProductionAvatar'
    ]),

    onFileSelected (formData) {
      this.formData = formData
      this.storeProductionPicture(formData)
    },

    isEmpty (str) {
      return (!str || str.length === 0)
    },

    runConfirmation () {
      this.$emit('confirm', this.form)
    },

    // Update the isLocalTVShow boolean and changes values linked to tvshow in form
    updateTvShowRelatedDatas (isTVShow) {
      this.isLocalTVShow = isTVShow
      if (isTVShow && this.currentProduction) {
        this.form.nb_episodes = this.currentProduction.nb_episodes
        this.form.episode_span = this.currentProduction.episode_span
      } else {
        this.form.nb_episodes = 0
        this.form.episode_span = 0
      }
    },

    resetForm () {
      if (this.currentProduction) {
        this.form = {
          name: this.currentProduction.name,
          start_date: new Date(this.currentProduction.start_date),
          end_date: new Date(this.currentProduction.end_date),
          production_type: this.currentProduction.production_type || 'short',
          nb_episodes: this.currentProduction.nb_episodes,
          episode_span: this.currentProduction.episode_span,
          project_status_id: this.currentProduction.project_status_id,
          fps: this.currentProduction.fps,
          ratio: this.currentProduction.ratio,
          resolution: this.currentProduction.resolution
        }
        this.form.project_status_id = null
        this.$nextTick(() => {
          this.form.project_status_id = this.currentProduction.project_status_id
        })
      } else {
        this.form = {
          name: '',
          start_date: new Date(),
          end_date: new Date(),
          production_type: 'short',
          nb_episodes: 0,
          episode_span: 0,
          project_status_id: this.productionStatusOptions[0].value,
          fps: '',
          ratio: '',
          resolution: ''
        }
      }
    },

    async editParameters () {
      this.isLoading = true
      try {
        await this.editProduction(
          {
            id: this.currentProduction.id,
            ...this.form,
            start_date: formatSimpleDate(this.form.start_date),
            end_date: formatSimpleDate(this.form.end_date)
          }
        )
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
.column {
  overflow-y: initial;
  padding: initial;
}
</style>
