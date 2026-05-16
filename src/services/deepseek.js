import fetch from "@system.fetch"
import {
  DEEPSEEK_API_KEY,
  DEEPSEEK_ENDPOINT,
  DEEPSEEK_MODEL,
  REQUEST_TIMEOUT
} from "../utils/constants"

function parseResponse(response) {
  var raw = response && (response.data || response.body || response)
  var data = typeof raw === "string" ? JSON.parse(raw) : raw
  var choice = data && data.choices && data.choices[0]
  var message = choice && choice.message
  return (message && message.content) || ""
}

export function sendChatMessage(messages, done, fail) {
  if (!DEEPSEEK_API_KEY) {
    fail(new Error("DeepSeek API Key is not configured"))
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
    url: DEEPSEEK_ENDPOINT,
    method: "POST",
    header: {
      Authorization: "Bearer " + DEEPSEEK_API_KEY,
      "Content-Type": "application/json"
    },
    data: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: messages,
      max_tokens: 300
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
