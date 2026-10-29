<!--
  DataTable - one reusable table for every list in the app (F3).

  Props
    columns: [{ label, key, render?, sortable?, sortValue? }]
      label      header text
      key        field to show; dot paths work ("address.city")
      render     optional (row) => string for custom display text
      sortable   default true
      sortValue  optional (row) => value to sort by (defaults to the field value)
    rows:      array of records already loaded into the page
    pageSize:  rows per page (default 10)
    rowKey:    unique field for each row (default "_id")
    clickable: rows act like links and emit "row-click"
    emptyText: message shown when there are no rows

  Slots
    #cell-<key>="{ row, value }"  custom markup for one column (e.g. a remove button)

  Sorting and paging happen client-side. Clicking a header cycles
  ascending -> descending -> unsorted. Whenever the rows change (new search,
  cleared search) the table jumps back to page 1 so stale pages never show.
-->
<template>
  <div>
    <table class="min-w-full shadow-md rounded">
      <thead class="bg-gray-50 text-xl">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="p-4 text-left"
            :aria-sort="ariaSort(col)"
            scope="col"
          >
            <button
              v-if="isSortable(col)"
              type="button"
              class="sort-button inline-flex items-center gap-1 font-semibold"
              @click="toggleSort(col)"
            >
              {{ col.label }}
              <span class="text-sm text-gray-500" aria-hidden="true">{{ sortIcon(col) }}</span>
            </button>
            <span v-else>{{ col.label }}</span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-300">
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="p-6 text-center text-gray-500 italic">
            {{ emptyText }}
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="row in pagedRows"
            :key="row[rowKey]"
            :class="clickable ? 'data-row cursor-pointer' : ''"
            :tabindex="clickable ? 0 : undefined"
            @click="onRowClick(row)"
            @keydown.enter.self="onRowClick(row)"
          >
            <td v-for="col in columns" :key="col.key" class="p-2 text-left">
              <slot :name="`cell-${col.key}`" :row="row" :value="getValue(row, col.key)">
                {{ displayValue(row, col) }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="rows.length > 0" class="flex flex-wrap items-center justify-between gap-2 mt-3 text-sm">
      <span class="text-gray-600" aria-live="polite">
        Showing {{ firstShown }}-{{ lastShown }} of {{ rows.length }}
      </span>
      <div v-if="totalPages > 1" class="flex items-center gap-2">
        <button
          type="button"
          class="page-button border border-gray-300 rounded disabled:opacity-40"
          :disabled="page === 1"
          @click="page--"
        >
          Previous
        </button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button
          type="button"
          class="page-button border border-gray-300 rounded disabled:opacity-40"
          :disabled="page === totalPages"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  pageSize: { type: Number, default: 10 },
  rowKey: { type: String, default: '_id' },
  clickable: { type: Boolean, default: false },
  emptyText: { type: String, default: 'No results' }
})

const emit = defineEmits(['row-click'])

const sortKey = ref(null)
const sortDir = ref(null) // 'asc' | 'desc' | null
const page = ref(1)

// read "address.city" style paths
function getValue(row, key) {
  return key.split('.').reduce((obj, part) => (obj == null ? undefined : obj[part]), row)
}

function displayValue(row, col) {
  const value = col.render ? col.render(row) : getValue(row, col.key)
  return value ?? ''
}

function isSortable(col) {
  return col.sortable !== false
}

function toggleSort(col) {
  if (sortKey.value !== col.key) {
    sortKey.value = col.key
    sortDir.value = 'asc'
  } else if (sortDir.value === 'asc') {
    sortDir.value = 'desc'
  } else {
    sortKey.value = null
    sortDir.value = null
  }
  page.value = 1
}

function sortIcon(col) {
  if (sortKey.value !== col.key) return '↕'
  return sortDir.value === 'asc' ? '▲' : '▼'
}

function ariaSort(col) {
  if (sortKey.value !== col.key) return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}

function compare(a, b) {
  // empty values always go last
  const aEmpty = a === null || a === undefined || a === ''
  const bEmpty = b === null || b === undefined || b === ''
  if (aEmpty && bEmpty) return 0
  if (aEmpty) return 1
  if (bEmpty) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  const col = props.columns.find((c) => c.key === sortKey.value)
  if (!col) return props.rows
  const valueOf = (row) =>
    col.sortValue ? col.sortValue(row) : col.render ? col.render(row) : getValue(row, col.key)
  const isEmpty = (v) => v === null || v === undefined || v === ''
  const direction = sortDir.value === 'desc' ? -1 : 1
  return props.rows
    .map((row) => ({ row, value: valueOf(row) }))
    .sort((a, b) => {
      const result = compare(a.value, b.value)
      // empty values stay at the bottom in both directions
      return isEmpty(a.value) || isEmpty(b.value) ? result : result * direction
    })
    .map((item) => item.row)
})

function onRowClick(row) {
  if (props.clickable) emit('row-click', row)
}

const totalPages = computed(() => Math.max(1, Math.ceil(props.rows.length / props.pageSize)))

const pagedRows = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return sortedRows.value.slice(start, start + props.pageSize)
})

const firstShown = computed(() => (props.rows.length === 0 ? 0 : (page.value - 1) * props.pageSize + 1))
const lastShown = computed(() => Math.min(page.value * props.pageSize, props.rows.length))

// New data (search, clear, retry) -> start again on page 1
watch(
  () => props.rows,
  () => {
    page.value = 1
  }
)

// If rows shrink (e.g. a record was removed), never sit on a page that no longer exists
watch(totalPages, (total) => {
  if (page.value > total) page.value = total
})
</script>

<style scoped>
.data-row:hover,
.data-row:focus {
  background-color: rgba(255, 0, 0, 0.1);
  outline: none;
  transition: background-color 0.3s ease-in-out;
}
.data-row:focus-visible {
  outline: 2px solid #b91c1c;
  outline-offset: -2px;
}
.sort-button,
.page-button {
  padding: 4px 8px;
}
</style>
