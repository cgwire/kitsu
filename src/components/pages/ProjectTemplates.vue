<template>
  <div class="project-templates page fixed-page">
    <list-page-header
      :title="$t('project_templates.title')"
      :new-entry-label="$t('project_templates.new_project_template')"
      :is-exportable="true"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <p class="info" v-if="projectTemplates.length > 0">
      <info-icon class="info-icon" />
      {{ $t('project_templates.click_name_to_edit') }}
    </p>

    <project-template-list
      class="project-template-list"
      :entries="projectTemplates"
      :is-loading="loading.list"
      :is-error="errors.list"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
      v-if="loading.list || projectTemplates.length > 0"
    />

    <div
      class="empty-state has-text-centered"
      v-else-if="!loading.list && projectTemplates.length === 0"
    >
      <p class="empty-text">{{ $t('project_templates.empty') }}</p>
      <button-simple
        class="mt1"
        :text="$t('project_templates.new_project_template')"
        icon="plus"
        @click="onNewClicked"
      />
    </div>

    <edit-project-template-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :is-duplicate="errors.duplicate"
      :template-to-edit="templateToEdit"
      @cancel="onCancelEdit"
      @confirm="confirmEditTemplate"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('project_templates.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteTemplate"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useStore } from 'vuex'

import { InfoIcon } from 'lucide-vue-next'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditProjectTemplateModal from '@/components/modals/EditProjectTemplateModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import ProjectTemplateList from '@/components/lists/ProjectTemplateList.vue'

const { t } = useI18n()
const store = useStore()

const templateToEdit = ref(null)
const templateToDelete = ref(null)
const errors = reactive({
  list: false,
  edit: false,
  duplicate: false,
  del: false
})
const loading = reactive({ list: false, edit: false, del: false })
const modals = reactive({ del: false, edit: false })

const projectTemplates = computed(() => store.getters.projectTemplates)

const deleteText = computed(() =>
  templateToDelete.value
    ? t('project_templates.delete_text', {
        name: templateToDelete.value.name
      })
    : ''
)

useHead({ title: computed(() => `${t('project_templates.title')} - Kitsu`) })

const onExportClicked = () => {
  const name = stringHelpers.slugify(t('project_templates.title'))
  const headers = [
    t('project_templates.fields.name'),
    t('productions.fields.type'),
    t('productions.fields.style'),
    t('project_templates.fields.description')
  ]
  const entries = [headers].concat(
    projectTemplates.value.map(template => [
      template.name,
      template.production_type,
      template.production_style,
      template.description
    ])
  )
  csv.buildCsvFile(name, entries)
}

const onNewClicked = () => {
  templateToEdit.value = { name: '', description: '' }
  modals.edit = true
}

const onEditClicked = template => {
  templateToEdit.value = template
  modals.edit = true
}

const onCancelEdit = () => {
  modals.edit = false
  errors.duplicate = false
}

const confirmEditTemplate = async form => {
  loading.edit = true
  errors.edit = false
  errors.duplicate = false
  form.id = templateToEdit.value?.id
  try {
    if (form.id) {
      await store.dispatch('editProjectTemplate', form)
    } else {
      await store.dispatch('newProjectTemplate', form)
    }
    modals.edit = false
  } catch (error) {
    console.error(error)
    const message = error?.body?.message || error?.message || ''
    if (message.toLowerCase().includes('already exists')) {
      errors.duplicate = true
    } else {
      errors.edit = true
    }
  }
  loading.edit = false
}

const onDeleteClicked = template => {
  templateToDelete.value = template
  modals.del = true
}

const confirmDeleteTemplate = async () => {
  loading.del = true
  errors.del = false
  try {
    await store.dispatch('deleteProjectTemplate', templateToDelete.value)
    modals.del = false
  } catch (error) {
    console.error(error)
    errors.del = true
  }
  loading.del = false
}

onMounted(async () => {
  loading.list = true
  errors.list = false
  try {
    await store.dispatch('loadProjectTemplates')
  } catch (error) {
    console.error(error)
    errors.list = true
  }
  loading.list = false
})
</script>

<style lang="scss" scoped>
.project-template-list {
  margin-top: 1em;
}

.info {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-top: 1em;
  color: var(--text-alt);
  font-style: italic;
  font-size: 0.9em;
}

.info-icon {
  width: 16px;
  height: 16px;
}

.empty-state {
  margin-top: 3em;
}

.empty-text {
  color: var(--text-alt);
  font-size: 1.1em;
}

@media screen and (max-width: 768px) {
  .project-templates.page {
    padding: 0.5em 1em;
    padding-top: 50px;
  }

  :deep(.page-header .level-right) {
    display: none;
  }

  .info {
    display: none;
  }
}
</style>
