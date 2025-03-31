module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended"
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", { "allowTemplateLiterals": true }],
    "indent": ["error", 2],
    "max-len": ["error", { "code": 120 }],
    "require-jsdoc": 0,
    "comma-dangle": ["error", "always-multiline"],
    "arrow-parens": ["error", "as-needed"],
    "object-curly-spacing": ["error", "always"],
    "no-invalid-this": 0,
    "no-var": 0,
    "space-before-function-paren": 0,
    "camelcase": 0,
    "spaced-comment": 0,
    "no-trailing-spaces": 0,
    "eol-last": 0,
  },
  overrides: [
    {
      files: ["*.ts"],
      extends: [
        "plugin:@typescript-eslint/recommended"
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
        ecmaVersion: 2018,
        tsconfigRootDir: __dirname,
      },
      plugins: [
        "@typescript-eslint"
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
      },
    }
  ],
  ignorePatterns: [
    "/lib/**/*",
    ".eslintrc.js"
  ]
};
