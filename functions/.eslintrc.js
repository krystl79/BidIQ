module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    ".eslintrc.js",
    "index.js",
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "@typescript-eslint/no-unused-vars": "off",
    "no-unused-vars": "off",
    "max-len": "off",
    "comma-dangle": "off",
    "object-curly-spacing": "off",
    "indent": "off",
    "require-jsdoc": "off",
    "arrow-parens": "off",
    "no-trailing-spaces": "off",
    "eol-last": "off",
    "padded-blocks": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
