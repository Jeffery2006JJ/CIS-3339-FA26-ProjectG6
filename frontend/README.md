# Data Platform Frontend

Vue 3 (Composition API, `<script setup>`) + Vite + Tailwind CSS + Pinia + Vue Router.
Form validation uses [Vuelidate 2](https://vuelidate-next.netlify.app/).

## Requirements

- Node.js 18 or newer (tested with Node 20/22)

## Setup

```bash
cd frontend
npm install
```

### Environment (`frontend/.env`)

| Variable | What it does |
| --- | --- |
| `VITE_ROOT_API` | Base URL of the backend API, no trailing slash. Default `http://localhost:3000`. |

`VITE_ROOT_API` is read at **build time**. A deployed build can also be pointed at a
different backend without rebuilding by editing `dist/config.js`
(`window.__APP_CONFIG__.ROOT_API`), which overrides the build-time value.

## Run in development

You need a backend on `VITE_ROOT_API`: either the real Express backend (`cd backend && npm start`)
or the **mock API** that ships with the frontend:

```bash
# terminal 1 - mock API on http://localhost:3000 (no database needed)
npm run mock

# terminal 2 - Vite dev server on http://localhost:5173
npm run dev
```

Mock API logins:

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `admin` | editor (can create/update/delete/register) |
| `user` | `user` | viewer (read only) |
| `other` | `other` | editor in a second organization (for isolation testing) |

`MOCK_DELAY=1500 npm run mock` slows every response down so you can see the loading states.
Stop the mock API to see the error state + Retry button.

## Production build (D2)

```bash
npm run build      # outputs dist/
npm run preview    # serves dist/ on http://localhost:4173 (same as npm run serve)
```

### Deploying `dist/` to a static host

1. Set `VITE_ROOT_API` to the deployed backend URL (in `.env` or the host's build settings), then `npm run build`.
2. Publish the `dist/` folder.
3. **SPA fallback:** every unknown path must serve `index.html`, otherwise refreshing a page like
   `/clientdetails/123` returns 404.
   - Netlify / Render static site / Cloudflare Pages: handled by `public/_redirects` (copied into `dist/`).
   - Other hosts: add a rewrite rule `/* -> /index.html (200)`.
4. The backend's `CORS_ORIGIN` must be set to the deployed frontend's URL.

## Project structure

```text
src/
  api/api.js               Axios client + the ONE response interceptor (error messages, 401 -> /login)
  composables/useApi.js    { data, loading, error, execute } for any API call
  components/DataTable.vue reusable table: sorting (asc/desc/none) + 10 rows per page
  components/AsyncState.vue loading / error + Retry wrapper used by list views and dashboard
  store/loggedInUser.js    Pinia session store (restores the session from the saved JWT on refresh)
  router/index.js          routes; meta.requiresAuth and meta.requiresEditor + one global guard
  utils/formatDate.js      shared date formatting
  views/                   pages
mock-api/server.js         development mock of the backend API
```

## Sprint 2 checklist (how to verify)

- **F1** - no Options API left: `grep -rnE "data\(\)|methods:|export default" src --include=*.vue` returns nothing.
  Each component has a `MIGRATION NOTES` comment describing what was converted.
- **F2** - list pages and the dashboard show *Loading...*, a "no results" message, or an error with **Retry**.
  Stop the backend and reload a list: you get "Unable to reach the server", not a blank page.
- **F3** - Find Client / Find Event / Find Service all use `DataTable`. Click a header to sort
  (▲ / ▼ / unsorted). 10 rows per page with "Showing X-Y of Z".
- **F4** - log in, press F5: still logged in. Log in as `user` and type `/clientform` in the address bar:
  redirected to the dashboard. Corrupt `authToken` in DevTools > Application > Local Storage and refresh:
  clean logged-out state.
- **D2** - `npm run build` succeeds on Mac/Linux/Windows; `npm run preview` serves the build.
