import fetch from "@system.fetch"
import {
  DEEPSEEK_API_KEY,
  DEEPSEEK_ENDPOINT,
  DEEPSEEK_MODEL,
  REQUEST_TIMEOUT
} from "../utils/constants"

function requestByFetch(options) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timeout"))
    }, REQUEST_TIMEOUT)

    fetch.fetch({
      ...options,
      success(response) {
        clearTimeout(timer)
        resolve(response)
      },
      fail(error) {
        clearTimeout(timer)
        reject(error)
      }
    })
  })
}

function parseResponse(response) {
  const raw = response && (response.data || response.body || response)
  const data = typeof raw === "string" ? JSON.parse(raw) : raw
  const choice = data && data.choices && data.choices[0]
  const message = choice && choice.message
  return (message && message.content) || ""
}

export async function sendChatMessage(messages) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DeepSeek API Key is not configured")
  }

  const response = await requestByFetch({
    url: DEEPSEEK_ENDPOINT,
    method: "POST",
    header: {
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    },
    data: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      max_tokens: 300
    })
  })

  const content = parseResponse(response)

  if (!content) {
    throw new Error("Empty AI response")
  }

  return content
}
