module.exports = {
  // ... 其他配置
  rules: {
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }]
  }
} 