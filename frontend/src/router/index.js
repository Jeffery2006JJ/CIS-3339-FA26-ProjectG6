import { createRouter, createWebHistory } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useLoggedInUserStore } from '../store/loggedInUser'

// Route meta:
//   requiresAuth   - must be logged in
//   requiresEditor - must be logged in AND have the "editor" role (F4)
// Paths and names are lowercase; component file names must match exactly
// (Mac/Linux file systems are case-sensitive).
const routes = [
  {
    path: '/',
    name: 'home',
    meta: { requiresAuth: true },
    component: () => import('../views/home.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login.vue')
  },
  {
    path: '/clientform',
    name: 'clientform',
    meta: { requiresAuth: true, requiresEditor: true },
    component: () => import('../views/clientform.vue')
  },
  {
    path: '/findclient',
    name: 'findclient',
    meta: { requiresAuth: true },
    component: () => import('../views/findclient.vue')
  },
  {
    path: '/clientdetails/:id',
    name: 'clientdetails',
    meta: { requiresAuth: true },
    component: () => import('../views/clientdetails.vue')
  },
  {
    path: '/eventform',
    name: 'eventform',
    meta: { requiresAuth: true, requiresEditor: true },
    component: () => import('../views/eventform.vue')
  },
  {
    path: '/findevents',
    name: 'findevents',
    meta: { requiresAuth: true },
    component: () => import('../views/findevents.vue')
  },
  {
    path: '/eventdetails/:id',
    name: 'eventdetails',
    meta: { requiresAuth: true },
    component: () => import('../views/eventDetails.vue')
  },
  {
    path: '/serviceform',
    name: 'serviceform',
    meta: { requiresAuth: true, requiresEditor: true },
    component: () => import('../views/serviceform.vue')
  },
  {
    path: '/findservice',
    name: 'findservice',
    meta: { requiresAuth: true },
    component: () => import('../views/findservice.vue')
  },
  {
    path: '/servicedetails/:id',
    name: 'servicedetails',
    meta: { requiresAuth: true },
    component: () => import('../views/servicedetails.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import('../views/notfound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// One global guard for login and editor-only routes.
router.beforeEach((to) => {
  const store = useLoggedInUserStore()
  const loggedIn = store.ensureValidSession()

  if (to.meta.requiresAuth && !loggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresEditor && !store.isEditor) {
    useToast().warning('Only editors can open that page.')
    return { path: '/' }
  }

  // already logged in - no reason to show the login form
  if (to.name === 'login' && loggedIn) {
    return { path: '/' }
  }
})

export default router
