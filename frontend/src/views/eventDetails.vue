<!-- View/update one event and see who is registered for it. -->
<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Event Details</h1>

    <p v-if="loading" class="text-center text-gray-500 mt-10 animate-pulse">Loading event...</p>
    <div v-else-if="loadError" class="m-10 rounded border border-red-300 bg-red-50 p-6" role="alert">
      <p class="font-bold text-red-800">Couldn't load this event</p>
      <p class="mt-1 text-red-900">{{ loadError }}</p>
      <button type="button" class="mt-4 bg-red-700 text-white rounded" @click="loadAll">Retry</button>
    </div>

    <div v-else class="px-10 py-20">
      <p v-if="!user.isEditor" class="mb-6 italic text-gray-600">You have view-only access.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Event Details</h2>
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Event Name</span>
            <span style="color: #ff0000">*</span>
            <input
              v-model="event.name"
              type="text"
              :readonly="!user.isEditor"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          <span v-if="v$.name.$error" class="text-red-500">Event Name is required</span>
        </div>
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Date</span>
            <span style="color: #ff0000">*</span>
            <input
              v-model="event.date"
              type="date"
              :readonly="!user.isEditor"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          <span v-if="v$.date.$error" class="text-red-500">
            {{ v$.date.required.$invalid ? 'Event Date is required' : 'Event Date must be a valid date' }}
          </span>
        </div>
        <div></div>
        <div></div>
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Description</span>
            <textarea
              v-model="event.description"
              rows="2"
              :readonly="!user.isEditor"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            ></textarea>
          </label>
        </div>
      </div>

      <!-- Services offered at the event -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-10">
        <h2 class="text-2xl font-bold">Services Offered at Event</h2>
        <div class="flex flex-col grid-cols-3">
          <ul v-if="services.length" class="space-y-2">
            <li
              v-for="service in services"
              :key="service._id"
              class="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 transition-colors relative"
            >
              <label class="block w-full h-full">
                <input
                  v-model="event.services"
                  type="checkbox"
                  :value="service._id"
                  :disabled="!user.isEditor || service.status === 'Inactive'"
                  class="rounded border-gray-300 disabled:opacity-50 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 mr-2"
                />
                <span class="font-medium">{{ service.name }}</span>
                <span v-if="service.status === 'Inactive'" class="ml-2 text-sm text-gray-500">(inactive)</span>
              </label>
            </li>
          </ul>
          <p v-else class="text-gray-600">No Active Services Available</p>
        </div>
      </div>

      <!-- Address -->
      <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Address</h2>
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Address Line 1</span>
            <input
              v-model="event.address.line1"
              type="text"
              :readonly="!user.isEditor"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Address Line 2</span>
            <input
              v-model="event.address.line2"
              type="text"
              :readonly="!user.isEditor"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">City</span>
            <input
              v-model="event.address.city"
              type="text"
              :readonly="!user.isEditor"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>
        <div></div>
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">County</span>
            <input
              v-model="event.address.county"
              type="text"
              :readonly="!user.isEditor"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Zip Code</span>
            <input
              v-model="event.address.zip"
              type="text"
              :readonly="!user.isEditor"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>
      </div>

      <!-- Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div class="flex justify-between mt-10 mr-20">
          <button
            type="button"
            class="bg-green-700 disabled:opacity-50 text-white rounded"
            :disabled="!user.isEditor || busy"
            @click="submitEventUpdate"
          >
            Update Event
          </button>
        </div>
        <div class="flex justify-between mt-10 mr-20">
          <button
            type="button"
            class="bg-red-700 disabled:opacity-50 text-white rounded"
            :disabled="!user.isEditor || busy"
            @click="submitDeleteEvent"
          >
            Delete Event
          </button>
        </div>
        <div class="flex justify-between mt-10 mr-20">
          <button type="button" class="border border-red-700 bg-white text-red-700 rounded" @click="router.back()">
            Go back
          </button>
        </div>
      </div>

      <hr class="mt-10 mb-10" />

      <!-- Attendees -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div>
          <h2 class="text-2xl font-bold">List of Attendees</h2>
          <h3 class="italic">Click a row to view client details</h3>
        </div>
        <div class="flex flex-col col-span-2">
          <DataTable
            :columns="attendeeColumns"
            :rows="attendees"
            clickable
            empty-text="No one is registered for this event yet."
            @row-click="(client) => router.push({ name: 'clientdetails', params: { id: client._id } })"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - [old data option] event -> reactive(); clients, services -> ref()
