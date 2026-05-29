import storage from "@system.storage"

// --- in-memory cache ---
var _cache = {}

function cacheGet(key) {
  return _cache[key]
}

function cacheSet(key, value) {
  _cache[key] = value
}

function cacheClear(key) {
  delete _cache[key]
}

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
  cacheClear(key)
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
  var cached = cacheGet(key)
  if (cached !== undefined) {
    setTimeout(function() {
      done(cached)
    }, 0)
    return
  }

  readValue(key, function(value) {
    if (!value) {
      cacheSet(key, fallback)
      done(fallback)
      return
    }

    try {
      var parsed = JSON.parse(value)
      cacheSet(key, parsed)
      done(parsed)
    } catch (error) {
      console.error("storage parse error for key " + key, error)
      writeJson(key, fallback, function() {
        cacheSet(key, fallback)
        done(fallback)
      })
    }
  })
}

export function writeJson(key, value, done) {
  cacheClear(key)
  writeValue(key, JSON.stringify(value), done)
}

export {readValue, writeValue, removeValue}
