export default {
  testRegex: "__tests__/.*\.test\.(m|)js$", // eslint-disable-line no-useless-escape
  "transformIgnorePatterns": [
    "node_modules/(?!variables/.*)"
  ],
  "transform": {
    "^.+\\.mjs?$": "babel-jest"
  }
}
