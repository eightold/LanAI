// 加载.env文件
const fs = require("fs")
const path = require("path")
const { DefinePlugin } = require("@rspack/core")

function loadEnv(projectPath) {
  const envPath = path.join(projectPath, ".env")
  const env = {}
  if (!fs.existsSync(envPath)) return env
  const content = fs.readFileSync(envPath, "utf-8")
  content.split("\n").forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) return
    const m = trimmed.match(/^([\w.]+)\s*=\s*["']?(.*?)["']?\s*$/)
    if (m) env[m[1]] = m[2]
  })
  return env
}

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
  },
  // 加载.env
  webpack: {
    plugins: [
      new DefinePlugin({
        "process.env": (() => {
          const env = loadEnv(process.cwd())
          const result = {}
          for (const key in env) result[key] = JSON.stringify(env[key])
          return result
        })()
      })
    ]
  }
}
