// A Windows path pasted alone goes between backticks: Markdown reads a
// backslash before a punctuation mark as an escape (8_anim\_lib shows as
// 8_anim_lib), while code keeps every backslash.
const WINDOWS_PATH_REGEX = /^"?(?:[a-z]:\\|\\\\[^\\\s"`])[^\r\n"`]*"?$/i
const CODE_FENCE_REGEX = /^ {0,3}(?:```|~~~)/gm

const isInsideCode = textBefore => {
  const fences = textBefore.match(CODE_FENCE_REGEX) || []
  const line = textBefore.slice(textBefore.lastIndexOf('\n') + 1)
  const backticks = line.match(/`/g) || []
  return fences.length % 2 === 1 || backticks.length % 2 === 1
}

// execCommand keeps the paste in the undo history. Chromium merges it with the
// typing before it, so that Ctrl+Z also erases what was typed: setting the
// selection again closes that typing first. Firefox before 89 refuses the
// command in a textarea.
const insertText = (textarea, text) => {
  const { selectionStart, selectionEnd } = textarea
  textarea.setSelectionRange(selectionStart, selectionEnd)
  const isInserted =
    typeof document.execCommand === 'function' &&
    document.execCommand('insertText', false, text)
  if (!isInserted) {
    textarea.setRangeText(text, selectionStart, selectionEnd, 'end')
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

export const wrapPastedPath = event => {
  const { clipboardData, target: textarea } = event
  if (!clipboardData || clipboardData.files.length > 0) return
  const text = clipboardData.getData('text/plain').trim()
  const textBefore = textarea.value.slice(0, textarea.selectionStart)
  if (WINDOWS_PATH_REGEX.test(text) && !isInsideCode(textBefore)) {
    event.preventDefault()
    insertText(textarea, `\`${text}\``)
  }
}
