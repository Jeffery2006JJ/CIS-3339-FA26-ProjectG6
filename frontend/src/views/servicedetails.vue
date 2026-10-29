<!-- View/update one service and see which events offer it. -->
<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Service Details</h1>

    <p v-if="loading" class="text-center text-gray-500 mt-10 animate-pulse">Loading service...</p>
    <div v-else-if="loadError" class="m-10 rounded border border-red-300 bg-red-50 p-6" role="alert">
      <p class="font-bold text-red-800">Couldn't load this service</p>
      <p class="mt-1 text-red-900">{{ loadError }}</p>
      <button type="button" class="mt-4 bg-red-700 text-white rounded" @click="loadAll">Retry</button>
    </div>

    <template v-else>
      <div class="px-10 py-20">
        <p v-if="!user.isEditor" class="mb-6 italic text-gray-600">You have view-only access.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Service Details</h2>
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Service Name</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="service.name"
                type="text"
                :readonly="!user.isEditor"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.name.$error" class="text-red-500">Service Name is required</span>
          </div>
          <div class="flex flex-col">
            <label>
              <span class="text-gray-700">Description:</span>
              <textarea
                v-model="service.description"
                :readonly="!user.isEditor"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              ></textarea>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-10">
          <div></div>
          <fieldset class="flex flex-col">
            <legend class="text-gray-700">Service Status <span style="color: #ff0000">*</span></legend>
            <div class="mt-1">
              <label class="inline-flex items-center">
                <input v-model="service.status" type="radio" class="form-radio" value="Active" :disabled="!user.isEditor" />
                <span class="ml-2">Active</span>
              </label>
              <label class="inline-flex items-center ml-6">
                <input
                  v-model="service.status"
                  type="radio"
                  class="form-radio"
                  value="Inactive"
                  :disabled="!user.isEditor"
                />
                <span class="ml-2">Inactive</span>
              </label>
            </div>
          </fieldset>
        </div>

        <!-- Buttons -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <div></div>
          <div class="flex justify-between mt-10 mr-20">
            <button
              type="button"
              class="bg-green-700 disabled:opacity-50 text-white rounded"
              :disabled="!user.isEditor || busy"
              @click="submitServiceUpdate"
            >
              Update Service
            </button>
          </div>
          <div class="flex justify-between mt-10 mr-20">
            <button
              type="button"
              class="bg-red-700 disabled:opacity-50 text-white rounded"
              :disabled="!user.isEditor || busy"
              @click="submitDeleteService"
            >
              Delete Service
            </button>
          </div>
          <div class="flex justify-between mt-10 mr-20">
            <button type="button" class="border border-red-700 bg-white text-red-700 rounded" @click="router.back()">
              Go back
            </button>
          </div>
        </div>
      </div>

      <hr class="mt-10 mb-10" />

      <!-- Events offering this service -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mb-10">
        <div class="ml-10">
          <h2 class="text-2xl font-bold">List of Events</h2>
          <h3 class="italic">Click a row to view event details</h3>
        </div>
        <div class="flex flex-col col-span-2">
          <DataTable
            :columns="eventColumns"
            :rows="events"
            clickable
            empty-text="No events offer this service yet."
            @row-click="(event) => router.push({ name: 'eventdetails', params: { id: event._id } })"
          />
        </div>
      </div>
    </template>
  </main>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - [old data option] service -> reactive(); events -> ref()
// - setup() { useVuelidate(); useLoggedInUserStore() } + validations()
//     -> useVuelidate(rules, service) and useLoggedInUserStore() at the top level
// - async mounted() { Promise.all([...]) } -> onMounted(loadAll)
// - this.$route.params.id -> useRoute(); this.$router -> useRouter()
// - [old methods option] formatDate -> shared utils/formatDate.js
// - [old methods option] submitServiceUpdate / submitDeleteService -> plain async functions
// - events <table> + hoverId highlighting -> DataTable component
// - SECURITY: :disabled="user.role === 'viewer'" (denylist) -> !user.isEditor (allowlist)
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useLoggedInUserStore } from '../store/loggedInUser'
import DataTable from '../components/DataTable.vue'
import { formatDate } from '../utils/formatDate'
import { getServiceById, getEventsByServiceId, updateService, deleteService, messageFrom } from '../api/api'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const user = useLoggedInUserStore()
const serviceId = route.params.id

const service = reactive({ name: '', description: '', status: 'Active' })
const events = ref([]) // events that offer this service

const loading = ref(true)
const loadError = ref(null)
const busy = ref(false)

const rules = { name: { required } }
const v$ = useVuelidate(rules, service)

const eventColumns = [
  { label: 'Event Name', key: 'name' },
  { label: 'Event Date', key: 'date', render: (e) => formatDate(e.date), sortValue: (e) => e.date },
  { label: 'Event Address', key: 'address.line1' }
]

async function loadAll() {
  loading.value = true
  loadError.value = null
  try {
    const [serviceData, eventData] = await Promise.all([getServiceById(serviceId), getEventsByServiceId(serviceId)])
    Object.assign(service, serviceData)
    events.value = eventData
  } catch (err) {
    loadError.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

async function submitServiceUpdate() {
  const valid = await v$.value.$validate()
  if (!valid) return

  busy.value = true
  try {
    const response = await updateService(serviceId, service)
    toast.success(messageFrom(response, 'Service updated'))
    router.push('/findservice')
  } catch (err) {
    toast.error(err.message)
  } finally {
    busy.value = false
  }
}

async function submitDeleteService() {
  if (events.value.length > 0) {
    toast.info('Service can not be deleted since it is being used by events.')
    return
  }
  busy.value = true
  try {
    const response = await deleteService(serviceId)
    toast.success(messageFrom(response, 'Service deleted'))
    router.push('/findservice')
  } catch (err) {
    toast.error(err.message)
  } finally {
    busy.value = false
  }
}
</script>
