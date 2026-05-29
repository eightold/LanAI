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
    preview: lastMessage ? lastMessage.content : "New conversation"
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

function saveChatData(session, done) {
  var limited = {
    id: session.id,
    title: session.title,
    createTime: session.createTime,
    messages: (session.messages || []).slice(-MAX_MESSAGES),
    updateTime: now()
  }
  writeJson(getChatKey(limited.id), limited, done)
}

function syncChatListItem(session, done) {
  listChats(function(list) {
    var nextList = list.filter(function(item) {
      return item.id !== session.id
    })
    nextList.unshift(toListItem(session))
    writeJson(STORAGE_KEYS.CHAT_LIST, nextList, done)
  })
}

function saveSession(session, done) {
  saveChatData(session, function() {
    syncChatListItem(session, done)
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
    if (!session) {
      done(null)
      return
    }

    var timestamp = now()
    var messages = (session.messages || []).slice()
    messages.push({
      id: createId("msg"),
      role: "user",
      content: content,
      timestamp: timestamp
    })

    var titleChanged = session.title === "New Chat"
    var newTitle = titleChanged ? content.slice(0, 16) : session.title

    saveChatData(
      {
        id: session.id,
        title: newTitle,
        createTime: session.createTime,
        messages: messages
      },
      function() {
        // Only sync chat_list when title is set for the first time
        if (titleChanged) {
          syncChatListItem(
            {
              id: session.id,
              title: newTitle,
              updateTime: timestamp,
              messages: messages
            },
            function() {
              done(messages)
            }
          )
        } else {
          done(messages)
        }
      }
    )
  })
}

export function appendAssistantMessage(id, content, done) {
  getChat(id, function(session) {
    if (!session) {
      done(null)
      return
    }

    var timestamp = now()
    var messages = (session.messages || []).slice()
    messages.push({
      id: createId("msg"),
      role: "assistant",
      content: content,
      timestamp: timestamp
    })

    // Assistant messages don't trigger chat_list sync (saves one read+write per AI reply)
    saveChatData(
      {
        id: session.id,
        title: session.title,
        createTime: session.createTime,
        messages: messages
      },
      function() {
        done(messages)
      }
    )
  })
}

/**
 * Save chat with caller-provided messages array.
 * Used by chat page when it holds the full message array in memory.
 * Handles message capping (MAX_MESSAGES) and chat_list sync.
 */
export function saveFullChat(id, title, createTime, messages, done) {
  saveSession(
    {
      id: id,
      title: title,
      createTime: createTime || now(),
      messages: messages
    },
    done
  )
}
