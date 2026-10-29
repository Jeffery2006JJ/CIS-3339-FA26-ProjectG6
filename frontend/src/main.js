import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import router from './router'
import App from './App.vue'
import './index.css'
import { setUnauthorizedHandler } from './api/api'
import { useLoggedInUserStore } from './store/loggedInUser'

const app = createApp(App)

// Pinia (stores can use the router through this.$router)
const pinia = createPinia()
pinia.use(({ store }) => {
  store.$router = markRaw(router)
})
app.use(pinia)

app.use(Toast, { position: 'bottom-right' })

// F4: rebuild the session from a saved token BEFORE the router runs its first
// navigation, so a refresh on a protected page doesn't bounce to /login.
const userStore = useLoggedInUserStore()
userStore.restoreSession()

// F2: any 401 from the API clears the session and sends the user to /login.
setUnauthorizedHandler(() => {
  const wasLoggedIn = userStore.isLoggedIn
  userStore.$reset()
  const current = router.currentRoute.value
  if (current.name !== 'login') {
    router.push({ path: '/login', query: wasLoggedIn ? { redirect: current.fullPath } : {} })
  }
})

app.use(router)
app.mount('#app')
