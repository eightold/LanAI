import {MAX_MESSAGES, STORAGE_KEYS} from "../utils/constants"
import {createId} from "../utils/uuid"
import {now} from "../utils/time"
import {getJson, readValue, removeValue, writeJson, writeValue} from "./storage"
import {sendChatMessage} from "./deepseek"

function getChatKey(id) {
  return `chat_${id}`
}

function toListItem(session) {
  const messages = session.messages || []
  const lastMessage = messages[messages.length - 1]

  return {
    id: session.id,
    title: session.title,
    updateTime: session.updateTime,
    preview: lastMessage ? lastMessage.content : "New conversation",
    timeText: ""
  }
}

function createSession(title) {
  const timestamp = now()

  return {
    id: createId("chat"),
    title: title || "New Chat",
    createTime: timestamp,
    updateTime: timestamp,
    messages: []
  }
}

async function saveSession(session) {
  const limited = {
    ...session,
    messages: (session.messages || []).slice(-MAX_MESSAGES),
    updateTime: now()
  }

  await writeJson(getChatKey(limited.id), limited)

  const list = await listChats()
  const nextList = list.filter(item => item.id !== limited.id)
  nextList.unshift(toListItem(limited))
  await writeJson(STORAGE_KEYS.CHAT_LIST, nextList)

  return limited
}

export async function listChats() {
  return getJson(STORAGE_KEYS.CHAT_LIST, [])
}

export async function createChat() {
  const session = createSession()
  return saveSession(session)
}

export async function deleteChat(id) {
  const list = await listChats()
  await writeJson(
    STORAGE_KEYS.CHAT_LIST,
    list.filter(item => item.id !== id)
  )
  await removeValue(getChatKey(id))

  const current = await readValue(STORAGE_KEYS.CURRENT_CHAT_ID)
  if (current === id) {
    await writeValue(STORAGE_KEYS.CURRENT_CHAT_ID, "")
  }
}

export async function getChat(id) {
  if (!id) {
    return null
  }

  return getJson(getChatKey(id), null)
}

export function setCurrentChatId(id) {
  return writeValue(STORAGE_KEYS.CURRENT_CHAT_ID, id)
}

export function getCurrentChatId() {
  return readValue(STORAGE_KEYS.CURRENT_CHAT_ID)
}

export async function appendUserMessage(id, content) {
  const session = await getChat(id)
  const timestamp = now()
  const message = {
    id: createId("msg"),
    role: "user",
    content,
    timestamp
  }

  const nextSession = {
    ...session,
    title: session.title === "New Chat" ? content.slice(0, 16) : session.title,
    messages: [...session.messages, message],
    updateTime: timestamp
  }

  return saveSession(nextSession)
}

export async function appendAssistantMessage(id, content) {
  const session = await getChat(id)
  const timestamp = now()
  const message = {
    id: createId("msg"),
    role: "assistant",
    content,
    timestamp
  }

  return saveSession({
    ...session,
    messages: [...session.messages, message],
    updateTime: timestamp
  })
}

export async function askDeepSeek(id, content) {
  const session = await appendUserMessage(id, content)
  const history = session.messages.map(message => ({
    role: message.role,
    content: message.content
  }))

  const answer = await sendChatMessage(history)
  return appendAssistantMessage(id, answer)
}
