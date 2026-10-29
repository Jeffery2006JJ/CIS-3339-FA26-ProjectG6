// Formats an ISO date (as stored by the API) as MM/DD/YYYY.
// Uses UTC so a date saved as midnight UTC doesn't shift to the previous day.
export function formatDate(date) {
  if (!date) return ''
  const isoDate = new Date(date)
  if (isNaN(isoDate)) return ''
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

// ISO date -> "YYYY-MM-DD" for <input type="date">
export function toDateInputValue(date) {
  if (!date) return ''
  const d = new Date(date)
  return isNaN(d) ? '' : d.toISOString().substring(0, 10)
}
