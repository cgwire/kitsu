import ColorHash from 'color-hash'

export default {
  fromString (str) {
    let colorHash = new ColorHash({lightness: 0.7, saturation: 0.8})
    return colorHash.hex(str)
  }
}
