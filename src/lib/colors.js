import ColorHash from 'color-hash'
import Color from '@/lib/color2'
// import localStorage from 'localStorage'

const darkenColorIndex = {}
const lightenColorIndex = {}
const fadeColorIndex = {}

let colorHashConstructor = ColorHash
if (ColorHash.default) colorHashConstructor = ColorHash.default

export default {

  /*
   * Turn hexadecimal color (#FFFFFF) to a darker and more saturated version.
   * Uses a cache for to not recompute the target color each time this function
   * is called.
   */
  darkenColor (colorHash) {
    if (!darkenColorIndex[colorHash]) {
      darkenColorIndex[colorHash] = Color(colorHash).darken(0.3).saturate(0.6)
    }
    return darkenColorIndex[colorHash]
  },

  /*
   * Convert a string (it can be anything) into a HTML color hash.
   */
  fromString (str, darken = false) {
    let colorHash = new colorHashConstructor({
      lightness: 0.7, saturation: 0.8
    })
    if (
      darken ||
      (localStorage && localStorage.getItem('dark-theme') === 'true')
    ) {
      colorHash = new colorHashConstructor({
        lightness: 0.6, saturation: 0.8
      })
    }
    return colorHash.hex(str)
  },

  /*
   * Turn hexadecimal color (#FFFFFF) to a RGBa one (rgba(255, 255, 255, 0.3))
   */
  hexToRGBa (hex, alpha) {
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
  lightenColor (colorHash, level = 0.3) {
    if (!lightenColorIndex[colorHash + level]) {
      lightenColorIndex[colorHash + level] = Color(colorHash).lighten(level)
    }
    return lightenColorIndex[colorHash + level]
  },

  /*
   * Turn hexadecimal color (#FFFFFF) to a less saturated version.
   * Uses a cache for to not recompute the target color each time this function
   * is called.
   */
  fadeColor (colorHash, level = 0.3) {
    if (!fadeColorIndex[colorHash + level]) {
      fadeColorIndex[colorHash + level] = Color(colorHash).fade(level)
    }
    return fadeColorIndex[colorHash + level]
  },

  /*
   * Quick and dirty function to change the text color in case the status color
   * is too dark.
   */
  validationTextColor (task) {
    if (task &&
        task.task_status_short_name !== 'todo' &&
        task.task_status_short_name !== 'wtg') {
      return 'white'
    } else {
      return '#333'
    }
  }
}
