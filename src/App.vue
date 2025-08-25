<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="max-h-screen p-4 md:flex md:items-center gap-4">
    <img alt="Vue logo" class="mx-auto md:m-0" src="@/assets/logo.svg" width="64" height="64" />
    <div class="flex-1">
      <h1 class="text-2xl font-semibold text-primary">Mi app</h1>
      <nav class="mt-2 text-sm flex gap-4">
        <RouterLink to="/" class="p-2 rounded hover:bg-surface-100">Home</RouterLink>
        <RouterLink to="/about" class="p-2 rounded hover:bg-surface-100">About</RouterLink>
        <RouterLink to="/login" class="p-2 rounded hover:bg-surface-100">Login</RouterLink>
      </nav>
    </div>
  </header>

  <main class="p-4">
    <RouterView />
  </main>
</template>

<style scoped></style>
