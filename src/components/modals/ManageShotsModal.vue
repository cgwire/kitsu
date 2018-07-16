<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">

    <div class="box">

      <page-title :text="$t('shots.manage')">
      </page-title>

      <div class="shot-columns">

        <div class="shot-column">

          <h2 class="subtitle">Episodes</h2>
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
          <h2 class="subtitle">Sequences</h2>
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
          <h2 class="subtitle">Shots</h2>
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
        <router-link
          :to="cancelRoute"
          class="button is-link">
          {{ $t("main.close") }}
        </router-link>
      </p>
    </div>

  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PageTitle from '../widgets/PageTitle'
import stringHelpers from '../../lib/string'

export default {
  name: 'manage-shot-modal',
  components: {
    PageTitle
  },

  props: [
    'onConfirmClicked',
    'text',
    'active',
    'cancelRoute',
    'errorText'
  ],

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
      selectedSequenceId: null
    }
  },

  watch: {
    active () {
      if (this.active) {
        setTimeout(() => {
          this.$refs.addEpisodeInput.focus()
        }, 100)
      }
    }
  },

  computed: {
    ...mapGetters([
      'episodes',
      'sequences',
      'shotMap',
      'currentProduction'
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
      return !isEmpty && !isExist && this.selectedEpisodeId
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
      'newShot'
    ]),

    focusAddSequence () {
      this.$refs.addSequenceInput.focus()
    },

    focusAddShot () {
      this.$refs.addShotInput.focus()
    },

    selectEpisode (episodeId) {
      this.selectedEpisodeId = episodeId
      this.displayedSequences = this.sequences.filter((sequence) => {
        return sequence.parent_id === episodeId
      })
      this.displayedShots = []
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
              if (err) console.log(err)
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
        if (sequenceName.length > 0 && this.selectedEpisodeId) {
          this.loading.addSequence = true
          const sequence = {
            name: this.names.sequence,
            episode_id: this.selectedEpisodeId,
            project_id: this.currentProduction.id
          }
          this.newSequence({
            sequence,
            callback: (err, sequence) => {
              if (err) console.log(err)
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
              if (err) console.log(err)
              this.loading.addShot = false
              this.selectSequence(this.selectedSequenceId)
              this.names.shot = stringHelpers.generateNextName(shot.name)
            }
          })
        }
      }
    }
  }
}
</script>

<style scoped>
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
  border: 1px solid #CCC;
  border-bottom: 0;
}

.shot-column .field {
  display: flex;
  margin-bottom: 0;
  margin-right: 10px;
  flex-direction: column;
}

.shot-column .button,
.shot-column .input {
  border-radius: 0;
}

.entity-line {
  cursor: pointer;
}

.entity-line:hover {
  background: #ecfaec;
}

.entity-line.selected {
  background: #D1C4E9;
  border: 0;
}

.modal-footer {
}

input::placeholder {
  color: #BBB;
}
</style>
