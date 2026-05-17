export var APP_NAME = "LanAI"

export var STORAGE_KEYS = {
  CHAT_LIST: "chat_list",
  CURRENT_CHAT_ID: "current_chat_id",
  API_KEY: "settings_api_key"
}

export var DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions"
export var DEEPSEEK_MODEL = "deepseek-v4-flash"
export var DEEPSEEK_API_KEY = ""

export var MAX_MESSAGES = 50
export var MAX_INPUT_LENGTH = 200
export var REQUEST_TIMEOUT = 10000

export var REQUEST_STATE = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error"
}
