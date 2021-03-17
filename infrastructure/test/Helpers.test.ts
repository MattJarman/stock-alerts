import Helpers from '../lib/Helpers'

describe('Test Helpers', () => {
  describe('.getRegionShortName', () => {
    test('It returns the correct short name for a valid region', () => {
      const region = 'eu-west-1'
      const expected = 'ew1'
      const actual = Helpers.getRegionShortName(region)

      expect(actual).toEqual(expected)
    })

    test('It throws an error if the region is invalid', () => {
      const region = 'invalid-eu-west-1'

      expect(() => {
        Helpers.getRegionShortName(region)
      }).toThrowError(new Error('The provided region is invalid.'))
    })
  })
})
