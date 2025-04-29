import { defineConfig } from "eslint/config";
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from "globals";

import js from "@eslint/js";
import markdown from "@eslint/markdown";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js, 'simple-import-sort': simpleImportSort, }, rules: {
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Groups are how you organize your imports.  Here's a basic example.
          ['^\\u0000'],  // Side effect imports
          ['^react$', '^@?\\w'], // React and packages
          ['^@/', '^@.*\\/.*'], // Absolute and relative imports
          ['^\\.\\/'], // Relative imports
          ['^\\.+'], // More relative imports
          ['^.+\\.module\\.(css|scss)$']  // Style module imports
        ],
      },
    ],
  }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node } },
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/gfm", extends: ["markdown/recommended"] },
]);