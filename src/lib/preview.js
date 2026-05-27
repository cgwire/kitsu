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
