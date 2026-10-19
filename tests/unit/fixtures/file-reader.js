// FileReaders for the CSV import specs: Node has none, and the one of jsdom
// always reads its blob.

// Reads the blob as text, like a browser.
export class TextFileReader {
  async readAsText(blob) {
    this.result = await blob.text()
    this.onload({ target: this })
  }
}

// Throws while reading: any failure but a read one stands for a bug.
export class BrokenFileReader {
  readAsText() {
    throw new TypeError("Cannot read properties of undefined (reading 'size')")
  }
}

// Fails like Chrome on a file deleted or moved since it was picked.
export class GoneFileReader {
  readAsText() {
    queueMicrotask(() => {
      this.error = new DOMException(
        'A requested file or directory could not be found at the time an operation was processed.',
        'NotFoundError'
      )
      this.onerror()
    })
  }
}
