<template>
  <div class="preview-card flexcolumn">
    <entity-preview
      :entity="{
        preview_file_id: previewFile.id,
        preview_file_extension: previewFile.extension
      }"
      :empty-height="200"
      :empty-width="300"
      :height="200"
      :width="300"
      is-rounded-top-border
      show-movie
    />
    <div class="preview-card-data">
      <div class="flexrow">
        <span class="card-revision tag strong flexrow-item">
          v{{ previewFile.revision }}
        </span>
        <span
          class="card-file-name flexrow-item"
          :title="previewFile.original_name"
        >
          {{ previewFile.original_name }}
        </span>
        <span class="filler"></span>
        <span class="card-extension flexrow-item mr0">
          {{ previewFile.extension }}
        </span>
      </div>
      <div class="flexrow mt1">
        <span
          class="preview-status mr05"
          :title="previewFile.validation_status"
          :data-status="previewFile.validation_status"
        ></span>
        <people-avatar
          class="person"
          :person="personMap.get(previewFile.person_id)"
          :font-size="10"
          :size="20"
        />
        <span class="filler"></span>
        <span
          class="card-file-size flexrow-item mr05"
          v-if="previewFile.file_size"
        >
          {{ renderFileSize(previewFile.file_size) }}B
        </span>
        <a
          class="download-button"
          :href="downloadPath"
          :title="$t('playlists.actions.download_file')"
          v-if="!isCurrentUserArtist"
        >
          <download-icon class="icon is-small" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { DownloadIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useStore } from 'vuex'

import { renderFileSize } from '@/lib/render'

import EntityPreview from '@/components/widgets/EntityPreview.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

const store = useStore()

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  previewFile: { type: Object, required: true }
})

// Computed
// --------------------------------------------------------------------------
const isCurrentUserArtist = computed(() => store.getters.isCurrentUserArtist)
const personMap = computed(() => store.getters.personMap)

const downloadPath = computed(() => {
  const { extension, id } = props.previewFile
  const type = extension === 'mp4' ? 'movies' : 'pictures'
  return `/api/${type}/originals/preview-files/${id}/download`
})
</script>

<style lang="scss" scoped>
.preview-card {
  background: var(--background);
  border-radius: 10px;
  box-shadow: 4px 4px 5px 0 rgba(0, 0, 0, 0.1);
  margin-right: 1rem;
  margin-bottom: 1rem;
  max-width: 300px;
  overflow: hidden;

  .card-revision {
    margin-right: 0.5rem;
  }

  .preview-card-data {
    padding: 0.5rem;
  }

  .card-file-name {
    display: inline-block;
    font-size: 0.9rem;
    overflow: hidden;
    max-width: 240px;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .card-extension {
    background: var(--background-alt);
    border-radius: 4px;
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
    text-transform: uppercase;
  }

  .preview-status {
    background: #aaa;
    border: 2px solid $grey;
    border-radius: 50%;
    height: 20px;
    min-width: 20px;
    width: 20px;

    &[data-status='validated'] {
      background: $light-green;
    }
    &[data-status='rejected'] {
      background: $red;
    }
  }

  .card-file-size {
    color: var(--text-light);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .download-button {
    padding-top: 0.5rem;
    padding-right: 0.1rem;
  }
}
</style>
