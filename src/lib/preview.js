/*
 * Preview-extension type checks. Shared across the player components
 * (PreviewPlayer, PlaylistPlayer, PictureViewer, PreviewViewer, etc.)
 * so the canonical list of accepted extensions for each preview kind
 * lives in a single place.
 *
 * Each helper takes a bare extension string (e.g. 'mp4', 'png') and
 * returns a boolean — no entity / preview-file unwrapping. Callers
 * derive the extension from their own state.
 */

export const isMoviePreview = extension => extension === 'mp4'

export const isPicturePreview = extension =>
  ['gif', 'jpeg', 'jpg', 'png'].includes(extension)

export const isModelPreview = extension => ['glb', 'gltf'].includes(extension)

export const isSoundPreview = extension => ['mp3', 'wav'].includes(extension)

export const isPdfPreview = extension => extension === 'pdf'

export const isMarkdownPreview = extension => extension === 'md'

export const isDiffPreview = extension => extension === 'diff'

export const isFilePreview = extension =>
  !isMoviePreview(extension) &&
  !isPicturePreview(extension) &&
  !isModelPreview(extension) &&
  !isSoundPreview(extension) &&
  !isPdfPreview(extension) &&
  !isMarkdownPreview(extension) &&
  !isDiffPreview(extension)

// Build the .png filename for an exported annotation snapshot from a
// task context. Sanitises each part so it's safe across filesystems,
// lowercases the result and joins parts with underscores:
//   `productionname_fullentityname_tasktypename_v{revision}_annotation[_{frame|index}].png`
// Pass `frame` for video snapshots and `index` for picture batches
// that need disambiguation.
export const buildAnnotationSnapshotFilename = ({
  production,
  entity,
  taskType,
  revision,
  frame,
  index
}) => {
  const sanitize = part =>
    String(part || '')
      .replace(/[\s/\\:?<>|"*]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  const suffix = frame != null ? Math.round(frame) : index
  const parts = [
    sanitize(production),
    sanitize(entity),
    sanitize(taskType),
    revision != null && revision !== '' ? `v${revision}` : '',
    'annotation',
    suffix != null ? String(suffix) : ''
  ].filter(Boolean)
  return `${parts.join('_')}.png`.toLowerCase()
}

// Human-readable label burned into the PNG so it identifies its
// source when viewed in isolation. Parts are kept verbatim and joined
// with slashes for a compact "breadcrumb" look.
export const buildAnnotationSnapshotTitle = ({
  production,
  entity,
  taskType,
  revision,
  frame,
  index
}) => {
  const suffix =
    frame != null ? `#${Math.round(frame)}` : index != null ? `#${index}` : null
  const parts = [
    production,
    entity,
    taskType,
    revision != null && revision !== '' ? `v${revision}` : null,
    suffix
  ].filter(part => part != null && String(part).length > 0)
  return parts.join(' / ')
}

// Burn a one-line title strip into the bottom of a 2D canvas so the
// resulting PNG still identifies its source when viewed in isolation.
// Full-width semi-opaque black band with the text in white, sized
// relative to the canvas so it stays readable at any resolution.
export const drawSnapshotTitle = (canvas, text) => {
  if (!text) return
  const context = canvas.getContext('2d')
  const fontSize = Math.max(14, Math.round(canvas.height * 0.025))
  const padding = Math.round(fontSize * 0.6)
  const stripHeight = fontSize + padding * 2
  context.save()
  context.fillStyle = 'rgba(0, 0, 0, 0.6)'
  context.fillRect(0, canvas.height - stripHeight, canvas.width, stripHeight)
  context.fillStyle = '#ffffff'
  context.textBaseline = 'middle'
  context.font = `${fontSize}px sans-serif`
  context.fillText(text, padding, canvas.height - stripHeight / 2)
  context.restore()
}
