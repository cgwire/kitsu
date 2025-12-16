<template>
  <div class="mt1">
    <p class="flexrow">
      <em class="flexrow-item">{{ $t('logs.preview_files.explanation') }}</em>
      <span class="filler"></span>
      <button-simple
        class="flexrow-item"
        icon="refresh"
        :is-loading="loading.previewFiles"
        :title="$t('main.reload')"
        @click="reload"
      />
    </p>
    <div class="has-text-centered" v-if="loading.previewFiles">
      <spinner />
    </div>
    <p class="empty" v-else-if="!previewFiles.length">
      {{ $t('logs.preview_files.empty_list') }}
    </p>
    <template v-else>
      <preview-file-list
        :preview-files="previewFiles"
        :is-loading="loading.previewFiles"
        @mark-broken-clicked="markBrokenClicked"
      />
      <div class="has-text-centered mt1" v-if="hasMorePreviewFiles">
        <button-simple
          :is-loading="loading.morePreviewFiles"
          :text="$t('main.load_more')"
          @click="loadMorePreviewFiles"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import PreviewFileList from '@/components/lists/PreviewFileList.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const PAGE_SIZE = 100

export default {
  name: 'preview-files',

  components: {
    ButtonSimple,
    PreviewFileList,
    Spinner
  },

  data() {
    return {
      hasMorePreviewFiles: false,
      previewFiles: [],
      loading: {
        previewFiles: false,
        morePreviewFiles: false
      }
    }
  },

  mounted() {
    this.reload()
  },

  methods: {
    ...mapActions(['getRunningPreviewFiles', 'markPreviewFileAsBroken']),

    async reload() {
      this.previewFiles = []
      this.loading.previewFiles = true
      try {
        const previewFiles = await this.getRunningPreviewFiles({
          limit: PAGE_SIZE
        })
        this.previewFiles = previewFiles
        this.hasMorePreviewFiles = previewFiles.length >= PAGE_SIZE
      } catch (err) {
        console.error(err)
      } finally {
        this.loading.previewFiles = false
      }
    },

    async loadMorePreviewFiles() {
      if (!this.previewFiles.length) return

      this.loading.morePreviewFiles = true
      const lastPreviewFileId =
        this.previewFiles[this.previewFiles.length - 1].id
      try {
        const previewFiles = await this.getRunningPreviewFiles({
          limit: PAGE_SIZE,
          lastPreviewFileId
        })
        this.previewFiles = [...this.previewFiles, ...previewFiles]
        this.hasMorePreviewFiles = previewFiles.length >= PAGE_SIZE
      } catch (err) {
        console.error(err)
      } finally {
        this.loading.morePreviewFiles = false
      }
    },

    async markBrokenClicked(previewFileId) {
      const previewFile = this.previewFiles.find(p => p.id === previewFileId)
      previewFile.status = 'broken'
      await this.markPreviewFileAsBroken(previewFileId)
    }
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
  color: $white;
  background: $dark-red;
}

.status[data-status='processing'] {
  color: $white;
  background: $blue;
}

.empty {
  color: var(--text);
  font-size: 1.2em;
  font-weight: 500;
  text-align: center;
  margin-top: 1em;
}
</style>
