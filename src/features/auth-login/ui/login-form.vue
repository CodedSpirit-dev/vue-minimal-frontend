<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLogin } from '../model/useLogin';
import Button from '@shared/ui/volt/Button.vue';

const email = ref('');
const password = ref('');
const router = useRouter(); // Usa Vue Router para la redirección
const { loading, error, submit } = useLogin();

async function onSubmit() {
  try {
    await submit(email.value, password.value);
    // Redirige solo si no hay error
    const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
    router.push(redirect); // Usa `router.push` en lugar de `window.location.assign`
  } catch (e) {
    // Manejo de errores si es necesario
    console.error('Error during login:', e);
  }
}
</script>

<template>
  <form class="max-w-sm mx-auto p-4 space-y-3" @submit.prevent="onSubmit">
    <input v-model="email" type="email" placeholder="Email" class="w-full p-2 border rounded" required />
    <input v-model="password" type="password" placeholder="Contraseña" class="w-full p-2 border rounded" required />
    <Button type="submit" :label="loading ? 'Entrando...' : 'Entrar'" class="w-full" :disabled="loading" />
    <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
  </form>
</template>
