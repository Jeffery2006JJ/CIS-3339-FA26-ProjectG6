// Mock API for Sprint 2 frontend development.
//
//   cd frontend
//   npm run mock          -> http://localhost:3000
//
// No database and no npm packages needed (plain Node.js). It answers the same
// URLs as the real Express backend and follows the API contract our team
// agreed for Sprint 3, so swapping to the real backend later only means
// pointing VITE_ROOT_API at it:
//   - JWT payload: { name, role, orgId, exp }  (12 hour expiry)
//   - no/invalid token -> 401, viewer changing data -> 403
//   - records from another organization -> 404 (never leaked)
//   - errors always look like { "error": "message" }
//   - register twice -> 200 { message: "Already registered" }
//   - deregister someone not registered -> 200 { message: "Not registered" }
//
// Demo accounts:  admin / admin (editor)   user / user (viewer)
//                 other / other (editor in a SECOND org, for isolation tests)
//
// Handy options (environment variables):
//   MOCK_PORT=3000      port to listen on
//   MOCK_DELAY=800      add a delay (ms) to every response, to see loading states
//   CORS_ORIGIN=...     allowed frontend origin(s), comma separated
//
// NOTE: tokens are NOT cryptographically signed. This is a development mock only.

const http = require('http')
const { URL } = require('url')
const crypto = require('crypto')

const PORT = Number(process.env.MOCK_PORT || 3000)
const DELAY = Number(process.env.MOCK_DELAY || 0)
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((o) => o.trim())

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
const ORG_A = 'org_a_000000000000000001'
const ORG_B = 'org_b_000000000000000002'

const orgs = [
  { _id: ORG_A, name: 'Community Center (mock)' },
  { _id: ORG_B, name: 'Other Org (mock)' }
]

const users = [
  { username: 'admin', password: 'admin', role: 'editor', org: ORG_A },
  { username: 'user', password: 'user', role: 'viewer', org: ORG_A },
  { username: 'other', password: 'other', role: 'editor', org: ORG_B }
]

let idCounter = 1000
const newId = () => (idCounter++).toString(16).padStart(24, '0')

const firstNames = ['Maria', 'James', 'Linh', 'Carlos', 'Aisha', 'David', 'Sofia', 'Michael', 'Priya', 'Jamal', 'Elena', 'Kevin', 'Grace', 'Luis', 'Hannah', 'Omar', 'Chloe', 'Andre']
const lastNames = ['Garcia', 'Nguyen', 'Smith', 'Hernandez', 'Khan', 'Johnson', 'Lopez', 'Brown', 'Patel', 'Williams', 'Martinez', 'Lee', 'Davis', 'Rodriguez', 'Wilson', 'Ali', 'Moore', 'Taylor']
const cities = ['Houston', 'Pasadena', 'Sugar Land', 'Katy', 'Pearland', 'Baytown']
const zips = ['77002', '77004', '77023', '77036', '77401', '77494']

const clients = firstNames.map((first, i) => ({
  _id: newId(),
  firstName: first,
  middleName: '',
  lastName: lastNames[i],
  email: `${first.toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`,
  phoneNumber: { primary: `71355501${String(i).padStart(2, '0')}`, alternate: '' },
  address: {
    line1: `${100 + i * 7} Main St`,
    line2: '',
    city: cities[i % cities.length],
    county: 'Harris',
    zip: zips[i % zips.length]
  },
  orgs: [ORG_A]
}))
// one client in the other org (isolation test)
clients.push({
  _id: newId(),
  firstName: 'Secret',
  middleName: '',
  lastName: 'OtherOrg',
  email: 'secret@other.example.com',
  phoneNumber: { primary: '2815550000', alternate: '' },
  address: { line1: '1 Hidden Way', line2: '', city: 'Austin', county: 'Travis', zip: '78701' },
  orgs: [ORG_B]
})

const serviceNames = [
  ['Family Planning', 'Counseling and resources for family planning.'],
  ['Adult Education', 'GED preparation and literacy classes.'],
  ['Youth Services', 'After-school tutoring and mentoring.'],
  ['Early Childhood Education', 'Pre-K readiness programs.'],
  ['Health Screening', 'Blood pressure and glucose checks.'],
  ['Food Pantry', 'Weekly grocery distribution.'],
  ['Job Readiness', 'Resume help and interview practice.'],
  ['Legal Aid', 'Free consultations with volunteer attorneys.'],
  ['Mental Health Support', 'Peer support groups.'],
  ['Vaccination Clinic', 'Seasonal flu and routine vaccines.'],
  ['Senior Services', 'Wellness checks for older adults.'],
  ['ESL Classes', 'English as a second language.'],
  ['Housing Assistance', 'Rental assistance referrals.'],
  ['Tax Preparation', 'Free tax filing help.'],
  ['Dental Screening', 'Basic dental checkups.'],
  ['Transportation Vouchers', 'Bus passes for appointments.']
]
const services = serviceNames.map(([name, description], i) => ({
  _id: newId(),
  name,
  description,
  status: i % 6 === 5 ? 'Inactive' : 'Active',
  org: ORG_A
}))
services.push({ _id: newId(), name: 'Other Org Service', description: 'Belongs to org B', status: 'Active', org: ORG_B })

