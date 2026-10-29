// All calls to the backend REST API go through this file.
//
// Error handling lives in ONE place: the response interceptor below. It turns
// every failed request into a plain Error whose `message` is a short,
// human-readable string, so components never have to translate errors.
import axios from 'axios'
import { getApiBaseUrl } from '../config'

const TOKEN_KEY = 'authToken'

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
})

// ---------------------------------------------------------------------------
// Auth header + token storage
// ---------------------------------------------------------------------------
export function setAuthHeader(token) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function removeAuthHeader() {
  delete apiClient.defaults.headers.common['Authorization']
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function storeToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // storage unavailable (private mode etc.) - session just won't survive a refresh
  }
}

export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Centralized error handling (F2)
// ---------------------------------------------------------------------------

// main.js registers what should happen on a 401 (clear Pinia session + go to
// /login). Registering it from outside avoids a circular import between this
// file, the Pinia store and the router.
let onUnauthorized = () => {}
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

// Pull a readable message out of whatever the server sent back.
// Handles: plain-text bodies, { error }, { message }, and express-validator's { errors: [{ msg }] }.
export function toErrorMessage(error) {
  if (!error.response) {
    return 'Unable to reach the server'
  }
  const { status, data } = error.response
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string') return data.error
    if (typeof data.message === 'string') return data.message
    if (Array.isArray(data.errors) && data.errors[0]?.msg) return data.errors[0].msg
  }
  return `Request failed (${status})`
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isLoginRequest = error.config?.url?.includes('/users/login')

    // Expired/invalid token: wipe the session and send the user to /login.
    // (A failed login attempt is not a session problem, so it is excluded.)
    if (status === 401 && !isLoginRequest) {
      clearStoredToken()
      removeAuthHeader()
      onUnauthorized()
    }

    const appError = new Error(toErrorMessage(error))
    appError.status = status ?? null
    return Promise.reject(appError)
  }
)

// Success responses from the API are sometimes plain text ("Client updated
// successfully") and sometimes JSON ({ message: "Already registered" }).
// This gives components one readable string for a toast.
export function messageFrom(data, fallback = 'Done') {
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data.message === 'string') return data.message
  return fallback
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export async function loginUser(username, password) {
  const response = await apiClient.post('/users/login', { username, password })
  return response.data.token
}

// ---------------------------------------------------------------------------
// Org
// ---------------------------------------------------------------------------
export const getOrgName = async () => (await apiClient.get('/org')).data

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export const getEvents = async () => (await apiClient.get('/events/')).data

export const getEventById = async (id) => (await apiClient.get(`/events/id/${id}`)).data

export const searchEvents = async (query) => {
  const params = { searchBy: query.searchBy }
  if (query.searchBy === 'name') params.name = query.name || ''
  if (query.searchBy === 'date') params.eventDate = query.eventDate || ''
  return (await apiClient.get('/events/search', { params })).data
}

// events a client is registered for
export const getClientEvents = async (id) => (await apiClient.get(`/events/client/${id}`)).data

// events a client is NOT registered for
export const getNonClientEvents = async (id) =>
  (await apiClient.get(`/events/client/${id}/not-registered`)).data

export const getEventAttendees = async (id) => (await apiClient.get(`/events/attendees/${id}`)).data

export const getEventsByServiceId = async (id) => (await apiClient.get(`/events/service/${id}`)).data

export const createEvent = async (eventData) => (await apiClient.post('/events/', eventData)).data

export const updateEvent = async (id, eventData) =>
  (await apiClient.put(`/events/update/${id}`, eventData)).data

export const registerAttendee = async (eventId, clientId) =>
  (await apiClient.put('/events/register', {}, { params: { event: eventId, client: clientId } })).data

export const deregisterAttendee = async (eventId, clientId) =>
  (await apiClient.put('/events/deregister', {}, { params: { event: eventId, client: clientId } })).data

export const deleteEvent = async (id) => (await apiClient.delete(`/events/${id}`)).data

// events from the last two months, for the dashboard
export const getAttendance = async () => (await apiClient.get('/events/attendance')).data

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
export const getClients = async () => (await apiClient.get('/clients')).data

export const getClientById = async (id) => (await apiClient.get(`/clients/id/${id}`)).data

export const searchClients = async (query) => {
  const params = { searchBy: query.searchBy }
  if (query.searchBy === 'name') {
    params.firstName = query.firstName || ''
    params.lastName = query.lastName || ''
  } else if (query.searchBy === 'number') {
    params.phoneNumber = query.phoneNumber || ''
  }
  return (await apiClient.get('/clients/search', { params })).data
}

export const createClient = async (newClient) => (await apiClient.post('/clients', newClient)).data

export const updateClient = async (id, updatedClient) =>
  (await apiClient.put(`/clients/update/${id}`, updatedClient)).data

export const deleteClientbyId = async (id) => (await apiClient.delete(`/clients/${id}`)).data

// client counts by zip code, for the dashboard
export const getClientsByZipCode = async () => (await apiClient.get('/clients/byzip')).data

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export const getServices = async () => (await apiClient.get('/services/')).data

export const getServiceById = async (id) => (await apiClient.get(`/services/id/${id}`)).data

export const searchServices = async (query) => {
  const params = { searchBy: query.searchBy }
  if (query.searchBy === 'name') params.name = query.name || ''
  if (query.searchBy === 'description') params.description = query.description || ''
  return (await apiClient.get('/services/search', { params })).data
}

export const createService = async (newService) => (await apiClient.post('/services', newService)).data

export const updateService = async (id, updatedService) =>
  (await apiClient.put(`/services/update/${id}`, updatedService)).data

export const deleteService = async (id) => (await apiClient.delete(`/services/${id}`)).data
