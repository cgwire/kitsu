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

export const isFilePreview = extension =>
  !isMoviePreview(extension) &&
  !isPicturePreview(extension) &&
  !isModelPreview(extension) &&
  !isSoundPreview(extension) &&
  !isPdfPreview(extension)
