<!--
  AsyncState - shows the loading and error states for a useApi() call (F2).
  When the request has finished without an error, the default slot renders
  (the DataTable inside handles the "no results" case itself).

  <AsyncState :loading="loading" :error="error" :ready="data !== null" @retry="execute">
    <DataTable ... />
  </AsyncState>
-->
<template>
  <div>
    <!-- Loading -->
    <div v-if="showLoading" class="flex items-center justify-center gap-3 p-10 text-gray-500" role="status">
      <span class="spinner" aria-hidden="true"></span>
      <span class="text-lg animate-pulse">{{ loadingText }}</span>
    </div>

    <!-- Error + retry -->
    <div v-else-if="error" class="rounded border border-red-300 bg-red-50 p-6" role="alert">
      <p class="font-bold text-red-800">{{ errorTitle }}</p>
      <p class="mt-1 text-red-900">{{ error }}</p>
      <button type="button" class="mt-4 bg-red-700 text-white rounded" @click="emit('retry')">
        Retry
      </button>
    </div>

    <!-- Loaded -->
    <slot v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  // false until the first successful response; avoids a flash of
  // "No results" before the first request has even started
  ready: { type: Boolean, default: true },
  loadingText: { type: String, default: 'Loading...' },
  errorTitle: { type: String, default: 'Something went wrong' }
})

const emit = defineEmits(['retry'])

const showLoading = computed(() => props.loading || (!props.ready && !props.error))
</script>

<style scoped>
.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  border: 3px solid #e5e7eb;
  border-top-color: #b91c1c;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
