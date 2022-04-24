module.exports = {
  env: {
    es2021: true,
    node: true,
    mocha: true

  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'mocha',
    'chai-friendly'
  ],
  rules: {
    camelcase: 'off',
    semi: 'off',
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'test/**/*.ts']
    }
  ]
}
