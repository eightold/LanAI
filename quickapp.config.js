module.exports = {
  postHook(config) {
    config.target = ["web", "es5"]
    config.output = config.output || {}
    config.output.environment = {
      arrowFunction: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      forOf: false,
      module: false
    }
  }
}
