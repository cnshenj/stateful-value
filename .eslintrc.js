module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint"
  ],
  env: {
    browser: true,
    node: true
  },
  ignorePatterns: [
    "/**/*.*", // Ignore all first
    "!/**/*.ts" // Add back .ts files
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  rules: {
    "max-len": ["warn", { code: 120, ignoreUrls: true }],
    "semi": "error",
    "@typescript-eslint/no-redeclare": "error",
    "@typescript-eslint/no-shadow": "error",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/restrict-template-expressions": "off",
  },
  parserOptions: {
    project: "./tsconfig.test.json"
  }
};
