# Data Platform — CIS 3339 Fall 2026, Group 6

A MEVN (MongoDB, Express, Vue 3, Node.js) app that helps nonprofits and their Community Health
Workers manage clients, events, and services. Each instance serves one organization (`ORG_ID`),
and users can only see their own organization's data.

Built on a template from earlier CIS course students.

## Requirements

- Node.js 18 or newer
- The MongoDB connection in `backend/.env` (already committed)

## Setup

```bash
# backend
cd backend
npm install
npm run db:init   # creates the org, demo users, and sample data (safe to rerun)
npm start         # http://localhost:3000

# frontend (new terminal)
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Check the backend is running: `http://localhost:3000/health`

## Demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Viewer (read only) | `user` | `user` |
| Editor (full access) | `admin` | `admin` |

## Environment files

Both `.env` files are committed for grading only. They use a course-only database and will be
rotated after grading.

**backend/.env:** `MONGO_URL` (database), `PORT` (API port), `ORG_ID` (organization),
`JWT_SECRET` (signs login tokens), `CORS_ORIGIN` (allowed frontend URL), and the
`SEED_*` usernames and passwords used by `db:init`.

**frontend/.env:** `VITE_ROOT_API` (backend URL).

## Production build

```bash
cd frontend
npm run build     # outputs dist/
npm run preview   # serves it on http://localhost:4173
```

## Deployment

- **Frontend:** set `VITE_ROOT_API` to the backend URL, build, and upload `dist/`. The host must
  send all unknown paths to `index.html` (`public/_redirects` handles this on Netlify, Render,
  and Cloudflare Pages).
- **Backend:** set the `backend/.env` variables on the host, set `CORS_ORIGIN` to the frontend
  URL, and run `npm run db:init` once.

## Security

- Viewers can read; only editors can create, update, delete, or register (others get `403`).
- All data is filtered by the user's organization. Other organizations' records return `404`.
- Failed logins show the same message whether the username exists or not.

## Known limitations

- Login tokens are stored in `localStorage`.
- Table sorting and paging happen in the browser.
- Grading credentials are committed to the repo by course requirement.