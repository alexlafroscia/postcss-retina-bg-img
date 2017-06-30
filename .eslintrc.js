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
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    // Built-in
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single', {
      avoidEscape: true
    }],
    'no-console': 'warn',
    semi: ['error','always'],

    // Prettier
    'prettier/prettier': ['error', {
      singleQuote: true
    }],

    // Mocha
    'mocha/no-exclusive-tests': 'warn',
    'mocha/no-pending-tests': 'warn',
    'mocha/no-skipped-tests': 'warn'
  }
};
