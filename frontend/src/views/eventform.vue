<!-- Lets an editor create a new event. -->
<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Create New Event</h1>
    <div class="px-10 py-20">
      <form novalidate @submit.prevent="handleSubmitForm">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Event Details</h2>

          <!-- Event name -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Event Name</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="event.name"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.name.$error" class="text-red-500">Event Name is required</span>
          </div>

          <!-- Date -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Date</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="event.date"
                type="date"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.date.$error" class="text-red-500">{{ dateError }}</span>
          </div>

          <div></div>
          <div></div>
          <!-- Description -->
          <div class="flex col-span-2 flex-col">
            <label class="block">
              <span class="text-gray-700">Description</span>
              <textarea
                v-model="event.description"
                rows="2"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              ></textarea>
            </label>
          </div>
        </div>

        <!-- Services offered at the event -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-10">
          <h2 class="text-2xl font-bold">Services Offered at Event</h2>
          <div class="flex flex-col grid-cols-3">
            <p v-if="servicesLoading" class="text-gray-500">Loading services...</p>
            <ul v-else-if="activeServices.length" class="space-y-2">
              <li
                v-for="service in activeServices"
                :key="service._id"
                class="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 transition-colors relative"
              >
                <label class="block w-full h-full">
                  <input
                    v-model="event.services"
                    type="checkbox"
                    :value="service._id"
                    class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 mr-2"
                  />
                  <span class="font-medium">{{ service.name }}</span>
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
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>
        </div>

        <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <div></div>
          <div class="flex justify-between mr-20">
            <button class="bg-red-700 text-white rounded disabled:opacity-50" type="submit" :disabled="saving">
              {{ saving ? 'Saving...' : 'Add New Event' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - [old data option] event -> reactive(); activeServices -> computed() from the services list
// - [old data option] openDescriptions was never used -> removed
// - setup() { useVuelidate() } + validations() -> useVuelidate(rules, event)
//   (template paths changed from v$.event.name to v$.name)
// - async mounted() { getServices() } -> onMounted()
// - [old methods option] handleSubmitForm -> plain async function
// - this.$router.push -> useRouter()
// - BUG FIXED: the Description <textarea> had no v-model, so descriptions were never saved
// - BUG FIXED: "notBeforeToday" compared against the UTC date, so in the evening
//   (US time) today's date was rejected as "in the past". Now uses the local date.
// - BUG FIXED: :checked + v-model on the same checkbox -> v-model only
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { getServices, createEvent, messageFrom } from '../api/api'

const router = useRouter()
const toast = useToast()

const event = reactive({
  name: '',
  description: '',
  date: '',
  services: [],
  address: { line1: '', line2: '', city: '', county: '', zip: '' },
  attendees: []
})

// today's date as YYYY-MM-DD in the user's own time zone
function localToday() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

const validDate = (value) => !helpers.req(value) || !isNaN(new Date(value))
const notBeforeToday = (value) => !helpers.req(value) || value >= localToday()

const rules = {
  name: { required },
  date: { required, validDate, notBeforeToday }
}
const v$ = useVuelidate(rules, event)

const dateError = computed(() => {
  const date = v$.value.date
  if (date.required.$invalid) return 'Event Date is required'
  if (date.validDate.$invalid) return 'Event Date must be a valid date'
  return 'New Event Date cannot be in the past.'
})

// services list for the checkboxes (only active services can be offered)
const services = ref([])
const servicesLoading = ref(true)
const activeServices = computed(() => services.value.filter((s) => s.status === 'Active'))

onMounted(async () => {
  try {
    services.value = await getServices()
  } catch (err) {
    toast.error(err.message)
  } finally {
    servicesLoading.value = false
  }
})

const saving = ref(false)

async function handleSubmitForm() {
  const valid = await v$.value.$validate()
  if (!valid) {
    toast.error('Please fix the highlighted fields')
    return
  }

  saving.value = true
  try {
    const response = await createEvent(event)
    toast.success(messageFrom(response, 'Event created'))
    router.push('/findevents')
  } catch (err) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}
</script>
