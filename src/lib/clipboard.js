// Utility suite for copy pasting annotations or text.

let annotationClipboard = []

export default {
  copyAnnotations (annotations) {
    annotationClipboard = annotations
  },

  pasteAnnotations () {
    return annotationClipboard
  }
}