const DAY = 24 * 60 * 60 * 1000
const dayAt = (offsetDays) => {
  const d = new Date(Date.now() + offsetDays * DAY)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString()
}
const eventNames = ['Health Fair', 'Back to School Drive', 'Food Distribution', 'Job Fair', 'Flu Shot Clinic', 'Legal Aid Day', 'Senior Lunch', 'Tax Help Night', 'ESL Kickoff', 'Family Fun Day', 'Housing Workshop', 'Dental Day', 'Youth Mentoring', 'Wellness Walk', 'Holiday Toy Drive', 'Community Meeting']
const events = eventNames.map((name, i) => ({
  _id: newId(),
  name,
  description: `${name} hosted by the community center.`,
  date: dayAt(-55 + i * 7), // spread from ~2 months ago into the future
  services: [services[i % 15]._id, services[(i + 3) % 15]._id],
  address: { line1: `${200 + i} Community Blvd`, line2: '', city: cities[i % cities.length], county: 'Harris', zip: zips[i % zips.length] },
  attendees: clients.slice(0, i % 7).map((c) => c._id),
  org: ORG_A
}))
events.push({
  _id: newId(),
  name: 'Other Org Event',
  description: 'Belongs to org B',
  date: dayAt(-3),
  services: [],
  address: { line1: '9 Elsewhere', line2: '', city: 'Austin', county: 'Travis', zip: '78701' },
  attendees: [clients[clients.length - 1]._id],
  org: ORG_B
})

// ---------------------------------------------------------------------------
// Tokens (unsigned JWT-shaped strings so the frontend can decode them)
// ---------------------------------------------------------------------------
const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')

