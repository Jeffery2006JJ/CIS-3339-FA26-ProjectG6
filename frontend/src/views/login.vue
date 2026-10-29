<!-- Login view. Users log in with their username and password. -->
<template>
  <div>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Welcome</h1>
    <form novalidate @submit.prevent="submit">
      <div class="flex justify-center mt-10">
        <label>
          <span class="text-gray-700">Username</span>
          <span style="color: #ff0000">*</span>
          <input
            v-model.trim="username"
            type="text"
            autocomplete="username"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
      </div>
      <div class="flex justify-center mt-10">
        <label>
          <span class="text-gray-700">Password</span>
          <span style="color: #ff0000">*</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
      </div>
      <p v-if="formError" class="text-center text-red-600 mt-4">{{ formError }}</p>
      <div class="flex justify-center mt-10">
        <button class="bg-red-700 text-white rounded disabled:opacity-50" type="submit" :disabled="submitting">
          {{ submitting ? 'Logging in...' : 'Login' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - [old data option] { username, password } -> ref('')
// - setup() { return { store } } -> const store = useLoggedInUserStore() at the top level
// - @submit.prevent="store.login(username, password)" -> submit() function that also
//   checks for empty fields and disables the button while the request is running
import { ref } from 'vue'
import { useLoggedInUserStore } from '../store/loggedInUser'

const store = useLoggedInUserStore()
const username = ref('')
const password = ref('')
const submitting = ref(false)
const formError = ref('')

async function submit() {
  formError.value = ''
  if (!username.value || !password.value) {
    formError.value = 'Enter your username and password.'
    return
  }
  submitting.value = true
  try {
    await store.login(username.value, password.value)
  } finally {
    submitting.value = false
  }
}
</script>
