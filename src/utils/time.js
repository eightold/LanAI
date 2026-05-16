function pad(value) {
  return value < 10 ? `0${value}` : `${value}`
}

export function now() {
  return Date.now()
}

export function formatTime(timestamp) {
  if (!timestamp) {
    return "--:--"
  }

  const date = new Date(timestamp)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}
