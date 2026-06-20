export var APP_NAME = "LanAI"

export var STORAGE_KEYS = {
  CHAT_LIST: "chat_list",
  CURRENT_CHAT_ID: "current_chat_id",
  API_KEY: "settings_api_key",
  GLM_API_KEY: "settings_glm_api_key",
  MODEL_PROVIDER: "settings_model_provider"
}

export var DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions"
export var DEEPSEEK_MODEL = "deepseek-v4-flash"
export var DEEPSEEK_API_KEY = process.env.ENV_DEEPSEEK_API_KEY // 在quickapp.config.js 中做了.env加载

export var GLM_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
export var GLM_MODEL = "glm-4.7"
export var GLM_API_KEY = process.env.ENV_GLM_API_KEY

export var PROVIDERS = {
  DEEPSEEK: "deepseek",
  GLM: "glm"
}

export var DEEPSEEK_MAX_TOKENS = 2048
export var GLM_MAX_TOKENS = 1024

export var MAX_MESSAGES = 50
export var MAX_INPUT_LENGTH = 200
export var REQUEST_TIMEOUT = 10000

export var REQUEST_STATE = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error"
}

// 好像没必要写这...
export function getSystemPrompt(maxTokens) {
  var charLimit = Math.floor(maxTokens / 1.5) // 计算最大可用字数
  // prompt
  return "你是 LanAI。你运行在 Xiaomi Watch 手表上，屏幕较小，如果是普通聊天而非专业内容请保持回复简洁清晰，控制在 " + charLimit + " 字以内。使用适合小屏幕阅读的简洁语言，不使用markdown语言，语气亲切友好。"
}
