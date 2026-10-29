// Where the backend API lives.
//
// 1. Runtime override: public/config.js can set window.__APP_CONFIG__.ROOT_API.
//    That file is copied as-is into dist/, so a deployed build can be pointed
//    at a different backend by editing dist/config.js - no rebuild needed.
// 2. Build-time value: VITE_ROOT_API from frontend/.env (or the host's env vars).
export function getApiBaseUrl() {
  const runtime = typeof window !== 'undefined' ? window.__APP_CONFIG__?.ROOT_API : ''
  const url = runtime || import.meta.env.VITE_ROOT_API

  if (!url) {
    console.warn('VITE_ROOT_API is not set - API calls will go to the same origin as the frontend.')
    return ''
  }
  // strip a trailing slash so "/clients" joins cleanly
  return url.replace(/\/+$/, '')
}
