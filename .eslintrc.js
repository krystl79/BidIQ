module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  },
  overrides: [
    {
      files: ['src/service-worker.js'],
      rules: {
        'no-restricted-globals': 'off',
        'no-undef': 'off'
      }
    }
  ]
}; 