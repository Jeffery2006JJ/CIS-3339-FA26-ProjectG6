// useApi - tracks loading / data / error for one API call (F2).
//
//   const { data, loading, error, execute } = useApi(() => api.getClients())
//
// - loading: true while the request is in flight
// - data:    the result on success (null until the first success)
// - error:   short readable message on failure, null otherwise
// - execute: runs the call (on mount, or again as a retry)
//
// Error messages come from the Axios interceptor in api.js - this composable
// does not translate errors itself.
import { ref } from 'vue'

export function useApi(apiCall) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // If execute() is called again before the previous call finishes (e.g. a
  // search typed quickly after "Clear"), only the newest response is kept.
  let latestCall = 0

  async function execute(...args) {
    const callId = ++latestCall
    loading.value = true
    error.value = null
    try {
      const result = await apiCall(...args)
      if (callId === latestCall) data.value = result
      return result
    } catch (err) {
      if (callId === latestCall) error.value = err?.message || 'Something went wrong'
      return undefined
    } finally {
      if (callId === latestCall) loading.value = false
    }
  }

  return { data, loading, error, execute }
}
