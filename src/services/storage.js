import storage from "@system.storage"

function readValue(key) {
  return new Promise(resolve => {
    storage.get({
      key,
      success(data) {
        resolve(data)
      },
      fail() {
        resolve("")
      }
    })
  })
}

function writeValue(key, value) {
  return new Promise(resolve => {
    storage.set({
      key,
      value,
      success() {
        resolve(true)
      },
      fail() {
        resolve(false)
      }
    })
  })
}

function removeValue(key) {
  return new Promise(resolve => {
    storage.delete({
      key,
      success() {
        resolve(true)
      },
      fail() {
        resolve(false)
      }
    })
  })
}

export async function getJson(key, fallback) {
  const value = await readValue(key)

  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value)
  } catch (error) {
    console.error("storage parse error", error)
    await writeJson(key, fallback)
    return fallback
  }
}

export function writeJson(key, value) {
  return writeValue(key, JSON.stringify(value))
}

export {readValue, writeValue, removeValue}
