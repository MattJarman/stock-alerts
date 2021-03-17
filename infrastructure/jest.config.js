module.exports = {
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
}
