const presetEnv = [
  "@babel/preset-env",
  {
    targets: {node: "current"}
  }
]

const presetReact = [
  "@babel/preset-react",
  {
    development: process.env.BABEL_ENV === "development"
  }
]

module.exports = {
  sourceType: "unambiguous",
  presets: [presetEnv, presetReact],
  env: {
    test: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {node: "current"},
            modules: false
          }
        ],
        presetReact
      ]
    }
  }
}
