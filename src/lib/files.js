const ALL_EXTENSIONS = [
  'png',
  'jpg',
  'mp4',
  'mov',
  'obj',
  'glb',
  'gltf',
  'pdf',
  'ma',
  'mb',
  'zip',
  'rar',
  'jpeg',
  'svg',
  'blend',
  'wmv',
  'm4v',
  'ai',
  'comp',
  'exr',
  'psd',
  'hip',
  'gif',
  'ae',
  'fla',
  'flv',
  'swf',
  'sbbkp',
  'wav',
  'mp3',
  'webm',
  'avi',
  'clip',
  'mkv'
]
const ALL_EXTENSIONS_STRING = ALL_EXTENSIONS.map(e => `.${e}`).join(',')

const IMG_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg']
const IMG_EXTENSIONS_STRING = IMG_EXTENSIONS.map(e => `.${e}`).join(',')

export default {
  ALL_EXTENSIONS,
  ALL_EXTENSIONS_STRING,
  IMG_EXTENSIONS,
  IMG_EXTENSIONS_STRING
}
