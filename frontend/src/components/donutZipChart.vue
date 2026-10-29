<!-- Doughnut chart of clients per zip code (used on the dashboard). -->
<template>
  <div class="w-1/2">
    <canvas ref="canvas" class="p-10"></canvas>
  </div>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - props: { label, chartData }   -> defineProps()
// - this.$refs.zipChart           -> template ref: const canvas = ref(null)
// - async mounted()               -> onMounted()
// - NEW: watch() redraws when the data changes; onBeforeUnmount() destroys
//   the Chart.js instance so it doesn't leak between page visits
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  label: { type: Array, default: () => [] },
  chartData: { type: Array, default: () => [] }
})

const canvas = ref(null)
let chart = null

function draw() {
  if (chart) chart.destroy()
  chart = new Chart(canvas.value, {
    type: 'doughnut',
    data: {
      labels: props.label,
      datasets: [{ borderWidth: 1, data: props.chartData }]
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Clients by Zip Code' }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  })
}

onMounted(draw)
watch(() => [props.label, props.chartData], draw)
onBeforeUnmount(() => {
  if (chart) chart.destroy()
  chart = null
})
</script>
