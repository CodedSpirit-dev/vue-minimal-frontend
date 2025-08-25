<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getUsers, deleteUser } from '@entities/user/api'
import type { User, Page } from '@entities/user/model/types'
import Button from '@shared/ui/volt/Button.vue'

const page = ref(1); const size = ref(10)
const data = ref<Page<User>>({ items: [], total: 0 })
const loading = ref(false); const error = ref('')

async function load() {
  loading.value = true; error.value = ''
  try { data.value = await getUsers({ page: page.value, size: size.value }) }
  catch (e: any) { error.value = e.message ?? 'Error' }
  finally { loading.value = false }
}
onMounted(load); watch([page, size], load)
async function remove(id: User['id']) { await deleteUser(id); await load() }
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center gap-2">
      <label>Tamaño</label>
      <select v-model.number="size" class="border rounded p-1">
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
      </select>
    </div>
    <div v-if="loading">Cargando</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <table v-else class="w-full border">
      <thead>
        <tr>
          <th class="p-2 text-left">Nombre</th>
          <th>Email</th>
          <th>Roles</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in data.items" :key="u.id" class="border-t">
          <td class="p-2">{{ u.userName }}</td>
          <td>{{ u.email }}</td>
          <td class="text-right">
            <Button label="Ver" class="mr-2" @click="$router.push({ name: 'user-detail', params: { id: u.id } })" />
            <Button label="Eliminar" @click="remove(u.id)" />
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex items-center gap-2">
      <Button label="Prev" :disabled="page === 1" @click="page--" />
      <span>Página {{ page }}</span>
      <Button label="Next" :disabled="page * size >= data.total" @click="page++" />
    </div>
  </section>
</template>
