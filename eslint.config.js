import globals from 'globals';
import pluginReact from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect', // Automatically picks the version you have installed
      },
    },
    plugins: {
      react: pluginReact,
    },
    rules: {
      // Add any specific ESLint rules you need here
    },
  },
  pluginReact.configs.flat.recommended,
];
