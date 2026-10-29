<!-- Shown for any URL that doesn't match a route. -->
<template>
  <main class="text-center mt-20">
    <h1 class="font-bold text-4xl text-red-700 tracking-widest">Page not found</h1>
    <p class="mt-6 text-gray-700">There's nothing at <code>{{ route.fullPath }}</code>.</p>
    <router-link to="/" class="inline-block mt-8 bg-red-700 text-white rounded p-2">Back to the dashboard</router-link>
  </main>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
