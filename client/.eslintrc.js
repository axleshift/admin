module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    react: {
      version: "18.2.0", // Automatically detect React version
    },
  },
  extends: [
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', 'react-hooks'],
  rules: {
    'react/prop-types': 'error',
  },
};
