// Utility suite for copy pasting annotations or text.

let annotationClipboard = []
let castingClipboard = []

const copyLinks = links => (links || []).map(link => ({ ...link }))

export default {
  copyAnnotations(annotations) {
    annotationClipboard = annotations
  },

  pasteAnnotations() {
    return annotationClipboard
  },

  // Copies on the way in and on the way out: the store edits the casting of
  // a line in place, so a shared array would change with the line it came
  // from, or with any line it was pasted on.
  copyCasting(casting) {
    castingClipboard = copyLinks(casting)
  },

  pasteCasting() {
    return copyLinks(castingClipboard)
  }
}
