const extendsBase = [
  'eslint:recommended',
  'plugin:react/recommended',
  'plugin:prettier/recommended',
  'plugin:tailwindcss/recommended',
];

const extendsTypescript = [
  ...extendsBase,
  'plugin:@typescript-eslint/recommended',
];

module.exports = {
  env: {
    browser: true,
    es2020: true,
    jest: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: extendsBase,
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'tailwindcss',
    'prettier',
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/no-contradicting-classname': 'error',
    'prettier/prettier': 'error',
    'block-scoped-var': 'error',
    eqeqeq: ['error', 'always', {null: 'ignore'}],
    'no-var': 'error',
    'prefer-const': 'error',
    'eol-last': 'error',
    'prefer-arrow-callback': 'error',
    'no-trailing-spaces': 'error',
    quotes: ['warn', 'single', {avoidEscape: true}],
    'no-restricted-properties': [
      'error',
      {
        object: 'describe',
        property: 'only',
      },
      {
        object: 'it',
        property: 'only',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: extendsTypescript,
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-warning-comments': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/camelcase': 'off',
        'node/no-missing-import': 'off',
        'node/no-empty-function': 'off',
        'node/no-unsupported-features/es-syntax': 'off',
        'node/no-missing-require': 'off',
        'node/shebang': 'off',
        'no-dupe-class-members': 'off',
        'require-atomic-updates': 'off',
      },
    },
  ],
};
