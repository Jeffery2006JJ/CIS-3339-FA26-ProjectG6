<!-- View/update one client, and manage which events they are registered for. -->
<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Client Details</h1>

    <p v-if="loading" class="text-center text-gray-500 mt-10 animate-pulse">Loading client...</p>
    <div v-else-if="loadError" class="m-10 rounded border border-red-300 bg-red-50 p-6" role="alert">
      <p class="font-bold text-red-800">Couldn't load this client</p>
      <p class="mt-1 text-red-900">{{ loadError }}</p>
      <button type="button" class="mt-4 bg-red-700 text-white rounded" @click="loadAll">Retry</button>
    </div>

    <template v-else>
      <div class="px-10 py-20">
        <p v-if="!user.isEditor" class="mb-6 italic text-gray-600">You have view-only access.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Personal Details</h2>
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">First Name</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="client.firstName"
                type="text"
                :readonly="!user.isEditor"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.firstName.$error" class="text-red-500">First Name is required</span>
          </div>
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Middle Name</span>
              <input
                v-model="client.middleName"
                type="text"
                :readonly="!user.isEditor"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Last Name</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="client.lastName"
                type="text"
                :readonly="!user.isEditor"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.lastName.$error" class="text-red-500">Last Name is required</span>
          </div>
          <div></div>
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Email</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="client.email"
                type="email"
                :readonly="!user.isEditor"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.email.$error" class="text-red-500">Valid Email is required</span>
          </div>
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Phone Number</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="client.phoneNumber.primary"
                type="text"
                inputmode="numeric"
                :readonly="!user.isEditor"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.phoneNumber.primary.$error" class="text-red-500">{{ phoneError }}</span>
          </div>
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Alternative Phone Number</span>
              <input
                v-model="client.phoneNumber.alternate"
                type="text"
                inputmode="numeric"
                :readonly="!user.isEditor"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>
        </div>

        <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Address Details</h2>
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Address Line 1</span>
              <input
                v-model="client.address.line1"
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
                v-model="client.address.line2"
                type="text"
                :readonly="!user.isEditor"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">City</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="client.address.city"
                type="text"
                :readonly="!user.isEditor"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.address.city.$error" class="text-red-500">City is required</span>
          </div>
          <div></div>
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">County</span>
              <input
                v-model="client.address.county"
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
                v-model="client.address.zip"
                type="text"
                :readonly="!user.isEditor"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>
          <div></div>
        </div>

        <!-- Buttons -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <div class="flex justify-between mt-10 mr-20"></div>
          <div class="flex justify-between mt-10 mr-20">
            <button
              type="button"
              class="bg-green-700 disabled:opacity-50 text-white rounded"
              :disabled="!user.isEditor || busy"
              @click="submitUpdateClient"
            >
              Update Client
            </button>
          </div>
          <div class="flex justify-between mt-10 mr-20">
            <button
              type="button"
              class="bg-red-700 disabled:opacity-50 text-white rounded"
              :disabled="!user.isEditor || busy"
              @click="submitDeleteClient"
            >
              Delete Client
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

      <!-- Events this client is registered for -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mr-10 mb-10">
        <div class="ml-10">
          <h2 class="text-2xl font-bold">Events for Client</h2>
          <h3 class="italic">Click a row to view event details</h3>
        </div>
        <div class="flex flex-col col-span-2">
          <DataTable
            :columns="eventColumns"
            :rows="clientEvents"
            clickable
            empty-text="This client isn't registered for any events."
            @row-click="(event) => router.push({ name: 'eventdetails', params: { id: event._id } })"
          >
            <!-- remove-from-event button, editors only -->
            <template #cell-actions="{ row }">
              <button
                v-if="user.isEditor"
                type="button"
                class="remove-btn text-gray-500"
                :aria-label="`Remove client from ${row.name}`"
                :disabled="busy"
                @click.stop="removeClientFromEvent(row._id)"
              >
                ✕
              </button>
            </template>
          </DataTable>
        </div>

        <div v-if="user.isEditor" class="flex flex-col">
          <VueMultiselect
            v-model="eventsSelected"
            class="w-full rounded-md border-gray-300 shadow-sm cursor-pointer"
            :options="eventsFiltered"
            :custom-label="nameWithDate"
            :multiple="true"
            :close-on-select="true"
            placeholder="Select events to add"
            track-by="_id"
          />
          <div class="flex justify-between">
            <button
              type="button"
              class="mt-5 bg-red-700 disabled:opacity-50 text-white rounded"
              :disabled="eventsSelected.length === 0 || busy"
              @click="addClientToEvent"
            >
              Add Client to Selected Events
            </button>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - components: { VueMultiselect } -> plain import
