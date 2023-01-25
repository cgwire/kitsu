export const coerceToArrayBuffer = (input) => {
  if (typeof input === 'string') {
    // base64url to base64
    input = input.replace(/-/g, '+').replace(/_/g, '/')

    // base64 to Uint8Array
    var str = window.atob(input)
    var bytes = new Uint8Array(str.length)
    for (var i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i)
    }
    input = bytes
  }

  // Array to Uint8Array
  if (Array.isArray(input)) {
    input = new Uint8Array(input)
  }

  // Uint8Array to ArrayBuffer
  if (input instanceof Uint8Array) {
    input = input.buffer
  }

  // error if none of the above worked
  if (!(input instanceof ArrayBuffer)) {
    throw new TypeError("could not coerce '" + name + "' to ArrayBuffer")
  }

  return input
}

export const coerceToBase64Url = (input) => {
  // Array or ArrayBuffer to Uint8Array
  if (Array.isArray(input)) {
    input = Uint8Array.from(input)
  }

  if (input instanceof ArrayBuffer) {
    input = new Uint8Array(input)
  }

  // Uint8Array to base64
  if (input instanceof Uint8Array) {
    var str = ''
    var len = input.byteLength

    for (var i = 0; i < len; i++) {
      str += String.fromCharCode(input[i])
    }
    input = window.btoa(str)
  }

  if (typeof input !== 'string') {
    throw new Error('could not coerce to string')
  }

  // base64 to base64url
  // NOTE: "=" at the end of challenge is optional, strip it off here
  input = input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=*$/g, '')

  return input
}

export const coercePublicKeyFromJSON = (publicKey) => {
  publicKey.challenge = coerceToArrayBuffer(publicKey.challenge)

  if ('user' in publicKey) {
    publicKey.user.id = coerceToArrayBuffer(publicKey.user.id)
  }

  if ('excludeCredentials' in publicKey) {
    publicKey.excludeCredentials = publicKey.excludeCredentials.map((c) => {
      c.id = coerceToArrayBuffer(c.id)
      return c
    })
  }

  if ('allowCredentials' in publicKey) {
    publicKey.allowCredentials = publicKey.allowCredentials.map((c) => {
      c.id = coerceToArrayBuffer(c.id)
      return c
    })
  }

  if ('authenticatorSelection' in publicKey) {
    if (publicKey.authenticatorSelection.authenticatorAttachment === null) publicKey.authenticatorSelection.authenticatorAttachment = undefined
  }

  return publicKey
}

export const coerceCredentialInfoToJSON = (publicKeyCredential) => {
  const publicKeyCredentialJSON = {}
  publicKeyCredentialJSON.rawId = coerceToBase64Url(publicKeyCredential.rawId)
  publicKeyCredentialJSON.id = publicKeyCredential.id
  publicKeyCredentialJSON.type = publicKeyCredential.type
  publicKeyCredentialJSON.authenticatorAttachment =
    publicKeyCredential.authenticatorAttachment

  publicKeyCredentialJSON.response = {}

  publicKeyCredentialJSON.response.clientDataJSON = coerceToBase64Url(
    publicKeyCredential.response.clientDataJSON)

  if ('attestationObject' in publicKeyCredential.response) {
    publicKeyCredentialJSON.response.attestationObject = coerceToBase64Url(
      publicKeyCredential.response.attestationObject)
  }

  if ('authenticatorData' in publicKeyCredential.response) {
    publicKeyCredentialJSON.response.authenticatorData = coerceToBase64Url(
      publicKeyCredential.response.authenticatorData)
  }

  if ('signature' in publicKeyCredential.response) {
    publicKeyCredentialJSON.response.signature = coerceToBase64Url(
      publicKeyCredential.response.signature)
  }

  if ('userHandle' in publicKeyCredential.response) {
    publicKeyCredentialJSON.response.userHandle =
      publicKeyCredential.response.userHandle
  }

  return publicKeyCredentialJSON
}

export const coerceTwoFactorPayload = (twoFactorPayload) => {
  if ('fido_authentication_response' in twoFactorPayload) {
    twoFactorPayload.fido_authentication_response =
      coerceCredentialInfoToJSON(twoFactorPayload.fido_authentication_response)
  }
  return twoFactorPayload
}
