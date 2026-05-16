module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module"
  },
  globals: {
    console: "readonly"
  },
  rules: {
    eqeqeq: ["error", "always"],
    "no-unused-vars": ["warn", {argsIgnorePattern: "^_"}]
  }
}
