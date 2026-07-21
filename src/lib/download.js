/**
 * Trigger a browser download of a Blob without a third-party dependency.
 * Cleans up the object URL and the temporary anchor afterwards.
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
