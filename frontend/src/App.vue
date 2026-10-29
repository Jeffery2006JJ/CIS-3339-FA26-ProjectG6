<!-- Main layout: navigation sidebar + org name header + the current page. -->
<template>
  <main class="flex flex-row">
    <div id="_container" class="min-h-screen">
      <header class="w-full">
        <section class="text-center">
          <img class="m-auto" src="./assets/DanPersona.svg" alt="Data Platform logo" />
        </section>
        <!-- Navigation bar -->
        <nav class="mt-10" aria-label="Main navigation">
          <ul class="flex flex-col gap-4">
            <li v-if="user.isLoggedIn">
              <router-link to="/">
                <span class="material-icons nav-icon" aria-hidden="true">dashboard</span>
                Dashboard
              </router-link>
            </li>
            <!-- Login link only when logged out -->
            <li v-if="!user.isLoggedIn">
              <router-link to="/login">
                <span class="material-icons nav-icon" aria-hidden="true">login</span>
                Login
              </router-link>
            </li>
            <!-- Logout only when logged in -->
            <li v-if="user.isLoggedIn">
              <button type="button" class="logout-button" @click="user.logout()">
                <span class="material-icons nav-icon" aria-hidden="true">logout</span>
                Logout
              </button>
            </li>
            <!-- Editor-only links -->
            <template v-if="user.isEditor">
              <li>
                <router-link to="/clientform">
                  <span class="material-icons nav-icon" aria-hidden="true">people</span>
                  Client Intake Form
                </router-link>
              </li>
              <li>
                <router-link to="/eventform">
                  <span class="material-icons nav-icon" aria-hidden="true">event</span>
                  Create Event
                </router-link>
              </li>
              <li>
                <router-link to="/serviceform">
                  <span class="material-icons nav-icon" aria-hidden="true">volunteer_activism</span>
                  Create Service
                </router-link>
              </li>
            </template>
            <!-- Links for any logged-in user -->
            <template v-if="user.isLoggedIn">
              <li>
                <router-link to="/findclient">
                  <span class="material-icons nav-icon" aria-hidden="true">search</span>
                  Find Client
                </router-link>
              </li>
              <li>
                <router-link to="/findevents">
                  <span class="material-icons nav-icon" aria-hidden="true">search</span>
                  Find Event
                </router-link>
              </li>
              <li>
                <router-link to="/findservice">
                  <span class="material-icons nav-icon" aria-hidden="true">search</span>
                  Find Service
                </router-link>
              </li>
            </template>
          </ul>
        </nav>
        <!-- Who is logged in -->
        <p v-if="user.isLoggedIn" class="mt-10 text-sm opacity-90">
          Signed in as <strong>{{ user.name || 'user' }}</strong>
          <span class="block capitalize">({{ user.role || 'no role' }})</span>
        </p>
      </header>
    </div>
    <div class="grow w-4/5">
      <!-- Organization name header -->
      <section
        class="justify-end items-center h-24 flex"
        style="background: linear-gradient(250deg, #c8102e 70%, #efecec 50.6%)"
      >
        <h1 class="mr-20 text-3xl text-white">{{ orgName }}</h1>
      </section>
      <!-- Page content -->
      <div>
        <router-view />
      </div>
    </div>
  </main>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - setup() { return { user } } + the old data option { orgName } -> top-level store + ref('Dataplatform')
// - [old created hook] { this.orgName = await getOrgName() } -> onMounted()
// - BUG FIXED: the old catch block did `throw (error)` with no `error` variable defined
// - REMOVED: methods.logout() used this.$store.dispatch(...) - leftover Vuex code
//   in a Pinia app that was never called. The nav calls user.logout() directly.
// - Role checks use the store's isEditor getter (allowlist) instead of role === 'editor' inline
// - FIX: logo path used Windows backslashes (@\assets\...) which breaks on Mac/Linux;
//   now "./assets/DanPersona.svg" with alt text
// - Logout is now a <button> (keyboard accessible) instead of a clickable <li>
import { ref, onMounted } from 'vue'
import { useLoggedInUserStore } from './store/loggedInUser'
import { getOrgName } from './api/api'

const user = useLoggedInUserStore()
const orgName = ref('Dataplatform')

onMounted(async () => {
  try {
    const name = await getOrgName()
    if (typeof name === 'string' && name) orgName.value = name
  } catch {
    // the header just keeps its default title if the backend is unreachable
  }
})
</script>

<style scoped>
#_container {
  background-color: #c30020;
  color: white;
  padding: 18px;
}
.nav-icon {
  position: relative;
  top: 6px;
}
.logout-button {
  padding: 0;
  color: inherit;
  background: none;
  cursor: pointer;
}
</style>