// - setup() { useVuelidate(); useLoggedInUserStore() } + validations()
//     -> useVuelidate(rules, client) and useLoggedInUserStore() at the top level
// - [old data option] client -> reactive(); eventsFiltered, eventsSelected, clientEvents -> ref()
// - async mounted() { Promise.all([...]) } -> onMounted(loadAll)
// - this.$route.params.id -> useRoute(); this.$router -> useRouter()
// - [old methods option] formatDate -> shared utils/formatDate.js
// - [old methods option] removeClientFromEvent / addClientToEvent / submitUpdateClient /
//   submitDeleteClient -> plain async functions
// - hand-written events <table> -> DataTable with a #cell-actions slot for the remove button
// - SECURITY: role checks were a denylist (:disabled="user.role === 'viewer'"),
//   so any other role (typo, empty, new role) could edit. Now an allowlist:
//   only user.isEditor (role === 'editor') can edit, remove or register.
// - The remove "X" used to show for viewers too; now it is editor-only.
// - BUG FIXED: addClientToEvent() didn't await Promise.all, so errors were not caught
// - NEW: register/deregister understand the agreed B1 replies
//   ("Already registered" / "Not registered") and show them as info toasts
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required, email, numeric, minLength, maxLength } from '@vuelidate/validators'
import VueMultiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import { useLoggedInUserStore } from '../store/loggedInUser'
import DataTable from '../components/DataTable.vue'
import { formatDate } from '../utils/formatDate'
import {
  getClientById,
  getClientEvents,
  getNonClientEvents,
  registerAttendee,
  deregisterAttendee,
  updateClient,
  deleteClientbyId,
  messageFrom
} from '../api/api'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const user = useLoggedInUserStore()
const clientId = route.params.id

const emptyClient = () => ({
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phoneNumber: { primary: '', alternate: '' },
  address: { line1: '', line2: '', city: '', county: '', zip: '' }
})

const client = reactive(emptyClient())
const clientEvents = ref([]) // events the client IS registered for
const eventsFiltered = ref([]) // events the client is NOT registered for (multiselect options)
const eventsSelected = ref([]) // events picked in the multiselect

const loading = ref(true)
const loadError = ref(null)
const busy = ref(false)

const rules = {
  firstName: { required },
  lastName: { required },
  email: { required, email },
  phoneNumber: {
    primary: { required, numeric, minLength: minLength(10), maxLength: maxLength(10) }
  },
  address: { city: { required } }
}
const v$ = useVuelidate(rules, client)

const phoneError = computed(() => {
  const phone = v$.value.phoneNumber.primary
  if (phone.required.$invalid) return 'Phone Number is required'
  if (phone.numeric.$invalid) return 'Phone Number must contain only digits'
  return 'Phone Number must be exactly 10 digits'
})

const eventColumns = [
  { label: 'Event Name', key: 'name' },
  { label: 'Date', key: 'date', render: (e) => formatDate(e.date), sortValue: (e) => e.date },
  { label: '', key: 'actions', sortable: false }
]

function nameWithDate({ name, date }) {
  return `${name} (${formatDate(date)})`
}

// Copy API data into the reactive client, keeping default nested objects
// so v-model never hits an undefined phoneNumber/address.
function applyClient(data) {
  const base = emptyClient()
  Object.assign(client, base, data, {
    phoneNumber: { ...base.phoneNumber, ...(data.phoneNumber || {}) },
    address: { ...base.address, ...(data.address || {}) }
  })
}

async function refreshEvents() {
  const [registered, notRegistered] = await Promise.all([getClientEvents(clientId), getNonClientEvents(clientId)])
  clientEvents.value = registered
  eventsFiltered.value = notRegistered
}

async function loadAll() {
  loading.value = true
  loadError.value = null
  try {
    const [clientData] = await Promise.all([getClientById(clientId), refreshEvents()])
    applyClient(clientData)
  } catch (err) {
    loadError.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

async function removeClientFromEvent(eventId) {
  busy.value = true
  try {
    const response = await deregisterAttendee(eventId, clientId)
    const message = messageFrom(response, 'Client removed from event')
    message === 'Not registered' ? toast.info(message) : toast.success(message)
    await refreshEvents()
  } catch (err) {
    toast.error(err.message)
  } finally {
    busy.value = false
  }
}

async function addClientToEvent() {
  busy.value = true
  try {
    const results = await Promise.all(
      eventsSelected.value.map((event) => registerAttendee(event._id, client._id || clientId))
    )
    const already = results.filter((r) => messageFrom(r, '') === 'Already registered').length
    const added = results.length - already
    if (added) toast.success(`Client added to ${added} event${added === 1 ? '' : 's'}`)
    if (already) toast.info(`Already registered for ${already} of the selected events`)
    eventsSelected.value = []
    await refreshEvents()
  } catch (err) {
    toast.error(err.message)
  } finally {
    busy.value = false
  }
}

async function submitUpdateClient() {
  const valid = await v$.value.$validate()
  if (!valid) return

  busy.value = true
  try {
    const response = await updateClient(clientId, client)
    toast.success(messageFrom(response, 'Client updated'))
    router.push('/findclient')
  } catch (err) {
    toast.error(err.message)
  } finally {
    busy.value = false
  }
}

async function submitDeleteClient() {
  busy.value = true
  try {
    const response = await deleteClientbyId(clientId)
    toast.success(messageFrom(response, 'Client deleted'))
    router.push('/findclient')
  } catch (err) {
    toast.error(err.message)
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.remove-btn {
  padding: 2px 8px;
  border-radius: 4px;
}
.remove-btn:hover,
.remove-btn:focus-visible {
  color: black;
  background-color: rgba(0, 0, 0, 0.08);
}
</style>
