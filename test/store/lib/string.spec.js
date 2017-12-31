import { expect } from 'chai'
import test from '../../../src/lib/string'
import stringHelpers from '../../../src/lib/string'

describe('lib/string', () => {

  it('generateNextName', () => {
    expect(stringHelpers.generateNextName('Test')).to.equal('')
    expect(stringHelpers.generateNextName('')).to.equal('')
    expect(stringHelpers.generateNextName('EP01')).to.equal('EP02')
    expect(stringHelpers.generateNextName('SH01')).to.equal('SH02')
    expect(stringHelpers.generateNextName('SE_01')).to.equal('SE_02')
    expect(stringHelpers.generateNextName('EP001')).to.equal('EP002')
    expect(stringHelpers.generateNextName('EP009')).to.equal('EP010')
    expect(stringHelpers.generateNextName('001')).to.equal('002')
    expect(stringHelpers.generateNextName('12')).to.equal('13')
  })
})
