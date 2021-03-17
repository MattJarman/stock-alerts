const REGION_SEPARATED_AMOUNT = 3

export default class Helpers {
  public static getRegionShortName (region: string): string {
    const separated = region.split('-')
    if (separated.length !== REGION_SEPARATED_AMOUNT) {
      throw new Error('The provided region is invalid.')
    }

    return separated.map(word => word.charAt(0)).join('')
  }
}
