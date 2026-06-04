/*
 * Annotation `type` normalization for the Fabric.js v6 migration.
 *
 * Kitsu has always stored fabric object types in lowercase ('rect',
 * 'i-text', 'path', …) and its deserializers branch on those exact
 * strings. Fabric v6's toObject() emits the PascalCase `static type`
 * instead ('Rect', 'IText', …), which would break revival of any
 * annotation saved under v6.
 *
 * normalizeType() maps a type — legacy lowercase OR v6 PascalCase — back
 * to the canonical lowercase stored form, so the DB format stays stable
 * and identical to existing data. It is applied on write (force lowercase
 * before storage) and on read (tolerate both forms). Custom types whose
 * serialized string is fixed (PSStroke) or kept lowercase via a static
 * type (arrow, eraser) are unaffected and pass through.
 */

// fabric v6 PascalCase → the lowercase form Kitsu stores and branches on.
// IText must map to 'i-text' explicitly: 'IText'.toLowerCase() is 'itext',
// which matches no branch.
const V6_TO_STORED = {
  Rect: 'rect',
  Circle: 'circle',
  Ellipse: 'ellipse',
  Line: 'line',
  Path: 'path',
  Group: 'group',
  IText: 'i-text',
  Text: 'text',
  Textbox: 'textbox'
}

export const normalizeType = type =>
  typeof type === 'string' ? (V6_TO_STORED[type] ?? type) : type

// Deep-walk a serialized annotation, normalizing the `type` of the object
// and every nested object that carries its own type: group children
// (`objects`), the eraser mask and its paths (`eraser` / `eraser.objects`)
// and a `clipPath`. Mutates in place and returns the object.
export const normalizeSerializedType = obj => {
  if (!obj || typeof obj !== 'object') return obj
  if (typeof obj.type === 'string') obj.type = normalizeType(obj.type)
  if (Array.isArray(obj.objects)) obj.objects.forEach(normalizeSerializedType)
  if (obj.eraser) normalizeSerializedType(obj.eraser)
  if (obj.clipPath) normalizeSerializedType(obj.clipPath)
  return obj
}
