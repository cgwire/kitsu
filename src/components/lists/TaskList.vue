<template>
<div class="data-list">

  toto

  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
      </thead>
    </table>
  </div>

  <div
    ref="body"
    class="table-body"
    v-scroll="onBodyScroll"
    v-if="!isLoading"
  >
    <table
      class="table splitted-table unselectable"
      v-if="isListVisible"
    >
      <tbody
        class="tbody"
        ref="body-tbody"
      >
      </tbody>
    </table>
  </div>

  <p
    class="has-text-centered nb-assets"
    v-if="!isEmptyList && !isLoading"
  >
0 entities
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  ChevronDownIcon
} from 'vue-feather-icons'
import { entityListMixin } from './base'
import { selectionListMixin } from './selection'

import DescriptionCell from '../cells/DescriptionCell'
import ButtonHrefLink from '../widgets/ButtonHrefLink'
import ButtonLink from '../widgets/ButtonLink'
import ButtonSimple from '../widgets/ButtonSimple'
import EntityThumbnail from '../widgets/EntityThumbnail'
import PageTitle from '../widgets/PageTitle'
import RowActions from '../widgets/RowActions'
import TableHeaderMenu from '../widgets/TableHeaderMenu'
import TableInfo from '../widgets/TableInfo'
import TableMetadataHeaderMenu from '../widgets/TableMetadataHeaderMenu'
import ValidationCell from '../cells/ValidationCell'

export default {
  name: 'asset-list',
  mixins: [entityListMixin, selectionListMixin],

  props: {
    displayedAssets: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: true
    },
    isError: {
      type: Boolean,
      default: true
    },
    validationColumns: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      lastSelection: null,
      hiddenColumns: {},
      lastHeaderMenuDisplayed: null
    }
  },

  components: {
    ButtonLink,
    ButtonSimple,
    ButtonHrefLink,
    DescriptionCell,
    EntityThumbnail,
    ChevronDownIcon,
    PageTitle,
    RowActions,
    TableInfo,
    TableHeaderMenu,
    TableMetadataHeaderMenu,
    ValidationCell
  },

  computed: {
    ...mapGetters([
      'assets',
      'assetFilledColumns',
      'assetMetadataDescriptors',
      'assetSearchText',
      'assetSelectionGrid',
      'episodeMap',
      'currentEpisode',
      'currentProduction',
      'displayedAssetsLength',
      'nbSelectedTasks',
      'isCurrentUserAdmin',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isShowInfos',
      'isTVShow',
      'selectedTasks',
      'taskMap',
      'taskTypeMap'
    ]),

    createTasksPath () {
      return this.getPath('create-asset-tasks')
    },

    isEmptyList () {
      return this.displayedAssetsLength === 0 &&
             !this.isLoading &&
             !this.isError &&
             (!this.assetSearchText || this.assetSearchText.length === 0)
    },

    isEmptyTask () {
      return !this.isEmptyList &&
      !this.isLoading &&
      this.validationColumns &&
      this.validationColumns.length === 0
    },

    isListVisible () {
      return (
        !this.isLoading &&
        !this.isError &&
        (
          this.displayedAssetsLength > 0
        )
      )
    }
  },

  methods: {
    ...mapActions([
      'displayMoreAssets'
    ]),

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
      this.$emit('scroll', position.scrollTop)

      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.loadMoreAssets()
      }
    },

    loadMoreAssets () {
      this.displayMoreAssets()
      this.$nextTick(this.resizeHeaders)
    },

    getIndex (i, k) {
      let j = 0
      let index = 0
      while (j < k) {
        index += this.displayedAssets[j].length
        j++
      }
      return i + index
    },

    newAssetPath () {
      return this.getPath('new-asset')
    },

    assetPath (assetId) {
      return this.getPath('asset', assetId)
    },

    editPath (assetId) {
      return this.getPath('edit-asset', assetId)
    },

    deletePath (assetId) {
      return this.getPath('delete-asset', assetId)
    },

    restorePath (assetId) {
      return this.getPath('restore-asset', assetId)
    },

    taskTypePath (taskTypeId) {
      let route = {
        name: 'task-type',
        params: {
          production_id: this.currentProduction.id,
          task_type_id: taskTypeId,
          type: 'assets'
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-task-type`
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    },

    getPath (section, assetId) {
      let route = {
        name: section,
        params: {
          production_id: this.currentProduction.id
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-${section}`
        route.params.episode_id = this.currentEpisode.id
      }

      if (assetId) {
        route.params.asset_id = assetId
      }

      return route
    },

    resizeHeaders () {
      if (
        this.$refs['body-tbody'] &&
        this.$refs['body-tbody'][0] &&
        this.$refs['body-tbody'][0].children.length > 0
      ) {
        if (this.$refs['th-episode']) {
          const episodeWidth =
            this.$refs['body-tbody'][0].children[1].children[0].offsetWidth
          this.$refs['th-episode'].style['min-width'] = `${episodeWidth}px`
          const nameWidth =
            this.$refs['body-tbody'][0].children[1].children[2].offsetWidth
          this.$refs['th-name'].style['min-width'] = `${nameWidth}px`
        } else {
          const thumbnailWidth =
            this.$refs['body-tbody'][0].children[1].children[0].offsetWidth
          this.$refs['th-thumbnail'].style['min-width'] = `${thumbnailWidth}px`
          const nameWidth =
            this.$refs['body-tbody'][0].children[1].children[1].offsetWidth
          this.$refs['th-name'].style['min-width'] = `${nameWidth}px`
          const descriptionWidth =
            this.$refs['body-tbody'][0].children[1].children[2].offsetWidth
          this.$refs['th-description'].style['min-width'] =
            `${descriptionWidth}px`
        }
      }
    }
  },

  watch: {
    validationColumns () {
      this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
    }
  }
}
</script>

<style scoped>
.dark thead tr a {
  color: #CCC;
}

.table {
  min-width: 1000px;
}

.actions {
  min-width: 150px;
  padding: 0.4em;
}

.name {
  min-width: 200px;
  width: 200px;
}

.episode {
  min-width: 50px;
  width: 50px;
}

.bold {
  font-weight: bold;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.metadata-descriptor {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
}

.validation-cell {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  margin-right: 1em;
}

.hidden-validation-cell {
  min-width: 30px;
  max-width: 30px;
  width: 30px;
  padding: 4px;
}

td.name {
  font-size: 1.2em;
}

.thumbnail {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
  padding: 0;
}

.thumbnail img {
  margin-top: 5px;
}

.asset-link {
  color: inherit
}

thead tr {
  border-right: 1px solid transparent;
  border-left: 1px solid transparent;
}

thead tr a {
  color: #7A7A7A;
}

.table-body {
  padding-top: 1em;
  position: relative;
  z-index: 1;
}

tbody:first-child tr:first-child {
}

tbody:last-child .empty-line:last-child {
  border: 0;
}

.table-body .table .empty-line {
  background: inherit;
}

.empty-line {
  border-right: 0;
  border-left: 0;
  height: 1em;
  color: red;
}

.table-header-wrapper {
  position: relative;
}

.splitted-table tbody {
  border: 0;
}

.table th {
  vertical-align: middle;
}

.header-icon {
  min-width: 15px;
}

th {
  word-break: break-all
}
</style>
