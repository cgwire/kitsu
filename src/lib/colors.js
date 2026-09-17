import ColorHash from 'color-hash'
import Color from 'color'
// import localStorage from 'localStorage'

// Capped and cleared, same pattern as _durationCache in lib/time.js: these
// caches keyed by every color a studio might ever use and were never
// bounded, so a studio with lots of distinct task/status colors would grow
// them forever.
const darkenColorIndex = new Map()
const lightenColorIndex = new Map()
const fadeColorIndex = new Map()

let colorHashConstructor = ColorHash
if (ColorHash.default) colorHashConstructor = ColorHash.default

export default {
  /*
   * Turn hexadecimal color (#FFFFFF) to a darker and more saturated version.
   * Uses a cache for to not recompute the target color each time this function
   * is called.
   */
  darkenColor(colorHash) {
    const cached = darkenColorIndex.get(colorHash)
    if (cached !== undefined) return cached
    const result = Color(colorHash).darken(0.3).saturate(0.6)
    if (darkenColorIndex.size > 10000) darkenColorIndex.clear()
    darkenColorIndex.set(colorHash, result)
    return result
  },

  /*
   * Convert a string (it can be anything) into a HTML color hash.
   */
  fromString(str, darken = false) {
    const isDark =
      darken || (localStorage && localStorage.getItem('dark-theme') === 'true')
    const colorHash = new colorHashConstructor({
      lightness: isDark ? 0.6 : 0.7,
      saturation: 0.8
    })
    return colorHash.hex(str)
  },

  /*
   * Turn hexadecimal color (#FFFFFF) to a RGBa one (rgba(255, 255, 255, 0.3))
   */
  hexToRGBa(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    if (alpha) {
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')'
    } else {
      return 'rgb(' + r + ', ' + g + ', ' + b + ')'
    }
  },

  /*
   * Turn hexadecimal color (#FFFFFF) to a lighter version.
   * Uses a cache for to not recompute the target color each time this function
   * is called.
   */
  lightenColor(colorHash, level = 0.3) {
    const cacheKey = colorHash + level
    const cached = lightenColorIndex.get(cacheKey)
    if (cached !== undefined) return cached
    const result = Color(colorHash).lighten(level)
    if (lightenColorIndex.size > 10000) lightenColorIndex.clear()
    lightenColorIndex.set(cacheKey, result)
    return result
  },

  /*
   * Turn hexadecimal color (#FFFFFF) to a less saturated version.
   * Uses a cache for to not recompute the target color each time this function
   * is called.
   */
  fadeColor(colorHash, level = 0.3) {
    const cacheKey = colorHash + level
    const cached = fadeColorIndex.get(cacheKey)
    if (cached !== undefined) return cached
    const result = Color(colorHash).fade(level)
    if (fadeColorIndex.size > 10000) fadeColorIndex.clear()
    fadeColorIndex.set(cacheKey, result)
    return result
  }
}
