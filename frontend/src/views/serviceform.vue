<!-- Lets an editor create a new service. -->
<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Create Service</h1>
    <div class="px-10 py-20">
      <form novalidate @submit.prevent="handleSubmitForm">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Service Details</h2>
          <!-- Service name -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Service Name</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="service.name"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.name.$error" class="text-red-500">Service Name is required</span>
          </div>

          <!-- Description -->
          <div class="flex flex-col">
            <label>
              <span class="text-gray-700">Description:</span>
              <textarea
                v-model="service.description"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              ></textarea>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-10">
          <div></div>
          <!-- Status -->
          <fieldset class="flex flex-col">
            <legend class="text-gray-700">Service Status <span style="color: #ff0000">*</span></legend>
            <div class="mt-1">
              <label class="inline-flex items-center">
                <input v-model="service.status" type="radio" class="form-radio" value="Active" />
                <span class="ml-2">Active</span>
              </label>
              <label class="inline-flex items-center ml-6">
                <input v-model="service.status" type="radio" class="form-radio" value="Inactive" />
                <span class="ml-2">Inactive</span>
              </label>
            </div>
          </fieldset>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <div></div>
          <div class="flex justify-between mt-10 mr-20">
            <button class="bg-red-700 text-white rounded disabled:opacity-50" type="submit" :disabled="saving">
              {{ saving ? 'Saving...' : 'Add Service' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - [old data option] service -> reactive()
// - setup() { useVuelidate() } + validations() -> useVuelidate(rules, service)
//   (template paths changed from v$.service.name to v$.name)
// - [old methods option] handleSubmitForm -> plain async function
// - this.$router.push -> useRouter()
// - toast.error('Error creating new service:', error) passed the error as toast
//   *options*, so the message was lost -> toast.error(err.message)
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { createService, messageFrom } from '../api/api'

const router = useRouter()
const toast = useToast()

const service = reactive({
  name: '',
  description: '',
  status: 'Active'
})

const rules = { name: { required } }
const v$ = useVuelidate(rules, service)

const saving = ref(false)

async function handleSubmitForm() {
  const valid = await v$.value.$validate()
  if (!valid) return

  saving.value = true
  try {
    const response = await createService(service)
    toast.success(messageFrom(response, 'Service created'))
    router.push('/findservice')
  } catch (err) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}
</script>
