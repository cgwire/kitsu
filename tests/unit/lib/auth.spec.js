import auth from '../../../src/lib/auth'

describe('auth', () => {
  test('isPasswordValid', () => {
    expect(auth.isPasswordValid('', '')).toBeFalsy()
    expect(auth.isPasswordValid('abc', 'abc')).toBeFalsy()
    expect(auth.isPasswordValid('abcdefg', 'abcdefgh')).toBeFalsy()
    expect(auth.isPasswordValid('abcdefg', 'abcdefg')).toBeTruthy()
  })
})
