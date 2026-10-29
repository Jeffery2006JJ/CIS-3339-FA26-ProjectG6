<!-- Client intake form: lets an editor create a new client. -->
<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Client Intake Form</h1>
    <div class="px-10 py-20">
      <!-- @submit.prevent stops the page from reloading -->
      <form novalidate @submit.prevent="submitForm">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Personal Details</h2>

          <!-- First name -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">First Name</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="client.firstName"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.firstName.$error" class="text-red-500">First Name is required</span>
          </div>

          <!-- Middle name -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Middle Name</span>
              <input
                v-model="client.middleName"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>

          <!-- Last name -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Last Name</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="client.lastName"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.lastName.$error" class="text-red-500">Last Name is required</span>
          </div>

          <div></div>
          <!-- Email -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Email</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="client.email"
                type="email"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.email.$error" class="text-red-500">Valid Email is required</span>
          </div>

          <!-- Phone number -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Phone Number</span>
              <span style="color: #ff0000">*</span>
              <input
                v-model="client.phoneNumber.primary"
                type="text"
                inputmode="numeric"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <span v-if="v$.phoneNumber.primary.$error" class="text-red-500">{{ phoneError }}</span>
          </div>

          <!-- Alternate phone -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Alternative Phone Number</span>
              <input
                v-model="client.phoneNumber.alternate"
                type="text"
                inputmode="numeric"
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
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>
          <div></div>

          <div class="flex justify-between mt-10 mr-20">
            <button class="bg-red-700 text-white rounded disabled:opacity-50" type="submit" :disabled="saving">
              {{ saving ? 'Saving...' : 'Add Client' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
// MIGRATION NOTES (Options API -> Composition API)
// - [old data option] client -> reactive() object (nested fields stay reactive for v-model)
// - setup() { useVuelidate() } + validations() -> useVuelidate(rules, client)
//   (template paths changed from v$.client.firstName to v$.firstName)
// - [old methods option] submitForm -> plain function submitForm()
// - this.$router.push -> useRouter()
// - the three-level v-if chain for the phone error -> computed phoneError
// - toast.error(error) printed "[object Object]" -> toast.error(err.message);
//   the message itself is produced by the Axios interceptor
// - NEW: "saving" flag disables the button so a double-click can't create two clients
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required, email, numeric, minLength, maxLength } from '@vuelidate/validators'
import { createClient, messageFrom } from '../api/api'

const router = useRouter()
const toast = useToast()

const client = reactive({
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phoneNumber: { primary: '', alternate: '' },
  address: { line1: '', line2: '', city: '', county: '', zip: '' }
})

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

const saving = ref(false)

async function submitForm() {
  const valid = await v$.value.$validate()
  if (!valid) return

  saving.value = true
  try {
    const response = await createClient(client)
    toast.success(messageFrom(response, 'Client created'))
    router.push('/findclient')
  } catch (err) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}
</script>
