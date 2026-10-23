export const buildTaskPluginUrl = (plugin, task, options = {}) => {
  if (
    !plugin?.plugin_id ||
    !task?.id ||
    !task?.project_id ||
    !task?.entity_id ||
    !task?.task_type_id
  ) {
    return ''
  }

  const params = new URLSearchParams({
    production_id: task.project_id,
    task_id: task.id,
    entity_id: task.entity_id,
    entity_type: task.entity_type_name || options.entityType || '',
    task_type_id: task.task_type_id
  })
  if (!params.get('entity_type')) return ''
  if (options.darkTheme) params.set('dark_theme', 'true')
  if (options.locale) params.set('locale', options.locale.substring(0, 2))

  return `/api/plugins/${encodeURIComponent(plugin.plugin_id)}/frontend/?${params}`
}
