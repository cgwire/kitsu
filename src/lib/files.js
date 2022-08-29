const ALL_EXTENSIONS = [
  'png', 'jpg', 'mp4', 'mov', 'obj', 'glb', 'pdf', 'ma', 'mb', 'zip', 'rar',
  'jpeg', 'svg', 'blend', 'wmv', 'm4v', 'ai', 'comp', 'exr', 'psd', 'hip',
  'gif', 'ae', 'fla', 'flv', 'swf', 'sbbkp', 'wav', 'mp3', 'webm'
]

const ALL_EXTENSIONS_STRING = ALL_EXTENSIONS.map(extension => '.' + extension)
  .join(',')

export default {
  IMG_EXTENSIONS: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
  ALL_EXTENSIONS_STRING,
  ALL_EXTENSIONS
}
