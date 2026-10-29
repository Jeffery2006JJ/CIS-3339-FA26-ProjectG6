<!-- Lists services. Users can search by name or description and click a row to open that service. -->
<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Find Services</h1>

    <!-- Search form -->
    <form class="px-10 pt-20" @submit.prevent="search">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Service By</h2>
        <div class="flex flex-col">
          <label for="service-search-by" class="sr-only">Search service by</label>
          <select
            id="service-search-by"
            v-model="searchBy"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="Service Name">Service Name</option>
            <option value="Service Description">Service Description</option>
          </select>
        </div>
        <div v-if="searchBy === 'Service Name'" class="flex flex-col">
          <label class="block">
            <span class="sr-only">Service name</span>
            <input
              v-model.trim="name"
              type="text"
              placeholder="Enter service name"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>
        <div v-if="searchBy === 'Service Description'" class="flex flex-col">
          <label class="block">
            <span class="sr-only">Service description</span>
            <input
              v-model.trim="description"
              type="text"
              placeholder="Enter service description"
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
          <button type="submit" class="bg-red-700 text-white rounded">Search Service</button>
        </div>
      </div>
    </form>

    <hr class="mt-10 mb-10" />

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mb-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Services</h2>
        <h3 class="italic">Click a row (or press Enter on it) to view service details</h3>
      </div>
      <div class="flex flex-col col-span-2">
        <AsyncState
          :loading="loading"
          :error="error"
          :ready="data !== null"
          loading-text="Loading services..."
          error-title="Couldn't load services"
          @retry="execute"
        >
          <DataTable
            :columns="columns"
            :rows="data ?? []"
            clickable
            :empty-text="activeQuery ? 'No services match your search.' : 'No services have been created yet.'"
            @row-click="openService"
          />
        </AsyncState>
      </div>
    </div>
  </main>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - [old data option] searchBy, name, description -> ref()
// - [old data option] services + try/catch/toast in loadData() and handleSubmitForm() -> useApi()
// - mounted() { this.loadData() } -> onMounted(execute)
// - [old methods option] loadData -> clearSearch(); handleSubmitForm -> search()
// - this.$router.push(...) -> useRouter()
// - hoverId row highlighting -> CSS :hover in DataTable
// - hand-written <table> -> shared DataTable component (sorting + paging)
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getServices, searchServices } from '../api/api'
import { useApi } from '../composables/useApi'
import DataTable from '../components/DataTable.vue'
import AsyncState from '../components/AsyncState.vue'

const router = useRouter()

const searchBy = ref('Service Name')
const name = ref('')
const description = ref('')

// null = all services; otherwise the search the list was loaded with
const activeQuery = ref(null)

const { data, loading, error, execute } = useApi(() =>
  activeQuery.value ? searchServices(activeQuery.value) : getServices()
)

onMounted(execute)

const columns = [
  { label: 'Service Name', key: 'name' },
  { label: 'Service Description', key: 'description' },
  { label: 'Status', key: 'status' }
]

function search() {
  if (searchBy.value === 'Service Name') {
    if (!name.value) return
    activeQuery.value = { searchBy: 'name', name: name.value }
  } else if (searchBy.value === 'Service Description') {
    if (!description.value) return
    activeQuery.value = { searchBy: 'description', description: description.value }
  }
  execute()
}

function clearSearch() {
  name.value = ''
  description.value = ''
  activeQuery.value = null
  execute()
}

function openService(service) {
  router.push({ name: 'servicedetails', params: { id: service._id } })
}
</script>
