<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">

    <div class="box">

      <page-title class="title" :text="$t('shots.manage')" />
      <div class="explaination">{{ $t('shots.creation_explaination') }}</div>
      <div>
        <div class="flexrow">
          <span class="filler">
          </span>
          <combobox
            ref="shot-padding"
            :label="$t('shots.padding')"
            :options="shotPaddingOptions"
            class="shot-padding flexrow-item"
            v-model="shotPadding"
          />
        </div>
      </div>

      <div class="shot-columns">
        <div class="shot-column" v-if="isTVShow">
          <h2 class="subtitle">{{ $t('shots.episodes') }}</h2>

          <div class="list">
            <div
              :class="{
                'entity-line': true,
                selected: episode.id === selectedEpisodeId
              }"
              :key="episode.id"
              @click="selectEpisode(episode.id)"
              v-for="episode in episodes"
            >
              {{ episode.name }}
            </div>
          </div>
          <div class="field">
            <input
              class="input"
              ref="addEpisodeInput"
              placeholder="EP01"
              type="text"
              @keyup.tab="focusAddSequence"
              @keyup.enter="addEpisode"
              v-model="names.episode"
              v-focus
            />
            <button
              :class="{
                button: true,
                'is-success': true,
                'is-loading': loading.addEpisode
              }"
              :disabled="!isAddEpisodeAllowed"
              @click="addEpisode"
            >
              {{ $t('main.add')}}
            </button>
          </div>
        </div>

        <div class="shot-column">
          <h2 class="subtitle">{{ $t('shots.sequences') }}</h2>
          <div class="list">
            <div
              :class="{
                'entity-line': true,
                selected: sequence.id === selectedSequenceId
              }"
              :key="sequence.id"
              @keyup.tab="focusAddShot"
              @click="selectSequence(sequence.id)"
              v-for="sequence in displayedSequences">
              {{ sequence.name }}
            </div>
          </div>
          <div class="field">
            <input
              class="input"
              ref="addSequenceInput"
              placeholder="SQ01"
              type="text"
              @keyup.enter="addSequence"
              v-model="names.sequence"
            />
            <button
              :class="{
                button: true,
                'is-success': true,
                'is-loading': loading.addSequence
              }"
              :disabled="!isAddSequenceAllowed"
              @click="addSequence"
            >
              {{ $t('main.add')}}
            </button>
          </div>
        </div>

        <div class="shot-column">
          <h2 class="subtitle">{{ $t('shots.title') }}</h2>
          <div class="list">
            <div
              class="entity-line"
              :key="shot.id"
              v-for="shot in displayedShots"
            >
              {{ shot.name }}
            </div>
          </div>
          <div class="field">
            <input
              class="input"
              placeholder="SH01"
              ref="addShotInput"
              type="text"
              @keyup.enter="addShot"
              v-model="names.shot"
            />
          </div>
          <div class="field">
            <button
              :class="{
                button: true,
                'is-success': true,
                'is-loading': loading.addShot
              }"
              :disabled="!isAddShotAllowed"
              @click="addShot"
            >
              {{ $t('main.add')}}
            </button>
          </div>
        </div>
      </div>

      <p class="has-text-right modal-footer">
        <button
          @click="$emit('cancel')"
          class="button is-link"
        >
          {{ $t("main.close") }}
        </button>
      </p>
    </div>

  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { modalMixin } from './base_modal'

import Combobox from '../widgets/Combobox'
import PageTitle from '../widgets/PageTitle'
import stringHelpers from '../../lib/string'

