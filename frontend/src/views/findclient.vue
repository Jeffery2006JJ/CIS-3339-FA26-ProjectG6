<!-- Lists clients. Users can search by name or phone number and click a row to open that client. -->
<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Find Client</h1>

    <!-- Search form -->
    <form class="px-10 pt-20" @submit.prevent="search">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Client By</h2>
        <div class="flex flex-col">
          <label for="client-search-by" class="sr-only">Search client by</label>
          <select
            id="client-search-by"
            v-model="searchBy"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="Client Name">Client Name</option>
            <option value="Client Number">Client Number</option>
          </select>
        </div>
        <template v-if="searchBy === 'Client Name'">
          <div class="flex flex-col">
            <label class="block">
              <span class="sr-only">First name</span>
              <input
                v-model.trim="firstName"
                type="text"
                placeholder="Enter first name"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>
          <div class="flex flex-col">
            <label class="block">
              <span class="sr-only">Last name</span>
              <input
                v-model.trim="lastName"
                type="text"
                placeholder="Enter last name"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>
        </template>
        <div v-if="searchBy === 'Client Number'" class="flex flex-col">
          <label class="block">
            <span class="sr-only">Phone number</span>
            <input
              v-model.trim="phoneNumber"
              type="text"
              placeholder="Enter client phone number"
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
          <button type="submit" class="bg-red-700 text-white rounded">Search Client</button>
        </div>
      </div>
    </form>

    <hr class="mt-10 mb-10" />

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mb-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Clients</h2>
        <h3 class="italic">Click a row (or press Enter on it) to view client details</h3>
      </div>
      <div class="flex flex-col col-span-2">
        <AsyncState
          :loading="loading"
          :error="error"
          :ready="data !== null"
          loading-text="Loading clients..."
          error-title="Couldn't load clients"
          @retry="execute"
        >
          <DataTable
            :columns="columns"
            :rows="data ?? []"
            clickable
            :empty-text="activeQuery ? 'No clients match your search.' : 'No clients have been added yet.'"
            @row-click="openClient"
          />
        </AsyncState>
      </div>
    </div>
  </main>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - [old data option] searchBy, firstName, lastName, phoneNumber -> ref()
// - [old data option] clients + manual try/catch/toast in loadData() and handleSubmitForm()
//     -> useApi(): gives data / loading / error / execute in one place
// - mounted() { this.loadData() } -> onMounted(execute)
// - [old methods option] loadData (also reset the search) -> clearSearch()
// - [old methods option] handleSubmitForm -> search(); it builds the query, then calls execute()
// - this.$router.push(...) -> useRouter()
// - hoverId + @mouseenter/@mouseleave row highlighting -> CSS :hover in DataTable
// - hand-written <table> -> shared DataTable component (sorting + paging)
// - toast.error(error) showed "[object Object]" -> AsyncState shows the
//   readable message from the Axios interceptor, with a Retry button
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getClients, searchClients } from '../api/api'
import { useApi } from '../composables/useApi'
import DataTable from '../components/DataTable.vue'
import AsyncState from '../components/AsyncState.vue'

const router = useRouter()

// search form fields
const searchBy = ref('Client Name')
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')

// The query the current list was loaded with (null = all clients).
// execute() always re-runs whatever this is, so Retry repeats the last request.
const activeQuery = ref(null)

const { data, loading, error, execute } = useApi(() =>
  activeQuery.value ? searchClients(activeQuery.value) : getClients()
)

onMounted(execute)

const columns = [
  { label: 'Name', key: 'name', render: (c) => `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() },
  { label: 'Phone Number', key: 'phoneNumber.primary' },
  { label: 'City', key: 'address.city' }
]

function search() {
  if (searchBy.value === 'Client Name') {
    if (!firstName.value && !lastName.value) return
    activeQuery.value = { searchBy: 'name', firstName: firstName.value, lastName: lastName.value }
  } else if (searchBy.value === 'Client Number') {
    if (!phoneNumber.value) return
    activeQuery.value = { searchBy: 'number', phoneNumber: phoneNumber.value }
  }
  execute()
}

function clearSearch() {
  firstName.value = ''
  lastName.value = ''
  phoneNumber.value = ''
  activeQuery.value = null
  execute()
}

function openClient(client) {
  router.push({ name: 'clientdetails', params: { id: client._id } })
}
</script>
