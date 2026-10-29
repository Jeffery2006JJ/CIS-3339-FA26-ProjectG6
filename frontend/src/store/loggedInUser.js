// Pinia store for the logged-in user's session (F4).
//
// The JWT is the single source of truth: name, role and orgId are read from
// it. On app start, restoreSession() rebuilds the session from localStorage
// if the saved token is still valid, so a page refresh doesn't log you out.
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import jwt_decode from 'jwt-decode'
import {
  loginUser,
  setAuthHeader,
  removeAuthHeader,
  getStoredToken,
  storeToken,
  clearStoredToken
} from '../api/api'

const toast = useToast()

// Returns the decoded token, or null if it is missing, corrupted or expired.
function decodeValidToken(token) {
  if (!token) return null
  try {
    const decoded = jwt_decode(token)
    // exp is in seconds since epoch
    if (decoded.exp && decoded.exp * 1000 <= Date.now()) return null
    return decoded
  } catch {
    return null
  }
}

export const useLoggedInUserStore = defineStore('loggedInUser', {
  state: () => ({
    name: '',
    role: '',
    orgId: '',
    expiresAt: null, // ms timestamp, null if the token has no exp claim
    isLoggedIn: false
  }),

  getters: {
    // Allowlist: only the exact role "editor" may change data.
    isEditor: (state) => state.isLoggedIn && state.role === 'editor'
  },

  actions: {
    // Applies a token to the store, Axios and localStorage. Returns false if the token is unusable.
    startSession(token) {
      const decoded = decodeValidToken(token)
      if (!decoded) {
        this.clearSession()
        return false
      }
      storeToken(token)
      setAuthHeader(token)
      this.$patch({
        name: decoded.name || decoded.username || '',
        role: decoded.role || '',
        orgId: decoded.orgId || decoded.org || '',
        expiresAt: decoded.exp ? decoded.exp * 1000 : null,
        isLoggedIn: true
      })
      return true
    },

    // Called once in main.js before the router starts.
    restoreSession() {
      const token = getStoredToken()
      if (!token) return false
      return this.startSession(token)
    },

    // True if the session is still usable; logs out cleanly if the token expired while the tab was open.
    ensureValidSession() {
      if (!this.isLoggedIn) return false
      if (this.expiresAt && this.expiresAt <= Date.now()) {
        this.clearSession()
        toast.info('Your session expired. Please log in again.')
        return false
      }
      return true
    },

    // Wipes token, Axios header and Pinia state (no navigation).
    clearSession() {
      clearStoredToken()
      removeAuthHeader()
      this.$reset()
    },

    async login(username, password) {
      try {
        const token = await loginUser(username, password)
        if (!this.startSession(token)) {
          toast.error('Login failed: the server returned an invalid token')
          return
        }
        // go back to the page the user originally asked for, if any
        const redirect = this.$router.currentRoute.value.query.redirect
        const target = typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/'
        await this.$router.push(target)
        toast.success('Login successful!')
      } catch (error) {
        // message already made readable by the Axios interceptor
        toast.error(error.message)
      }
    },

    async logout() {
      this.clearSession()
      await this.$router.push('/login')
      toast.info('You have been logged out')
    }
  }
})
