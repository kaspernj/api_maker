module.exports = {
  sourceType: "unambiguous",
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {node: "current"}
      }
    ],
    [
      "@babel/preset-react",
      {
        development: process.env.BABEL_ENV === "development"
      }
    ]
  ]
}
