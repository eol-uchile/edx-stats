const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('eslint', {
  plugins: ['testing-library'],
  extends: ['plugin:testing-library/react'],
});