function makeToken(user) {
  const now = Math.floor(Date.now() / 1000)
  const payload = { name: user.username, role: user.role, orgId: user.org, iat: now, exp: now + 12 * 60 * 60 }
  const sig = crypto.createHash('sha256').update(b64url(payload) + 'mock-secret').digest('base64url')
  return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.${sig}`
}

function readToken(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  const [, payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = crypto.createHash('sha256').update(payload + 'mock-secret').digest('base64url')
  if (sig !== expected) return null
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (decoded.exp * 1000 <= Date.now()) return null
    return decoded
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Tiny router
// ---------------------------------------------------------------------------
class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const routes = []
function route(method, pattern, opts, handler) {
  const keys = []
  const regex = new RegExp(
    '^' + pattern.replace(/\/+$/, '').replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$'
  )
  routes.push({ method, regex, keys, opts, handler })
}

// requireAuth / requireRole('editor') equivalents
function authorize(req, opts) {
  if (!opts.auth) return null
  const user = readToken(req)
  if (!user) throw new HttpError(401, 'Authentication required')
  if (opts.editor && user.role !== 'editor') throw new HttpError(403, 'Editor role required')
  return user
}

// withOrg equivalents: only ever see your own org's records
const clientInOrg = (c, org) => c.orgs.includes(org)
const findClient = (id, org) => {
  const c = clients.find((x) => x._id === id && clientInOrg(x, org))
  if (!c) throw new HttpError(404, 'Client not found')
  return c
}
const findEvent = (id, org) => {
  const e = events.find((x) => x._id === id && x.org === org)
  if (!e) throw new HttpError(404, 'Event not found')
  return e
}
const findService = (id, org) => {
  const s = services.find((x) => x._id === id && x.org === org)
  if (!s) throw new HttpError(404, 'Service not found')
  return s
}
const contains = (value, term) => String(value || '').toLowerCase().includes(String(term || '').toLowerCase())
const pick = (obj, fields) => Object.fromEntries(fields.filter((f) => f in obj).map((f) => [f, obj[f]]))

// ----- org -----
route('GET', '/org', {}, () => orgs[0].name)

// ----- health -----
route('GET', '/health', {}, () => ({ status: 'ok', db: 'mock' }))

// ----- users -----
route('POST', '/users/login', {}, ({ body }) => {
  const user = users.find((u) => u.username === body.username && u.password === body.password)
  // same message for wrong username and wrong password (S1)
  if (!user) throw new HttpError(401, 'Invalid username or password')
  return { token: makeToken(user) }
})

// ----- clients -----
route('GET', '/clients', { auth: true }, ({ user }) => clients.filter((c) => clientInOrg(c, user.orgId)))

route('GET', '/clients/id/:id', { auth: true }, ({ user, params }) => findClient(params.id, user.orgId))

route('GET', '/clients/search', { auth: true }, ({ user, query }) => {
  const mine = clients.filter((c) => clientInOrg(c, user.orgId))
  if (query.searchBy === 'name') {
    return mine.filter((c) => contains(c.firstName, query.firstName) && contains(c.lastName, query.lastName))
  }
  if (query.searchBy === 'number') return mine.filter((c) => contains(c.phoneNumber.primary, query.phoneNumber))
  throw new HttpError(400, 'Invalid searchBy')
})

route('GET', '/clients/byzip', { auth: true }, ({ user }) => {
  const counts = {}
  clients.filter((c) => clientInOrg(c, user.orgId)).forEach((c) => {
    const zip = c.address?.zip || 'Unknown'
    counts[zip] = (counts[zip] || 0) + 1
  })
  return Object.entries(counts).map(([_id, count]) => ({ _id, count }))
})

function validateClient(body) {
  if (!body.firstName || !body.lastName) throw new HttpError(400, 'First and last name are required')
  if (!body.phoneNumber?.primary) throw new HttpError(400, 'Primary phone number is required')
}
const clientFields = ['firstName', 'middleName', 'lastName', 'email', 'phoneNumber', 'address']

route('POST', '/clients', { auth: true, editor: true }, ({ user, body }) => {
  validateClient(body)
  clients.push({ _id: newId(), ...pick(body, clientFields), orgs: [user.orgId] })
  return 'New client created successfully'
})

route('PUT', '/clients/update/:id', { auth: true, editor: true }, ({ user, params, body }) => {
  const c = findClient(params.id, user.orgId)
  validateClient({ ...c, ...body })
  Object.assign(c, pick(body, clientFields))
  return 'Client updated successfully'
})

route('DELETE', '/clients/:id', { auth: true, editor: true }, ({ user, params }) => {
  const c = findClient(params.id, user.orgId)
  if (events.some((e) => e.attendees.includes(c._id))) {
    throw new HttpError(406, "Client is signed up for events and can't be deleted.")
  }
  clients.splice(clients.indexOf(c), 1)
  return 'Client deleted successfully'
})

// ----- events -----
const myEvents = (org) => events.filter((e) => e.org === org)

route('GET', '/events', { auth: true }, ({ user }) => myEvents(user.orgId))

route('GET', '/events/id/:id', { auth: true }, ({ user, params }) => findEvent(params.id, user.orgId))

route('GET', '/events/search', { auth: true }, ({ user, query }) => {
  if (query.searchBy === 'name') return myEvents(user.orgId).filter((e) => contains(e.name, query.name))
  if (query.searchBy === 'date') return myEvents(user.orgId).filter((e) => e.date.startsWith(query.eventDate))
  throw new HttpError(400, 'Invalid searchBy')
})

route('GET', '/events/client/:id', { auth: true }, ({ user, params }) =>
  myEvents(user.orgId).filter((e) => e.attendees.includes(params.id))
)

route('GET', '/events/client/:id/not-registered', { auth: true }, ({ user, params }) =>
  myEvents(user.orgId).filter((e) => !e.attendees.includes(params.id))
)

route('GET', '/events/attendees/:id', { auth: true }, ({ user, params }) => {
  const e = findEvent(params.id, user.orgId)
  return clients.filter((c) => e.attendees.includes(c._id) && clientInOrg(c, user.orgId))
})

route('GET', '/events/service/:id', { auth: true }, ({ user, params }) =>
  myEvents(user.orgId).filter((e) => e.services.includes(params.id))
)

route('GET', '/events/attendance', { auth: true }, ({ user }) => {
  const twoMonthsAgo = Date.now() - 60 * DAY
  return myEvents(user.orgId)
    .filter((e) => new Date(e.date).getTime() >= twoMonthsAgo && new Date(e.date).getTime() <= Date.now())
    .sort((a, b) => a.date.localeCompare(b.date))
})

const eventFields = ['name', 'description', 'date', 'services', 'address']
function validateEvent(body) {
  if (!body.name) throw new HttpError(400, 'Event name is required')
  if (!body.date || isNaN(new Date(body.date))) throw new HttpError(400, 'A valid event date is required')
}

route('POST', '/events', { auth: true, editor: true }, ({ user, body }) => {
  validateEvent(body)
  events.push({
    _id: newId(),
    ...pick(body, eventFields),
    date: new Date(body.date).toISOString(),
    services: body.services || [],
    attendees: [],
    org: user.orgId
  })
  return 'New event created successfully'
})

route('PUT', '/events/update/:id', { auth: true, editor: true }, ({ user, params, body }) => {
  const e = findEvent(params.id, user.orgId)
  validateEvent({ ...e, ...body })
  Object.assign(e, pick(body, eventFields))
  e.date = new Date(e.date).toISOString()
  return 'Event updated successfully'
})

// B1 rules
route('PUT', '/events/register', { auth: true, editor: true }, ({ user, query }) => {
  const e = findEvent(query.event, user.orgId)
  const c = findClient(query.client, user.orgId)
  if (e.attendees.includes(c._id)) return { message: 'Already registered' }
  e.attendees.push(c._id)
  return e
})

route('PUT', '/events/deregister', { auth: true, editor: true }, ({ user, query }) => {
  const e = findEvent(query.event, user.orgId)
  const c = findClient(query.client, user.orgId)
  if (!e.attendees.includes(c._id)) return { message: 'Not registered' }
  e.attendees = e.attendees.filter((id) => id !== c._id)
  return e
})

route('DELETE', '/events/:id', { auth: true, editor: true }, ({ user, params }) => {
  const e = findEvent(params.id, user.orgId)
  if (e.attendees.length) throw new HttpError(400, "Event has attendees and can't be deleted.")
  events.splice(events.indexOf(e), 1)
  return 'Event deleted successfully'
})

// ----- services -----
const myServices = (org) => services.filter((s) => s.org === org)

route('GET', '/services', { auth: true }, ({ user }) => myServices(user.orgId))

route('GET', '/services/id/:id', { auth: true }, ({ user, params }) => findService(params.id, user.orgId))

route('GET', '/services/search', { auth: true }, ({ user, query }) => {
  if (query.searchBy === 'name') return myServices(user.orgId).filter((s) => contains(s.name, query.name))
  if (query.searchBy === 'description') {
    return myServices(user.orgId).filter((s) => contains(s.description, query.description))
  }
  throw new HttpError(400, 'Invalid searchBy')
})

const serviceFields = ['name', 'description', 'status']
route('POST', '/services', { auth: true, editor: true }, ({ user, body }) => {
  if (!body.name) throw new HttpError(400, 'Service name is required')
  services.push({ _id: newId(), ...pick(body, serviceFields), status: body.status || 'Active', org: user.orgId })
  return 'New service created successfully'
})

route('PUT', '/services/update/:id', { auth: true, editor: true }, ({ user, params, body }) => {
  const s = findService(params.id, user.orgId)
  if ('name' in body && !body.name) throw new HttpError(400, 'Service name is required')
  Object.assign(s, pick(body, serviceFields))
  return 'Service updated successfully'
})

route('DELETE', '/services/:id', { auth: true, editor: true }, ({ user, params }) => {
  const s = findService(params.id, user.orgId)
  if (events.some((e) => e.services.includes(s._id))) {
    throw new HttpError(400, "Service is used by events and can't be deleted.")
  }
  services.splice(services.indexOf(s), 1)
  return 'Service deleted successfully'
})

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
function send(res, status, data) {
  if (typeof data === 'string') {
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(data)
  } else {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve(null)
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  if (DELAY) await new Promise((r) => setTimeout(r, DELAY))

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname.replace(/\/+$/, '') || '/'
  const started = Date.now()

  try {
    const match = routes
      .map((r) => ({ r, m: r.method === req.method && path.match(r.regex) }))
      .find((x) => x.m)
    if (!match) throw new HttpError(404, `No route for ${req.method} ${path}`)

    const user = authorize(req, match.r.opts)
    const params = Object.fromEntries(match.r.keys.map((k, i) => [k, decodeURIComponent(match.m[i + 1])]))
    const body = ['POST', 'PUT'].includes(req.method) ? await readBody(req) : {}
    if (body === null) throw new HttpError(400, 'Request body must be valid JSON')

    const result = match.r.handler({ user, params, query: Object.fromEntries(url.searchParams), body })
    send(res, 200, result)
    console.log(`${req.method} ${req.url} 200 ${Date.now() - started}ms`)
  } catch (err) {
    const status = err.status || 500
    // B2 shape: always { error }, never a stack trace
    send(res, status, { error: status === 500 ? 'Internal server error' : err.message })
    console.log(`${req.method} ${req.url} ${status} ${err.message}`)
  }
})

server.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`)
  console.log('Logins: admin/admin (editor), user/user (viewer), other/other (editor, second org)')
  if (DELAY) console.log(`Adding ${DELAY}ms delay to every response`)
})
