import stringHelpers from '../../../src/lib/string'

describe('lib/string', () => {
  it('generateNextName', () => {
    expect(stringHelpers.generateNextName('Test')).toEqual('')
    expect(stringHelpers.generateNextName('')).toEqual('')
    expect(stringHelpers.generateNextName('EP01')).toEqual('EP02')
    expect(stringHelpers.generateNextName('SH01')).toEqual('SH02')
    expect(stringHelpers.generateNextName('SE_01')).toEqual('SE_02')
    expect(stringHelpers.generateNextName('EP001')).toEqual('EP002')
    expect(stringHelpers.generateNextName('EP009')).toEqual('EP010')
    expect(stringHelpers.generateNextName('001')).toEqual('002')
    expect(stringHelpers.generateNextName('12')).toEqual('13')
  })

  it('generateNextName with padding', () => {
    expect(stringHelpers.generateNextName('SH001', 10)).toEqual('SH010')
    expect(stringHelpers.generateNextName('SH010', 10)).toEqual('SH020')
    expect(stringHelpers.generateNextName('SH001', 2)).toEqual('SH003')
  })
})
