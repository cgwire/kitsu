import { config } from "@vue/test-utils"
import moment from 'moment'

moment.locale('en')
config.mocks = {
  $t: tKey => tKey // just return translation key
}
config.global.mocks = {
  $t: tKey => tKey // just return translation key
}

// Stub indexedDB for libraries (e.g. vue3-emoji-picker) that rely on it at import time
const noop = () => {}
class IDBRequestStub {
  addEventListener = noop
  removeEventListener = noop
  result = null
  error = null
  onsuccess = null
  onerror = null
  onupgradeneeded = null
  onblocked = null
}
if (typeof indexedDB === 'undefined') {
  globalThis.indexedDB = {
    open: () => new IDBRequestStub(),
    deleteDatabase: () => new IDBRequestStub(),
    databases: () => Promise.resolve([])
  }
  globalThis.IDBRequest = IDBRequestStub
  globalThis.IDBDatabase = class IDBDatabaseStub {}
  globalThis.IDBTransaction = class IDBTransactionStub {}
  globalThis.IDBObjectStore = class IDBObjectStoreStub {}
}
