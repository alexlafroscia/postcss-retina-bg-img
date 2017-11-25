module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  plugins: [
    'prettier',
    'mocha'
  ],
  rules: {
    // Prettier
    'prettier/prettier': ['error', {
      singleQuote: true
    }],

    // Mocha
    'mocha/no-exclusive-tests': 'warn',
    'mocha/no-pending-tests': 'warn',
    'mocha/no-skipped-tests': 'warn',

    // Built-in
    'no-console': 'warn'
  }
};