export default {
  name: 'manage-shot-modal',
  mixins: [modalMixin],

  components: {
    Combobox,
    PageTitle
  },

  props: {
    active: {
      default: true,
      type: Boolean
    }
  },

  data () {
    return {
      names: {
        episode: '',
        sequence: '',
        shot: ''
      },
      loading: {
        addEpisode: false,
        addSequence: false,
        addShot: false
      },
      displayedSequences: [],
      displayedShots: [],
      selectedEpisodeId: null,
      selectedSequenceId: null,
      shotPaddingOptions: [
        {
          label: '1',
          padding: '1'
        },
        {
          label: '2',
          padding: '2'
        },
        {
          label: '10',
          padding: '10'
        }
      ],
      shotPadding: '1'
    }
  },

  watch: {
    active () {
      if (this.active) {
        this.shotPadding = '1'
        setTimeout(() => {
          if (this.isTVShow) {
            this.$refs.addEpisodeInput.focus()
          } else {
            this.$refs.addSequenceInput.focus()
          }
        }, 100)
      }
    },

    sequences () {
      this.displayedSequences = this.sequences
      this.displayedShots = []
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'episodes',
      'isTVShow',
      'sequences',
      'shotMap'
    ]),

    isAddEpisodeAllowed () {
      const isEmpty = this.names.episode === ''
      const isExist = this.episodes.find((episode) => {
        return this.names.episode === episode.name
      })
      return !isEmpty && !isExist
    },

    isAddSequenceAllowed () {
      const isEmpty = this.names.sequence === ''
      const isExist = this.displayedSequences.find((sequence) => {
        return this.names.sequence === sequence.name
      })
      return !isEmpty && !isExist && (this.selectedEpisodeId || !this.isTVShow)
    },

    isAddShotAllowed () {
      const isEmpty = this.names.shot === ''
      const isExist = this.displayedShots.find((shot) => {
        return this.names.shot === shot.name
      })
      return !isEmpty && !isExist && this.selectedSequenceId
    }
  },

  methods: {
    ...mapActions([
      'newEpisode',
      'newSequence',
      'newShot',
      'setCurrentEpisode'
    ]),

    focusAddSequence () {
      this.$refs.addSequenceInput.focus()
    },

    focusAddShot () {
      this.$refs.addShotInput.focus()
    },

    selectEpisode (episodeId) {
      if (!this.isTVShow) {
        this.selectedEpisodeId = episodeId
        this.displayedSequences = this.sequences.filter((sequence) => {
          return sequence.parent_id === episodeId
        })
        this.displayedShots = []
      } else {
        this.selectedEpisodeId = episodeId
        this.$router.push({
          name: 'episode-shots',
          params: {
            production_id: this.currentProduction.id,
            episode_id: episodeId
          }
        })
      }
    },

    selectSequence (sequenceId) {
      this.selectedSequenceId = sequenceId
      this.displayedShots = Object.values(this.shotMap).filter((shot) => {
        return shot.sequence_id === sequenceId
      })
    },

    addEpisode () {
      if (this.isAddEpisodeAllowed) {
        const episodeName = this.names.episode
        if (episodeName.length > 0) {
          this.loading.addEpisode = true
          const episode = {
            name: this.names.episode,
            project_id: this.currentProduction.id
          }
          this.newEpisode({
            episode,
            callback: (err, episode) => {
              if (err) console.error(err)
              this.loading.addEpisode = false
              this.selectEpisode(episode.id)
              this.names.episode = stringHelpers.generateNextName(episode.name)
            }
          })
        }
      }
    },

    addSequence () {
      if (this.isAddSequenceAllowed) {
        const sequenceName = this.names.sequence
        if (
          sequenceName.length > 0 &&
          (this.selectedEpisodeId || !this.isTVShow)
        ) {
          this.loading.addSequence = true
          const sequence = {
            name: this.names.sequence,
            episode_id: this.selectedEpisodeId,
            project_id: this.currentProduction.id
          }
          this.newSequence({
            sequence,
            callback: (err, sequence) => {
              if (err) console.error(err)
              this.loading.addSequence = false
              this.selectEpisode(this.selectedEpisodeId)
              this.selectSequence(sequence.id)
              this.names.sequence = stringHelpers.generateNextName(
                sequence.name
              )
            }
          })
        }
      }
    },

    addShot () {
      if (this.isAddShotAllowed) {
        const shotName = this.names.shot
        this.loading.addShot = true
        if (shotName.length > 0 && this.selectedSequenceId) {
          const shot = {
            name: this.names.shot,
            sequence_id: this.selectedSequenceId,
            project_id: this.currentProduction.id
          }
          this.loading.addShot = false
          this.newShot({
            shot,
            callback: (err) => {
              if (err) console.error(err)
              this.loading.addShot = false
              this.selectSequence(this.selectedSequenceId)
              this.names.shot = stringHelpers.generateNextName(
                shot.name,
                parseInt(this.shotPadding)
              )
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .entity-line.selected {
    background: $purple-strong;
  }

  .entity-line:hover {
    background: $green;
  }

  .shot-column .list {
    border: 1px solid $dark-grey;
  }
}

.shot-columns {
  display: flex;
  height: 300px;
}

.shot-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shot-column .list {
  margin-right: 10px;
  overflow-y: scroll;
  flex: 1;
  border: 1px solid $light-grey;
  border-bottom: 0;
}

.shot-column .field {
  display: flex;
  margin-bottom: 0;
  margin-right: 10px;
  flex-direction: column;
}

.shot-column .button {
  margin-left: 0;
}

.shot-column .button,
.shot-column .input {
  border-radius: 0;
}

.entity-line {
  cursor: pointer;
}

.entity-line:hover {
  background: $light-green;
}

.entity-line.selected {
  background: $purple;
  border: 0;
}

.modal-footer {
  padding: 1em 1em 0 1em;
}

input::placeholder {
  color: #BBB;
}

.explaination {
  margin-bottom: 1em;
}

.subtitle {
  margin-bottom: 0;
}

.shot-padding {
  margin-right: 1em;
}
</style>
