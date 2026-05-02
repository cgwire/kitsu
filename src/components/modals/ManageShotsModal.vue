<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box">
        <page-title class="title" :text="$t('shots.manage')" />
        <div class="explanation">{{ $t('shots.creation_explanation') }}</div>
        <div>
          <div class="flexrow">
            <combobox
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
                v-for="episode in displayedEpisodes"
              >
                {{ episode.name }}
              </div>
            </div>
            <div class="field">
              <input
                class="input"
                ref="addEpisodeInput"
                :placeholder="$t('episodes.fields.placeholder')"
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
                {{ $t('main.add') }}
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
                v-for="sequence in displayedSequences"
              >
                {{ sequence.name }}
              </div>
            </div>
            <div class="field">
              <input
                class="input"
                ref="addSequenceInput"
                :placeholder="$t('sequences.fields.placeholder')"
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
                {{ $t('main.add') }}
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
                :placeholder="$t('shots.fields.placeholder')"
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
                :disabled="!isAddShotAllowed || loading.addShot"
                @click="addShot"
              >
                {{ $t('main.add') }}
              </button>
            </div>
          </div>
        </div>

        <p class="has-text-right modal-footer">
          <button @click="$emit('cancel')" class="button is-link">
            {{ $t('main.close') }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useModal } from '@/composables/modal'
import { sortByName } from '@/lib/sorting'
import stringHelpers from '@/lib/string'
import shotStore from '@/store/modules/shots'

import Combobox from '@/components/widgets/Combobox.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'

const router = useRouter()
const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: true }
})

const emit = defineEmits(['add-episode', 'add-sequence', 'add-shot', 'cancel'])

useModal(toRef(props, 'active'), emit)

const shotPaddingOptions = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '10', value: '10' }
]

const addEpisodeInput = ref(null)
const addSequenceInput = ref(null)
const addShotInput = ref(null)

const names = reactive({ episode: '', sequence: '', shot: '' })
const loading = reactive({
  addEpisode: false,
  addSequence: false,
  addShot: false
})
const sequences = ref([])
const displayedShots = ref([])
const selectedEpisodeId = ref(null)
const selectedSequenceId = ref(null)
const shotPadding = ref('1')

const currentProduction = computed(() => store.getters.currentProduction)
const displayedEpisodes = computed(() => store.getters.displayedEpisodes)
const displayedSequences = computed(() => store.getters.displayedSequences)
const isTVShow = computed(() => store.getters.isTVShow)

const shots = computed(() => shotStore.cache.shots)

const isAddEpisodeAllowed = computed(() => {
  if (!names.episode) return false
  return !displayedEpisodes.value.find(
    episode => names.episode === episode.name
  )
})

const isAddSequenceAllowed = computed(() => {
  if (!names.sequence) return false
  const exists = displayedSequences.value.find(
    sequence => names.sequence === sequence.name
  )
  return !exists && (selectedEpisodeId.value || !isTVShow.value)
})

const isAddShotAllowed = computed(() => {
  if (!names.shot) return false
  const exists = displayedShots.value.find(shot => names.shot === shot.name)
  return !exists && selectedSequenceId.value
})

const focusAddSequence = () => {
  addSequenceInput.value?.focus()
}

const focusAddShot = () => {
  addShotInput.value?.focus()
}

const selectSequence = sequenceId => {
  selectedSequenceId.value = sequenceId
  displayedShots.value = sortByName(
    shots.value.filter(shot => shot.sequence_id === sequenceId)
  )
}

const selectEpisode = episodeId => {
  selectedEpisodeId.value = episodeId
  if (!isTVShow.value) {
    displayedShots.value = []
  } else {
    router.push({
      name: 'episode-shots',
      params: {
        production_id: currentProduction.value.id,
        episode_id: episodeId
      }
    })
  }
}

const addEpisode = () => {
  if (!isAddEpisodeAllowed.value) return
  loading.addEpisode = true
  const episode = {
    name: names.episode,
    project_id: currentProduction.value.id
  }
  emit('add-episode', episode, created => {
    loading.addEpisode = false
    selectEpisode(created.id)
    names.episode = stringHelpers.generateNextName(created.name)
  })
}

const addSequence = () => {
  if (!isAddSequenceAllowed.value) return
  loading.addSequence = true
  const sequence = {
    name: names.sequence,
    episode_id: selectedEpisodeId.value,
    project_id: currentProduction.value.id
  }
  emit('add-sequence', sequence, created => {
    loading.addSequence = false
    selectEpisode(selectedEpisodeId.value)
    selectSequence(created.id)
    names.sequence = stringHelpers.generateNextName(created.name)
  })
}

const addShot = () => {
  if (!isAddShotAllowed.value || loading.addShot) return
  loading.addShot = true
  const shot = {
    name: names.shot,
    sequence_id: selectedSequenceId.value,
    project_id: currentProduction.value.id
  }
  emit('add-shot', shot, created => {
    loading.addShot = false
    selectSequence(selectedSequenceId.value)
    names.shot = stringHelpers.generateNextName(
      created.name,
      parseInt(shotPadding.value)
    )
  })
}

watch(
  () => props.active,
  active => {
    if (!active) return
    shotPadding.value = '1'
    sequences.value = displayedSequences.value
    if (isTVShow.value) {
      selectEpisode(displayedEpisodes.value[0].id)
    } else if (sequences.value.length > 0) {
      selectSequence(sequences.value[0].id)
    }
    setTimeout(() => {
      if (isTVShow.value) {
        addEpisodeInput.value?.focus()
      } else {
        addSequenceInput.value?.focus()
      }
    }, 100)
  }
)

watch(selectedEpisodeId, () => {
  sequences.value = displayedSequences.value
  if (sequences.value.length > 0) {
    selectSequence(sequences.value[0].id)
  }
})

defineExpose({ focusAddSequence, focusAddShot })
</script>

<style lang="scss" scoped>
.dark {
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
  border: 1px solid $light-grey;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom: 0;
  flex: 1;
  margin-top: 4px;
  margin-right: 10px;
  overflow-y: scroll;
}

.shot-column .field {
  display: flex;
  margin-bottom: 0;
  margin-right: 10px;
  flex-direction: column;
}

.shot-column .button {
  margin-left: 0;
  border-radius: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.shot-column .input {
  border-radius: 0;
}

.entity-line {
  cursor: pointer;
  padding: 0.3em;
}

.entity-line:hover {
  background: var(--background-selectable);
}

.entity-line.selected {
  background: var(--background-selected);
  border: 0;
}

.modal-footer {
  padding: 1em 1em 0 1em;
}

input::placeholder {
  color: #bbb;
}

.explanation {
  margin-bottom: 1em;
}

.subtitle {
  margin-bottom: 0;
}

.shot-padding {
  margin-right: 1em;
}
</style>
