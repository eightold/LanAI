import {MAX_MESSAGES, STORAGE_KEYS} from "../utils/constants"
import {createId} from "../utils/uuid"
import {now} from "../utils/time"
import {getJson, readValue, removeValue, writeJson, writeValue} from "./storage"


function getChatKey(id) {
  return "chat_" + id
}

function toListItem(session) {
  var messages = session.messages || []
  var lastMessage = messages[messages.length - 1]

  return {
    id: session.id,
    title: session.title,
    updateTime: session.updateTime,
    preview: lastMessage ? lastMessage.content : "New conversation",
    timeText: ""
  }
}

function createSession(title) {
  var timestamp = now()

  return {
    id: createId("chat"),
    title: title || "New Chat",
    createTime: timestamp,
    updateTime: timestamp,
    messages: []
  }
}

function saveSession(session, done) {
  var limited = {
    id: session.id,
    title: session.title,
    createTime: session.createTime,
    messages: (session.messages || []).slice(-MAX_MESSAGES),
    updateTime: now()
  }

  writeJson(getChatKey(limited.id), limited, function() {
    listChats(function(list) {
      var nextList = list.filter(function(item) {
        return item.id !== limited.id
      })

      nextList.unshift(toListItem(limited))
      writeJson(STORAGE_KEYS.CHAT_LIST, nextList, function() {
        done(limited)
      })
    })
  })
}

export function listChats(done) {
  getJson(STORAGE_KEYS.CHAT_LIST, [], done)
}

export function createChat(done) {
  saveSession(createSession(), done)
}

export function deleteChat(id, done) {
  listChats(function(list) {
    writeJson(
      STORAGE_KEYS.CHAT_LIST,
      list.filter(function(item) {
        return item.id !== id
      }),
      function() {
        removeValue(getChatKey(id), function() {
          readValue(STORAGE_KEYS.CURRENT_CHAT_ID, function(current) {
            if (current === id) {
              writeValue(STORAGE_KEYS.CURRENT_CHAT_ID, "", function() {
                done()
              })
              return
            }

            done()
          })
        })
      }
    )
  })
}

export function getChat(id, done) {
  if (!id) {
    done(null)
    return
  }

  getJson(getChatKey(id), null, done)
}

export function setCurrentChatId(id, done) {
  writeValue(STORAGE_KEYS.CURRENT_CHAT_ID, id, done)
}

export function getCurrentChatId(done) {
  readValue(STORAGE_KEYS.CURRENT_CHAT_ID, done)
}

export function appendUserMessage(id, content, done) {
  getChat(id, function(session) {
    var timestamp = now()
    var messages = (session.messages || []).slice()
    var message = {
      id: createId("msg"),
      role: "user",
      content: content,
      timestamp: timestamp
    }

    messages.push(message)

    saveSession(
      {
        id: session.id,
        title: session.title === "New Chat" ? content.slice(0, 16) : session.title,
        createTime: session.createTime,
        updateTime: timestamp,
        messages: messages
      },
      done
    )
  })
}

export function appendAssistantMessage(id, content, done) {
  getChat(id, function(session) {
    var timestamp = now()
    var messages = (session.messages || []).slice()
    var message = {
      id: createId("msg"),
      role: "assistant",
      content: content,
      timestamp: timestamp
    }

    messages.push(message)

    saveSession(
      {
        id: session.id,
        title: session.title,
        createTime: session.createTime,
        updateTime: timestamp,
        messages: messages
      },
      done
    )
  })
}


