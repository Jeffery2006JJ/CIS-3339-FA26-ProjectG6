<!-- Bar chart of event attendance (used on the dashboard). -->
<template>
  <div>
    <canvas ref="canvas" class="p-10"></canvas>
  </div>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - props: { label, chartData }          -> defineProps()
// - this.$refs.attendanceChart           -> template ref: const canvas = ref(null)
// - async mounted() { new Chart(...) }   -> onMounted()
// - NEW: watch() redraws the chart when the props change (the old version
//   only drew once, so new data never showed up)
// - NEW: onBeforeUnmount() destroys the chart so Chart.js doesn't leak or warn
//   "Canvas is already in use" when you leave and return to the dashboard
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Chart, registerables, Colors } from 'chart.js'

Chart.register(...registerables, Colors)

const props = defineProps({
  label: { type: Array, default: () => [] },
  chartData: { type: Array, default: () => [] }
})

const canvas = ref(null)
let chart = null

function draw() {
  if (chart) chart.destroy()
  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: props.label,
      datasets: [{ borderWidth: 1, data: props.chartData }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Attendance Chart' }
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
