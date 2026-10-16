export function sendTaskPluginPreferences({
  frame,
  pluginId,
  url,
  locale,
  darkTheme,
  hostWindow = window
}) {
  if (
    !frame ||
    !pluginId ||
    !url ||
    frame.dataset.taskPluginId !== pluginId ||
    frame.getAttribute('src') !== url ||
    typeof locale !== 'string' ||
    typeof darkTheme !== 'boolean'
  )
    return false

  let target
  try {
    target = new URL(url, hostWindow.location.href)
  } catch {
    return false
  }
  if (target.origin !== hostWindow.location.origin) return false

  frame.contentWindow?.postMessage(
    {
      type: 'kitsu.task-plugin.preferences',
      version: 1,
      locale,
      darkTheme
    },
    target.origin
  )
  return true
}
