module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/__tests__/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
  transform: {
    "^.+\\.(cjs|mjs|[jt]sx?)$": ["babel-jest", {configFile: "./babel.config.cjs"}]
  },
  transformIgnorePatterns: ["/node_modules/(?!epic-locks|i18n-on-steroids)/"],
  moduleNameMapper: {
    "^\\.\\./build/(.*)$": "<rootDir>/src/$1",
    "^\\.\\./\\.\\./build/(.*)$": "<rootDir>/src/$1",
    "^@rails/actioncable$": "<rootDir>/__tests__/support/actioncable.js",
    "^models\\.js$": "<rootDir>/__tests__/support/models.js"
  }
}
