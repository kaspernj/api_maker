module.exports = {
  "mode": "production",
  "module": {
    "rules": [
      {
        "exclude": /node_modules/,
        "test": /\.(js|jsx)$/,
        "use": "babel-loader"
      }
    ]
  },
  "resolve": {
    "extensions": [".js", ".jsx"]
  }
}
