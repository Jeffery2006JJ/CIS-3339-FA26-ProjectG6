<!-- Lists events. Users can search by name or date and click a row to open that event. -->
<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">List of Events</h1>

    <!-- Search form -->
    <form class="px-10 pt-20" @submit.prevent="search">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Event By</h2>
        <div class="flex flex-col">
          <label for="event-search-by" class="sr-only">Search event by</label>
          <select
            id="event-search-by"
            v-model="searchBy"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="Event Name">Event Name</option>
            <option value="Event Date">Event Date</option>
          </select>
        </div>
        <div v-if="searchBy === 'Event Name'" class="flex flex-col">
          <label class="block">
            <span class="sr-only">Event name</span>
            <input
              v-model.trim="name"
              type="text"
              placeholder="Enter event name"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>
        <div v-if="searchBy === 'Event Date'" class="flex flex-col">
          <label class="block">
            <span class="sr-only">Event date</span>
            <input
              v-model="eventDate"
              type="date"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <div class="mt-5 grid-cols-2">
          <button type="button" class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="clearSearch">
            Clear Search
          </button>
          <button type="submit" class="bg-red-700 text-white rounded">Search Event</button>
        </div>
      </div>
    </form>

    <hr class="mt-10 mb-10" />

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mb-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Events</h2>
        <h3 class="italic">Click a row (or press Enter on it) to view event details</h3>
      </div>
      <div class="flex flex-col col-span-2">
        <AsyncState
          :loading="loading"
          :error="error"
          :ready="data !== null"
          loading-text="Loading events..."
          error-title="Couldn't load events"
          @retry="execute"
        >
          <DataTable
            :columns="columns"
            :rows="data ?? []"
            clickable
            :empty-text="activeQuery ? 'No events match your search.' : 'No events have been created yet.'"
            @row-click="openEvent"
          >
            <!-- Status column: green "Upcoming" or gray "Past" badge -->
            <template #cell-status="{ row }">
              <span
                class="inline-block rounded-full px-3 py-1 text-sm font-semibold"
                :class="isUpcoming(row) ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'"
              >
                {{ isUpcoming(row) ? 'Upcoming' : 'Past' }}
              </span>
            </template>
          </DataTable>
        </AsyncState>
      </div>
    </div>
  </main>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - [old data option] searchBy, name, eventDate -> ref()
// - [old data option] events + try/catch/toast in loadData() and handleSubmitForm() -> useApi()
// - mounted() { this.loadData() } -> onMounted(execute)
// - [old methods option] loadData -> clearSearch(); handleSubmitForm -> search()
// - [old methods option] formatDate (copy-pasted in 4 files) -> shared utils/formatDate.js
// - this.$router.push(...) -> useRouter()
// - hoverId row highlighting -> CSS :hover in DataTable
// - BUG FIXED: loadData() set this.isLoading, which was never declared in the old data option
// - BUG FIXED: toast.error('loadData error', error) passed the error as the
//   toast *options*, so the real message was never shown
//
// NEW FEATURE: Status column with an "Upcoming" / "Past" badge for each event,
// rendered through DataTable's #cell-status slot. Sorting by Status groups
// upcoming events first. Today's events count as upcoming.
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getEvents, searchEvents } from '../api/api'
import { useApi } from '../composables/useApi'
import { formatDate } from '../utils/formatDate'
import DataTable from '../components/DataTable.vue'
import AsyncState from '../components/AsyncState.vue'

const router = useRouter()

const searchBy = ref('Event Name')
const name = ref('')
const eventDate = ref('')

// null = all events; otherwise the search the list was loaded with
const activeQuery = ref(null)

const { data, loading, error, execute } = useApi(() =>
  activeQuery.value ? searchEvents(activeQuery.value) : getEvents()
)

onMounted(execute)

// today's date as YYYY-MM-DD in the user's time zone
function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// an event happening today still counts as upcoming
function isUpcoming(event) {
  return (event.date || '').substring(0, 10) >= localToday()
}

const columns = [
  { label: 'Event Name', key: 'name' },
  // show MM/DD/YYYY but sort by the real ISO date so years sort correctly
  { label: 'Event Date', key: 'date', render: (e) => formatDate(e.date), sortValue: (e) => e.date },
  { label: 'Event Address', key: 'address.line1' },
  // Upcoming / Past badge (sorting it groups upcoming events first, then past)
  { label: 'Status', key: 'status', sortValue: (e) => (isUpcoming(e) ? 0 : 1) }
]

function search() {
  if (searchBy.value === 'Event Name') {
    if (!name.value) return
    activeQuery.value = { searchBy: 'name', name: name.value }
  } else if (searchBy.value === 'Event Date') {
    if (!eventDate.value) return
    // <input type="date"> already gives YYYY-MM-DD
    activeQuery.value = { searchBy: 'date', eventDate: eventDate.value }
  }
  execute()
}

function clearSearch() {
  name.value = ''
  eventDate.value = ''
  activeQuery.value = null
  execute()
}

function openEvent(event) {
  router.push({ name: 'eventdetails', params: { id: event._id } })
}
</script>
