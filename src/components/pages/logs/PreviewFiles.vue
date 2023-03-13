<template>
  <div class="mt1">
    <p class="flexrow">
      <em class="flexrow-item">{{ $t('logs.preview_files.explaination') }}</em>
      <span class="filler"></span>
      <button-simple class="flexrow-item" icon="refresh" @click="reload" />
    </p>
    <template v-if="previewFiles.length === 0 && !previewFilesLoading">
      {{ $t('logs.preview_files.empty_list') }}
    </template>
    <template v-else>
      <preview-file-list
        :preview-files="previewFiles"
        :is-loading="previewFilesLoading"
        @mark-broken-clicked="markBrokenClicked"
      />
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import { timeMixin } from '@/components/mixins/time'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import PreviewFileList from '@/components/lists/PreviewFileList'

export default {
  name: 'PreviewFiles',
  mixins: [timeMixin],

  components: {
    ButtonSimple,
    PreviewFileList
  },

  data() {
    return {
      previewFilesLoading: true,
      previewFiles: []
    }
  },

  computed: {
    ...mapGetters(['personMap', 'taskTypeMap', 'user']),

    displayedPreviewFiles() {
      return this.previewFiles.filter(
        previewFile => previewFile.status !== 'ready'
      )
    }
  },

  methods: {
    ...mapActions(['getRunningPreviewFiles', 'markPreviewFileAsBroken']),

    async reload() {
      this.previewFiles = []
      this.previewFilesLoading = true
      this.previewFiles = await this.getRunningPreviewFiles()
      this.previewFilesLoading = false
    },

    async markBrokenClicked(previewFileId) {
      const previewFile = this.previewFiles.find(p => p.id === previewFileId)
      previewFile.status = 'broken'
      await this.markPreviewFileAsBroken(previewFileId)
    }
  },

  mounted() {
    this.reload()
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .tag {
    color: $white;
    background: $dark-grey;
  }
}
.tag {
  border-radius: 4px;
}

em {
  color: var(--text);
}

.date {
  font-weight: 500;
}

.status {
  text-transform: uppercase;
  min-width: 50px;
}

.status[data-status='broken'] {
  color: white;
  background: $dark-red;
}

.status[data-status='processing'] {
  color: white;
  background: $blue;
}
</style>
