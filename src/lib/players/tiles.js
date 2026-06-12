/*
 * Tile-sprite geometry helpers for the progress-bar hover thumbnails.
 *
 * Zou builds one PNG sprite per movie preview: 8 columns of 100px-high
 * cells, cell width = ceil(100 × display aspect ratio of the normalized
 * movie), at most 480 rows (longer movies are subsampled by ffmpeg's
 * select filter, keeping one frame in ceil(nbFrames / 3840)).
 *
 * Recomputing the cell width client-side from the preview's stored
 * dimensions drifts whenever the stored dimensions disagree with the
 * file the sprite was actually built from (source ratio ≠ production
 * ratio, renormalisations after a resolution change, DAR metadata).
 * Measuring the sprite itself gives the exact geometry by construction.
 */

export const TILE_COLUMNS = 8
export const TILE_CELL_HEIGHT = 100

const tileGeometryCache = new Map()

/**
 * Resolve the real geometry of a tile sprite. Resolves null when the
 * image cannot be loaded (broken preview, no tile yet). Results are
 * memoized per URL; failures are evicted so a later retry can succeed.
 */
export const getTileGeometry = url => {
  if (tileGeometryCache.has(url)) return tileGeometryCache.get(url)
  const promise = new Promise(resolve => {
    const image = new Image()
    image.onload = () => {
      const rows = Math.max(
        Math.round(image.naturalHeight / TILE_CELL_HEIGHT),
        1
      )
      resolve({
        cellWidth: image.naturalWidth / TILE_COLUMNS,
        rows,
        cellCount: rows * TILE_COLUMNS
      })
    }
    image.onerror = () => {
      tileGeometryCache.delete(url)
      resolve(null)
    }
    image.src = url
  })
  tileGeometryCache.set(url, promise)
  return promise
}

/**
 * Map a (0-based) frame to its cell index, mirroring ffmpeg's
 * select='not(mod(n,k))' subsampling: the kept frame for n is
 * floor(n / k), clamped to the sprite.
 */
export const getTileCellIndex = (frame, nbFrames, cellCount) => {
  let index = frame
  if (nbFrames > cellCount) {
    index = Math.floor(frame / Math.ceil(nbFrames / cellCount))
  }
  return Math.min(Math.max(index, 0), cellCount - 1)
}
