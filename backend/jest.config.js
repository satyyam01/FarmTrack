module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/../__tests__/**/*.test.js'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  setupFiles: ['dotenv/config']
};
