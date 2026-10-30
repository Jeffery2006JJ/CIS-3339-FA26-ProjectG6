<!-- Dashboard: event attendance for the last two months and clients by zip code. -->
<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Dashboard</h1>
    <br />

    <!-- Events attendance -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10"></div>
      <section class="flex flex-col col-span-2">
        <h2 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10 mb-6">
          Events Attendance
        </h2>
        <AsyncState
          :loading="attendanceLoading"
          :error="attendanceError"
          :ready="attendanceData !== null"
          error-title="Couldn't load attendance"
          @retry="loadAttendance"
        >
          <DataTable
            :columns="attendanceColumns"
            :rows="recentEvents"
            clickable
            empty-text="No events in the last two months."
            @row-click="(event) => router.push({ name: 'eventdetails', params: { id: event._id } })"
          />
          <AttendanceChart v-if="recentEvents.length" :label="attendanceLabels" :chart-data="attendanceCounts" />
        </AsyncState>
      </section>
    </div>

    <!-- Clients by zip code -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10"></div>
      <section class="flex flex-col col-span-2">
        <h2 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10 mb-6">
          Clients by Zip Code
        </h2>
        <AsyncState
          :loading="zipLoading"
          :error="zipError"
          :ready="zipData !== null"
          error-title="Couldn't load clients by zip code"
          @retry="loadZips"
        >
          <DataTable
            :columns="zipColumns"
            :rows="zips"
            row-key="_id"
            empty-text="No clients found."
          />
          <div v-if="zips.length" class="flex justify-center mt-10">
            <ZipChart :label="zipLabels" :chart-data="zipCounts" />
          </div>
        </AsyncState>
      </section>
    </div>
  </main>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - components: { AttendanceChart, ZipChart } -> plain imports (auto-registered in <script setup>)
// - [old data option] recentEvents, zips, labels, chartData, loading, error, zipLoading, zipError
//     -> two useApi() calls (attendance + zip). Each gives its own data/loading/error.
// - labels / chartData / zipLabels / zipChartData were copied into the old data option by hand
//     -> computed() derived from the API data, so they can never get out of sync
// - mounted() { getAttendanceData(); getZipData() } -> onMounted()
// - the long if/else that built error titles from err.response / err.request
//     -> removed; the Axios interceptor in api.js now produces the message
// - formatDate() method (duplicated in 4 files) -> shared utils/formatDate.js
// - FIX: "loading" used to start as false, so the chart could render before
//   data arrived. AsyncState's `ready` prop now shows "Loading..." until the
//   first response comes back.
// - the two hand-written tables now use the shared DataTable component
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AttendanceChart from '../components/barChart.vue'
import ZipChart from '../components/donutZipChart.vue'
import DataTable from '../components/DataTable.vue'
import AsyncState from '../components/AsyncState.vue'
import { useApi } from '../composables/useApi'
import { getAttendance, getClientsByZipCode } from '../api/api'
import { formatDate } from '../utils/formatDate'

const router = useRouter()

// One useApi() per dashboard widget, so each can fail/retry on its own.
const {
  data: attendanceData,
  loading: attendanceLoading,
  error: attendanceError,
  execute: loadAttendance
} = useApi(() => getAttendance())

const { data: zipData, loading: zipLoading, error: zipError, execute: loadZips } = useApi(() =>
  getClientsByZipCode()
)

onMounted(() => {
  loadAttendance()
  loadZips()
})

// Attendance
const recentEvents = computed(() => attendanceData.value ?? [])
const attendanceLabels = computed(() =>
  recentEvents.value.map((event) => `${event.name} (${formatDate(event.date)})`)
)
const attendanceCounts = computed(() => recentEvents.value.map((event) => event.attendees?.length ?? 0))

const attendanceColumns = [
  { label: 'Event Name', key: 'name' },
  { label: 'Event Date', key: 'date', render: (event) => formatDate(event.date), sortValue: (event) => event.date },
  {
    label: 'Number of Attendees',
    key: 'attendees',
    render: (event) => event.attendees?.length ?? 0,
    sortValue: (event) => event.attendees?.length ?? 0
  }
]

// Zip codes 
const zips = computed(() => zipData.value ?? [])
const zipLabels = computed(() => zips.value.map((item) => item._id))
const zipCounts = computed(() => zips.value.map((item) => item.count))

const zipColumns = [
  { label: 'Zip Code', key: '_id' },
  { label: 'Client Count', key: 'count' }
]
</script>
