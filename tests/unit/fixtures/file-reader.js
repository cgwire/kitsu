// FileReaders for the CSV import specs: Node has none, and the one of jsdom
// always reads its blob. Also a file gone since it was picked.

// Reads the blob as text in the given encoding. A browser follows a byte
// order mark first.
export class TextFileReader {
  async readAsText(blob, encoding = 'UTF-8') {
    this.result = new TextDecoder(encoding).decode(await blob.arrayBuffer())
    this.onload({ target: this })
  }
}

// Throws while reading: any failure but a read one stands for a bug.
export class BrokenFileReader {
  readAsText() {
    throw new TypeError("Cannot read properties of undefined (reading 'size')")
  }
}

// The error of Chrome on a file deleted or moved since it was picked.
const notFoundError = () =>
  new DOMException(
    'A requested file or directory could not be found at the time an operation was processed.',
    'NotFoundError'
  )

// Fails like Chrome on a file deleted or moved since it was picked.
export class GoneFileReader {
  readAsText() {
    queueMicrotask(() => {
      this.error = notFoundError()
      this.onerror()
    })
  }
}

// A file deleted or moved since it was picked: Chrome fails the read of its
// bytes too, with `readError`.
export const goneFile = name => {
  const file = new File([], name)
  file.readError = notFoundError()
  file.arrayBuffer = () => Promise.reject(file.readError)
  return file
}
