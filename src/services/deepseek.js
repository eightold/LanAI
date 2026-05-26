import fetch from "@system.fetch"
import {
  DEEPSEEK_ENDPOINT,
  DEEPSEEK_MODEL,
  DEEPSEEK_MAX_TOKENS,
  REQUEST_TIMEOUT
} from "../utils/constants"

function parseResponse(response) {
  var raw = response && (response.data || response.body || response)
  var data = typeof raw === "string" ? JSON.parse(raw) : raw
  var choice = data && data.choices && data.choices[0]
  var message = choice && choice.message
  var content = (message && message.content) || ""
  return content
}

export function sendChatMessage(messages, done, fail, apiKey, endpoint, model, maxTokens) {
  var key = apiKey
  var url = endpoint || DEEPSEEK_ENDPOINT
  var modelName = model || DEEPSEEK_MODEL
  var maxTok = maxTokens || DEEPSEEK_MAX_TOKENS

  if (!key) {
    fail(new Error("API Key is not configured"))
    return
  }

  var finished = false
  var timer = setTimeout(function() {
    if (finished) {
      return
    }

    finished = true
    fail(new Error("Request timeout"))
  }, REQUEST_TIMEOUT)

  fetch.fetch({
    url: url,
    method: "POST",
    header: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json"
    },
    data: JSON.stringify({
      model: modelName,
      messages: messages,
      max_tokens: maxTok
    }),
    success: function(response) {
      if (finished) {
        return
      }

      finished = true
      clearTimeout(timer)

      try {
        done(parseResponse(response))
      } catch (error) {
        fail(error)
      }
    },
    fail: function(error) {
      if (finished) {
        return
      }

      finished = true
      clearTimeout(timer)
      fail(error)
    }
  })
}
