import storage from "@system.storage"

function readValue(key, done) {
  storage.get({
    key: key,
    success: function(data) {
      done(data || "")
    },
    fail: function() {
      done("")
    }
  })
}

function writeValue(key, value, done) {
  storage.set({
    key: key,
    value: value,
    success: function() {
      if (done) {
        done(true)
      }
    },
    fail: function() {
      if (done) {
        done(false)
      }
    }
  })
}

function removeValue(key, done) {
  var deleteApi = storage.delete || storage.remove

  if (!deleteApi) {
    if (done) {
      done(false)
    }
    return
  }

  deleteApi({
    key: key,
    success: function() {
      if (done) {
        done(true)
      }
    },
    fail: function() {
      if (done) {
        done(false)
      }
    }
  })
}

export function getJson(key, fallback, done) {
  readValue(key, function(value) {
    if (!value) {
      done(fallback)
      return
    }

    try {
      done(JSON.parse(value))
    } catch (error) {
      console.error("storage parse error", error)
      writeJson(key, fallback, function() {
        done(fallback)
      })
    }
  })
}

export function writeJson(key, value, done) {
  writeValue(key, JSON.stringify(value), done)
}

export {readValue, writeValue, removeValue}
