module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  testMatch: ['**/*.test.ts'],
  resetModules: true,
  coveragePathIgnorePatterns: ['node_modules', 'test']
}
