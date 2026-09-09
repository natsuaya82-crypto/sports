const expoConfig = require('eslint-config-expo/flat');

// 責務の肥大化を止めるための上限。
// domain / data / lib は純粋なロジックなので厳しく、ui はJSXの分だけ緩める。
const logicLimits = {
  'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
  complexity: ['error', { max: 10 }],
  'max-depth': ['error', { max: 4 }],
  'max-params': ['error', { max: 4 }],
};

const uiLimits = {
  'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
  complexity: ['error', { max: 10 }],
  'max-depth': ['error', { max: 4 }],
  'max-params': ['error', { max: 4 }],
};

module.exports = [
  ...expoConfig,
  {
    ignores: ['node_modules/', '.expo/', '.expo-export/', 'dist/', 'coverage/'],
  },
  {
    // 未使用の変数・importは放置すると増え続けるため警告ではなくエラーにする。
    files: ['src/**/*.{ts,tsx}', 'App.tsx', 'index.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // 循環依存の禁止（CLAUDE.md 第4章 No Circular Dependency）。
    // レイヤ間の向きは scripts/check-architecture.sh、レイヤ内の循環はここで見る。
    files: ['src/**/*.{ts,tsx}', 'App.tsx', 'index.ts'],
    rules: {
      'import/no-cycle': ['error', { maxDepth: Infinity, ignoreExternal: true }],
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}', 'src/data/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
    rules: logicLimits,
  },
  {
    files: ['src/ui/**/*.{ts,tsx}', 'App.tsx'],
    rules: uiLimits,
  },
  {
    // テストは長さの制約から外す。
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
];
