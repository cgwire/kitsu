<template> <div class="data-list">
  <div style="overflow: hidden">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="production">
            {{ $t('tasks.fields.production') }}
          </th>
          <th class="thumbnail">
          </th>
          <th class="name">
            {{ $t('tasks.fields.entity') }}
          </th>
          <th class="type">
            {{ $t('tasks.fields.task_type') }}
          </th>
          <th class="status">
            {{ $t('tasks.fields.task_status') }}
          </th>
          <th class="last-comment">
            {{ $t('tasks.fields.last_comment') }}
          </th>
          <th class="actions">
          </th>
        </tr>
      </thead>
    </table>
  </div>

  <div class="table-body" v-scroll="onBodyScroll" v-if="entries.length > 0">
    <table class="table">
      <tbody>
        <tr v-for="entry in entries">
          <production-name-cell
            class="production"
            :entry="{
              name: entry.project_name,
              id: entry.production_id
            }"
            :only-avatar="true"
          >
          </production-name-cell>
          <td class="thumbnail">
            <img
              class="thumbnail-picture"
              :src="'/api/pictures/thumbnails/preview-files/' + entry.entity_preview_file_id + '.png'"
              v-if="entry.entity_preview_file_id.length > 0"
            />
            <span class="thumbnail-picture thumbnail-empty" v-else>
            </span>
          </td>
          <td class="name">
            {{ entry.full_entity_name }}
          </td>
          <task-type-name
            class="type"
            :entry="{
              name: entry.task_type_name,
              color: entry.task_type_color
            }"
          >
          </task-type-name>
          <td class="status">
            <validation-tag
              :task="entry"
            >
            </validation-tag>
          </td>
          <last-comment-cell
            class="last-comment"
            :task="entry"
          >
          </last-comment-cell>
          <td class="actions"></td>
       </tr>
      </tbody>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  >
  </table-info>

  <p class="has-text-centered footer-info" v-if="!isLoading">
    {{ entries.length }} {{ $tc('tasks.tasks', entries.length) }}
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import ProductionNameCell from '../cells/ProductionNameCell'
import LastCommentCell from '../cells/LastCommentCell'
import TaskTypeName from '../cells/TaskTypeName'
import TableInfo from '../widgets/TableInfo'
import ValidationTag from '../widgets/ValidationTag'

export default {
  name: 'todos-list',
  components: {
    LastCommentCell,
    ProductionNameCell,
    TableInfo,
    TaskTypeName,
    ValidationTag
  },
  props: [
    'entries',
    'isLoading',
    'isError'
  ],
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    }
  }
}
</script>

<style scoped>
.name {
  width: 230px;
  min-width: 230px;
}

.production {
  width: 70px;
  min-width: 70px;
}

.type {
  width: 150px;
  min-width: 150px;
}

.status {
  width: 100px;
  min-width: 100px;
}

.last-comment {
  width: 500px;
  min-width: 500px;
}

.thumbnail-picture {
}

.thumbnail {
  min-width: 60px;
  max-width: 60px;
  width: 60px;
  padding: 0 0 0 0;
}

.thumbnail img {
  margin-top: 5px;
}

span.thumbnail-empty {
  display: block;
  width: 60px;
  height: 40px;
  background: #F3F3F3;
}
</style>
