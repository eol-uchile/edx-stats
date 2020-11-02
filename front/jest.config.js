const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('jest', {
  setupFiles: ['<rootDir>/src/setupTest.js'],
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'src/i18n',
    'src/frontend-component-header/.*(js|jsx)$',
  ],
  testEnvironment: 'jest-environment-jsdom-sixteen',
});
