module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react-hooks',
    'deprecate',
    'security',
  ],
  extends: [
    'airbnb-typescript',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:security/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: '.',
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: { version: 'detect' },
  },
  env: {
    browser: true,
    node: true,
    jasmine: true,
  },
  rules: {
    'max-len': ['error', {
      code: 100,
      ignoreComments: true,
      ignoreUrls: true,
      ignoreRegExpLiterals: true,
    }],
    'object-curly-spacing': ['error', 'always'],
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'no-plusplus': 'off',
    'react/jsx-filename-extension': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'off',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/forbid-prop-types': 'off',
    'react/no-unused-prop-types': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
