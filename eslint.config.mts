import type { ESLint } from 'eslint'
// @ts-expect-error: No declaration file found
import importHelpers from 'eslint-plugin-import-helpers'
import reactX from 'eslint-plugin-react-x'
import { defineConfig, type Config } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([
  {
    ignores: [
      'dist/',
      'node_modules/',
      'public/',
      'reports/',
      '.husky/',
      '.vscode/',
      'coverage/'
    ]
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: {
      js,
      stylistic,
      tseslint,
      'import-helpers': importHelpers as unknown as ESLint.Plugin
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    extends: [
      'js/recommended',
      stylistic.configs.customize({
        braceStyle: '1tbs',
        indent: 4,
        semi: false,
        commaDangle: 'never',
        quotes: 'single'
      }),
      tseslint.configs.recommended,
      reactX.configs.recommended as unknown as Config
    ],
    rules: {
      'no-console': 'warn',
      'one-var': ['error', 'never'],
      eqeqeq: 'warn',
      'prefer-const': 'warn',
      'consistent-return': 'warn',
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/one-var-declaration-per-line': ['error', 'always'],
      '@stylistic/quotes': [
        'error',
        'single',
        { avoidEscape: true }
      ],
      '@stylistic/quote-props': ['error', 'as-needed'],
      'import-helpers/order-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: [
            ['/^react$/', '/^react-dom$/'],
            'module',
            '/^@/',
            [
              'parent',
              'sibling',
              'index'
            ]
          ],
          alphabetize: {
            order: 'asc',
            ignoreCase: true
          }
        }
      ],
      'react-x/no-nested-components': 'warn',
      'react-x/no-array-index-key': 'warn'
    }
  },
  {
    files: ['**/*.{ts,mts,cts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    rules: {
      '@stylistic/indent': ['error', 2],
      '@stylistic/jsx-indent': ['error', 2],
      '@stylistic/jsx-indent-props': ['error', 2],
      '@stylistic/array-bracket-newline': [
        'error',
        {
          multiline: true,
          minItems: 3
        }
      ],
      '@stylistic/array-element-newline': [
        'error',
        {
          multiline: true,
          consistent: true,
          minItems: 3
        }
      ],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'none',
            requireLast: false
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false
          }
        }
      ],
      '@typescript-eslint/no-explicit-any': [
        'error',
        { ignoreRestArgs: true }
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false }
      ],
      '@typescript-eslint/unbound-method': 'off',
      '@stylistic/object-curly-newline': [
        'error',
        {
          ObjectExpression: {
            multiline: true,
            consistent: true,
            minProperties: 3
          },
          ObjectPattern: {
            multiline: true,
            consistent: true,
            minProperties: 3
          },
          ImportDeclaration: {
            multiline: true,
            consistent: true,
            minProperties: 3
          },
          ExportDeclaration: {
            multiline: true,
            consistent: true,
            minProperties: 3
          }
        }
      ],
      '@stylistic/object-property-newline': [
        'error',
        { allowAllPropertiesOnSameLine: true }
      ]
    }
  },
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/*.test.tsx',
      '**/*.spec.tsx'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off'
    }
  }
])