// - setup() { useVuelidate(); useLoggedInUserStore() } + validations()
//     -> useVuelidate(rules, event) and useLoggedInUserStore() at the top level
// - async mounted() { Promise.all([...]) } -> onMounted(loadAll)
// - this.$route.params.id -> useRoute(); this.$router -> useRouter()
// - [old methods option] submitEventUpdate / submitDeleteEvent -> plain async functions
// - attendees <table> + hoverId highlighting -> DataTable component
// - SECURITY: :disabled="user.role === 'viewer'" (denylist) -> !user.isEditor (allowlist)
// - BUG FIXED: delete check compared the attendees ARRAY to 0
//   (this.event.attendees != 0) -> now checks attendees.length
// - BUG FIXED: toast.error('error updating event', error) hid the real message
// - NOTE: this file is eventDetails.vue (capital D). The router used to import
//   "eventdetails.vue", which broke the build on Mac/Linux. Fixed in router/index.js.
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useLoggedInUserStore } from '../store/loggedInUser'
import DataTable from '../components/DataTable.vue'
import { toDateInputValue } from '../utils/formatDate'
import { getEventById, getEventAttendees, getServices, updateEvent, deleteEvent, messageFrom } from '../api/api'

// Get the current event ID from the URL and initialize navigation,
// notifications, and the logged-in user's store.
const route = useRoute()
const router = useRouter()
const toast = useToast()
const user = useLoggedInUserStore()
const eventId = route.params.id

// Return a fresh event object with the default form values.
// Creating a new object each time avoids sharing nested address or array values.
const emptyEvent = () => ({
  name: '',
  description: '',
  date: '',
  address: { line1: '', line2: '', city: '', county: '', zip: '' },
  attendees: [],
  services: []
})

// Reactive event form data
const event = reactive(emptyEvent())
const attendees = ref([]) // full client records for the attendee list
const services = ref([]) // all services, for the checkboxes

// Track data load, any loading error, and form submission or deletion.
const loading = ref(true)
const loadError = ref(null)
const busy = ref(false)

// Treat an empty date as valid so the required rule can show its own message.
const validDate = (value) => !helpers.req(value) || !isNaN(new Date(value))

// Validation rules for the required event name and date fields.
const rules = {
  name: { required },
  date: { required, validDate }
}
const v$ = useVuelidate(rules, event)

// Configure the columns shown for each attendee.
const attendeeColumns = [
  { label: 'Name', key: 'name', render: (c) => `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() },
  { label: 'City', key: 'address.city' },
  { label: 'Phone Number', key: 'phoneNumber.primary' }
]

// Load event, attendees, and available services, then populates the reactive form.
async function loadAll() {
  loading.value = true
  loadError.value = null
  try {
    const [eventData, attendeeData, serviceData] = await Promise.all([
      getEventById(eventId),
      getEventAttendees(eventId),
      getServices()
    ])
    const base = emptyEvent()
    Object.assign(event, base, eventData, {
      address: { ...base.address, ...(eventData.address || {}) },
      services: eventData.services || [],
      attendees: eventData.attendees || [],
      // <input type="date"> needs YYYY-MM-DD
      date: toDateInputValue(eventData.date)
    })
    attendees.value = attendeeData
    services.value = serviceData
  } catch (err) {
    loadError.value = err.message
  } finally {
    loading.value = false
  }
}

// Fetch the event data when the component is mounted.
onMounted(loadAll)

// Validate the form, save the updated event, and return to the event list.
async function submitEventUpdate() {
  const valid = await v$.value.$validate()
  if (!valid) return

  busy.value = true
  try {
    const response = await updateEvent(eventId, event)
    toast.success(messageFrom(response, 'Event updated'))
    router.push('/findevents')
  } catch (err) {
    toast.error(err.message)
  } finally {
    busy.value = false
  }
}

async function submitDeleteEvent() {
  if (event.attendees.length > 0) {
    toast.info('Event can not be deleted since it has attendees.')
    return
  }
  busy.value = true
  try {
    const response = await deleteEvent(eventId)
    toast.success(messageFrom(response, 'Event deleted'))
    router.push('/findevents')
  } catch (err) {
    toast.error(err.message)
  } finally {
    busy.value = false
  }
}
</script>
