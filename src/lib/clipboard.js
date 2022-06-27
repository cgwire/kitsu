// Utility suite for copy pasting annotations or text.

let annotationClipboard = []
let castingClipboard = []

export default {
  copyAnnotations (annotations) {
    annotationClipboard = annotations
  },

  pasteAnnotations () {
    return annotationClipboard
  },

  copyCasting (casting) {
    castingClipboard = casting
  },

  pasteCasting () {
    return castingClipboard
  }
}
