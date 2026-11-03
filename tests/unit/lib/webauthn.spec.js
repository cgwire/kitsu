// @vitest-environment node

import {
  coerceCredentialInfoToJSON,
  coercePublicKeyFromJSON,
  coerceToArrayBuffer,
  coerceToBase64Url,
  coerceTwoFactorPayload
} from '@/lib/webauthn'

const bytesOf = buffer => Array.from(new Uint8Array(buffer))
const bufferOf = bytes => new Uint8Array(bytes).buffer

describe('lib/webauthn', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { atob, btoa })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('coerceToArrayBuffer', () => {
    test('decodes a base64url string', () => {
      expect(bytesOf(coerceToArrayBuffer('AQID_w'))).toEqual([1, 2, 3, 255])
    })

    test('takes arrays, byte arrays, and buffers', () => {
      const buffer = bufferOf([4])
      expect(bytesOf(coerceToArrayBuffer([1, 2]))).toEqual([1, 2])
      expect(bytesOf(coerceToArrayBuffer(new Uint8Array([3])))).toEqual([3])
      expect(coerceToArrayBuffer(buffer)).toBe(buffer)
    })

    test('rejects a value it cannot turn into bytes', () => {
      expect(() => coerceToArrayBuffer({ id: 'key-1' })).toThrow(
        new TypeError('could not coerce to ArrayBuffer')
      )
    })
  })

  describe('coerceToBase64Url', () => {
    test('encodes bytes as base64url, without padding', () => {
      expect(coerceToBase64Url(bufferOf([1, 2, 3, 255]))).toEqual('AQID_w')
      expect(coerceToBase64Url([251, 255])).toEqual('-_8')
      expect(coerceToBase64Url('ab+/cd==')).toEqual('ab-_cd')
    })

    test('rejects a value it cannot encode', () => {
      expect(() => coerceToBase64Url(42)).toThrow('could not coerce to string')
    })
  })

  describe('coercePublicKeyFromJSON', () => {
    test('turns the ids of a key creation request into bytes', () => {
      const publicKey = coercePublicKeyFromJSON({
        challenge: 'AQID',
        user: { id: 'BAU', name: 'jane' },
        excludeCredentials: [{ id: 'Bg', type: 'public-key' }],
        authenticatorSelection: { authenticatorAttachment: null }
      })

      expect(bytesOf(publicKey.challenge)).toEqual([1, 2, 3])
      expect(bytesOf(publicKey.user.id)).toEqual([4, 5])
      expect(publicKey.user.name).toEqual('jane')
      expect(bytesOf(publicKey.excludeCredentials[0].id)).toEqual([6])
      expect(
        publicKey.authenticatorSelection.authenticatorAttachment
      ).toBeUndefined()
    })

    test('turns the allowed keys of a login request into bytes', () => {
      const publicKey = coercePublicKeyFromJSON({
        challenge: 'AQID',
        allowCredentials: [{ id: 'Bw', type: 'public-key' }]
      })

      expect(bytesOf(publicKey.allowCredentials[0].id)).toEqual([7])
      expect(publicKey).not.toHaveProperty('user')
    })
  })

  describe('coerceCredentialInfoToJSON', () => {
    test('encodes the answer of a key for the server', () => {
      expect(
        coerceCredentialInfoToJSON({
          id: 'credential-1',
          rawId: bufferOf([1, 2, 3]),
          type: 'public-key',
          authenticatorAttachment: 'cross-platform',
          response: {
            clientDataJSON: bufferOf([4]),
            authenticatorData: bufferOf([5]),
            signature: bufferOf([6]),
            userHandle: 'user-1'
          }
        })
      ).toEqual({
        id: 'credential-1',
        rawId: 'AQID',
        type: 'public-key',
        authenticatorAttachment: 'cross-platform',
        response: {
          clientDataJSON: 'BA',
          authenticatorData: 'BQ',
          signature: 'Bg',
          userHandle: 'user-1'
        }
      })
    })

    test('encodes the attestation of a new key', () => {
      const json = coerceCredentialInfoToJSON({
        id: 'credential-1',
        rawId: bufferOf([1]),
        type: 'public-key',
        response: {
          clientDataJSON: bufferOf([4]),
          attestationObject: bufferOf([7])
        }
      })

      expect(json.response).toEqual({
        clientDataJSON: 'BA',
        attestationObject: 'Bw'
      })
    })
  })

  describe('coerceTwoFactorPayload', () => {
    test('encodes the key answer of a two-factor payload only', () => {
      expect(coerceTwoFactorPayload(undefined)).toBeUndefined()
      expect(coerceTwoFactorPayload({ totp: '123456' })).toEqual({
        totp: '123456'
      })
      expect(
        coerceTwoFactorPayload({
          fido_authentication_response: {
            id: 'credential-1',
            rawId: [1],
            type: 'public-key',
            response: { clientDataJSON: [2] }
          }
        }).fido_authentication_response
      ).toEqual({
        id: 'credential-1',
        rawId: 'AQ',
        type: 'public-key',
        response: { clientDataJSON: 'Ag' }
      })
    })
  })
})
