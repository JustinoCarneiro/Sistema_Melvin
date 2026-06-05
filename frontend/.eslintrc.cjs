// Fronteiras da Arquitetura Orientada a Features (enforced via no-restricted-imports).
// Regra de ouro: cada feature expõe sua API pública SÓ pelo barrel `@features/<Feature>`
// (index.js); core é a camada base e não conhece features nem o site.
const noDeepFeatureImports = {
  group: ['@features/*/pages/*', '@features/*/hooks/*', '@features/*/api/*'],
  message:
    'Fronteira de feature: importe a API pública via "@features/<Feature>" (barrel index.js), nunca arquivos internos (pages/hooks/api) de outra feature.',
}

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'dist-ssr', 'playwright-report', 'test-results', 'coverage', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    // PropTypes desativado: o projeto caminha para TypeScript (ver CLAUDE.md),
    // onde a tipagem substitui prop-types. Evita ruído e churn na UI congelada.
    'react/prop-types': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Proíbe deep imports no interior de qualquer feature (vale para site e app shell).
    'no-restricted-imports': ['error', { patterns: [noDeepFeatureImports] }],
  },
  overrides: [
    {
      // Testes E2E (Playwright) e sua config rodam em contexto Node (process, etc.).
      // test/expect vêm de import (@playwright/test via ./fixtures), não de globais.
      files: ['tests/**/*.{js,jsx}', 'playwright.config.js'],
      env: { node: true },
    },
    {
      // CAMADA BASE: core não pode depender de features nem do site público.
      files: ['src/app/core/**/*.{js,jsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@features/**', '@site/**'],
                message:
                  'Fronteira: core é a camada base compartilhada — não pode importar de @features nem @site.',
              },
            ],
          },
        ],
      },
    },
    {
      // FEATURES: mantêm a proibição de deep import e não dependem do site público.
      files: ['src/app/features/**/*.{js,jsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              noDeepFeatureImports,
              {
                group: ['@site/**'],
                message:
                  'Fronteira: uma feature não deve depender do site público (@site).',
              },
            ],
          },
        ],
      },
    },
  ],
}
