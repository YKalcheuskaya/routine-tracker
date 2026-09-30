/** Static-analysis rules for React components and hook dependency safety. */
import js from '@eslint/js'
import hooksPlugin from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', 'e2e/**/*.js', 'scripts/**/*.mjs', '*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': hooksPlugin },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
      // These effects intentionally reset controlled drafts or ownership state
      // when their external source changes; the updates are not render-derived.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]
