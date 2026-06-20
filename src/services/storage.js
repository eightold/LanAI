import storage from "@system.storage"

/**
 * 内存缓存
 */
var _cache = {}

/**
 * 正在加载中的请求
 * {
 *   key: [callback1, callback2]
 * }
 */
var _loading = {}

/**
 * 深拷贝
 */
function clone(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (e) {
    return value
  }
}

function cacheGet(key) {
  return _cache[key]
}

function cacheSet(key, value) {
  _cache[key] = value
}

function cacheClear(key) {
  delete _cache[key]
}

/**
 * 读取原始字符串
 */
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

/**
 * 写入原始字符串
 */
function writeValue(key, value, done) {
  storage.set({
    key: key,
    value: value,

    success: function() {
      done && done(true)
    },

    fail: function() {
      done && done(false)
    }
  })
}

/**
 * 删除数据
 */
function removeValue(key, done) {
  cacheClear(key)

  var deleteApi = storage.delete || storage.remove

  if (!deleteApi) {
    done && done(false)
    return
  }

  deleteApi({
    key: key,

    success: function() {
      done && done(true)
    },

    fail: function() {
      done && done(false)
    }
  })
}

/**
 * 通知所有等待中的回调
 */
function notifyAll(key, value) {
  var callbacks = _loading[key] || []

  delete _loading[key]

  callbacks.forEach(function(cb) {
    cb(clone(value))
  })
}

/**
 * 读取 JSON
 */
export function getJson(key, fallback, done) {
  var cached = cacheGet(key)

  // 命中缓存
  if (cached !== undefined) {
    setTimeout(function() {
      done(clone(cached))
    }, 0)
    return
  }

  // 已经有人在读取
  if (_loading[key]) {
    _loading[key].push(done)
    return
  }

  _loading[key] = [done]

  readValue(key, function(value) {
    var result

    if (!value) {
      result = clone(fallback)

      cacheSet(key, result)

      notifyAll(key, result)
      return
    }

    try {
      result = JSON.parse(value)

      cacheSet(key, result)

      notifyAll(key, result)
    } catch (error) {
      console.error(
        "storage parse error for key: " + key,
        error
      )

      result = clone(fallback)

      writeJson(key, result, function() {
        notifyAll(key, result)
      })
    }
  })
}

/**
 * 写入 JSON
 */
export function writeJson(key, value, done) {
  var cacheValue = clone(value)

  writeValue(
    key,
    JSON.stringify(cacheValue),

    function(success) {
      if (success) {
        cacheSet(key, cacheValue)
      } else {
        cacheClear(key)
      }

      done && done(success)
    }
  )
}

/**
 * Promise版本（可选）
 */
export function getJsonAsync(key, fallback) {
  return new Promise(function(resolve) {
    getJson(key, fallback, resolve)
  })
}

export function writeJsonAsync(key, value) {
  return new Promise(function(resolve) {
    writeJson(key, value, resolve)
  })
}

export {
  readValue,
  writeValue,
  removeValue
}